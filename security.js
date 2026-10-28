import { createCipheriv, createDecipheriv, createHash, randomBytes, scrypt } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
export const derivePassword = promisify(scrypt);
export const digest = value => createHash('sha256').update(value).digest('hex');
export function encryption(root, db, production) {
  const keyPath=process.env.DATA_KEY_FILE || path.join(root,'.keys','data.key');
  if(production&&!process.env.DATA_KEY_FILE)throw Error('Produção exige DATA_KEY_FILE em armazenamento de segredos separado do banco.');
  if(!existsSync(keyPath)){
    // Nunca gere outra chave para um banco já criptografado.
    const encrypted=db.prepare("SELECT id FROM leads WHERE name LIKE 'e7:v1:%' LIMIT 1").get();
    if(production||encrypted)throw Error('Chave de dados ausente. Restaure a chave original; não é possível recriar os dados sem ela.');
    mkdirSync(path.dirname(keyPath),{recursive:true,mode:0o700});
    writeFileSync(keyPath,randomBytes(32),{flag:'wx',mode:0o600});
  }
  const key=readFileSync(keyPath);if(key.length!==32)throw Error('A chave de dados deve conter exatamente 32 bytes.');
  const enc=(value,scope)=>{const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(Buffer.from(scope));const ciphertext=Buffer.concat([cipher.update(String(value),'utf8'),cipher.final()]);return 'e7:v1:'+Buffer.concat([iv,cipher.getAuthTag(),ciphertext]).toString('base64');};
  const dec=(value,scope)=>{if(!String(value).startsWith('e7:v1:'))throw Error('Campo de CRM sem criptografia.');const b=Buffer.from(value.slice(6),'base64');const cipher=createDecipheriv('aes-256-gcm',key,b.subarray(0,12));cipher.setAAD(Buffer.from(scope));cipher.setAuthTag(b.subarray(12,28));return Buffer.concat([cipher.update(b.subarray(28)),cipher.final()]).toString('utf8');};
  const fields=['name','company','email','segment','notes'];
  const encode=(uid,field,value)=>enc(value,`lead:${uid}:${field}`);
  const decode=row=>({...row,...Object.fromEntries(fields.filter(f=>f in row).map(f=>[f,dec(row[f],`lead:${row.user_id}:${f}`)]))});
  // Atualização transacional; valida a chave antes de alterar qualquer linha.
  db.exec('BEGIN IMMEDIATE');let changed=false;
  try{
    for(const row of db.prepare('SELECT * FROM leads').all()){
      const encrypted={};for(const f of fields){if(row[f].startsWith('e7:v1:'))dec(row[f],`lead:${row.user_id}:${f}`);else{encrypted[f]=encode(row.user_id,f,row[f]);changed=true;}}
      for(const [f,v] of Object.entries(encrypted))db.prepare(`UPDATE leads SET ${f}=? WHERE id=?`).run(v,row.id);
    }
    db.exec('COMMIT');
  }catch(e){db.exec('ROLLBACK');throw e;}
  if(changed){db.exec('PRAGMA wal_checkpoint(TRUNCATE); VACUUM; PRAGMA wal_checkpoint(TRUNCATE);');}
  return {encode,decode};
}
export function limit(db,key,max,windowMs=900000){
  const hash=digest(key),now=Date.now();
  db.prepare('DELETE FROM security_limits WHERE expires<?').run(now);
  db.prepare('INSERT INTO security_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').run(hash,now+windowMs);
  return db.prepare('SELECT count FROM security_limits WHERE key=?').get(hash).count<=max;
}
