// Conteúdo didático adaptado do PDF fornecido. Exercícios e situações são complementos pedagógicos.
export const lessons = [
  {
    id:'proposito', title:'Prospecção com propósito', category:'Fundamentos', icon:'heart', minutes:4, pages:'1–2 e 18',
    summary:'Construa uma rotina consistente sem transformar pessoas em tentativas de contato.',
    objective:'Diferenciar uma abordagem relevante de uma sequência mecânica de mensagens.',
    sections:[
      {title:'A confiança vem antes da proposta',text:'Prospectar é conectar pessoas, entender desafios e apresentar soluções de embalagens, displays, cartelas e materiais para PDV. Nem todo contato precisa pedir uma reunião ou vender. Uma conversa útil também pode construir confiança.'},
      {title:'Os três pilares da rotina',items:['Consistência: cada lead tem um próximo passo registrado e uma abordagem planejada.','Relevância: cada contato leva contexto, informação útil ou uma pergunta genuína.','Relacionamento: respeite o tempo do cliente e construa confiança antes da proposta.']},
      {title:'Do contato à conversa',text:'Use a sequência ouvir → entender → contribuir → construir confiança. O objetivo não é apenas aumentar o número de tentativas: é tornar cada interação mais útil para a pessoa.'}
    ],
    example:{context:'Você encontrou uma empresa do segmento de cosméticos.',good:'Pesquisar uma aplicação relevante e perguntar quem acompanha o desenvolvimento de embalagens.',avoid:'Enviar o mesmo catálogo e pedido de reunião para todos os contatos da empresa.'},
    practice:'Escolha um lead fictício. Anote um contexto da empresa, uma possível necessidade e uma pergunta que você faria antes de oferecer uma solução.',
    quiz:{question:'Qual ação combina os três pilares de uma boa cadência?',options:['Repetir a mesma mensagem diariamente até receber uma resposta.','Registrar um próximo passo e levar uma pergunta útil ligada ao contexto do lead.','Pedir uma proposta comercial em todo contato.'],answer:1,explanation:'Consistência exige planejamento; relevância exige contexto; relacionamento exige respeito. Uma pergunta útil com um próximo passo reúne os três.'}
  },
  {
    id:'canais',title:'O canal certo para cada conversa',category:'Canais',icon:'message',minutes:5,pages:'3 e 5–7',
    summary:'Saiba quando usar e-mail, LinkedIn, WhatsApp e telefone.',
    objective:'Escolher o canal pelo contexto e pela preferência da pessoa, não pela facilidade de disparo.',
    sections:[
      {title:'Quatro canais, papéis diferentes',items:['E-mail: apresentações, conteúdo, catálogos, materiais e propostas.','LinkedIn: conhecer o profissional, acompanhar a empresa e interagir com critério.','WhatsApp: mensagens breves e personalizadas quando o contato for apropriado.','Telefone: ouvir prioridades, esclarecer dúvidas e combinar próximos passos.']},
      {title:'No LinkedIn, conheça antes de abordar',text:'Identifique pessoas de Compras, Suprimentos, Marketing, Trade e Desenvolvimento de Embalagens. Observe cargo e contexto. Interaja quando houver algo relevante a acrescentar; evite apresentações longas e mensagens genéricas em massa.'},
      {title:'Conteúdo que pede licença',text:'Não envie o mesmo catálogo para todos os segmentos. Use imagens ou projetos autorizados e relacione a referência à proteção, montagem, exposição no PDV ou logística. Quando apropriado, pergunte se a pessoa deseja recebê-la.'}
    ],
    example:{context:'Você encontrou uma referência visual alinhada ao segmento do lead.',good:'“Olá, [Nome]! Vi uma aplicação de embalagem que pode ter relação com seu segmento. Posso compartilhar uma referência visual para você avaliar quando for oportuno?”',avoid:'Enviar vários arquivos sem contexto, sem verificar a preferência de canal.'},
    practice:'Para um lead fictício, escolha um canal e escreva uma frase explicando por que ele faz sentido. Depois adapte uma referência ao segmento da empresa.',
    quiz:{question:'Qual é o melhor uso do telefone nessa abordagem?',options:['Repetir o catálogo inteiro sem abrir espaço para perguntas.','Cobrar uma resposta que não chegou no WhatsApp.','Ouvir prioridades, esclarecer dúvidas e combinar um próximo passo.'],answer:2,explanation:'No guia, o telefone é um espaço de escuta e alinhamento. A preferência da pessoa continua valendo em qualquer canal.'}
  },
  {
    id:'primeiro-contato',title:'Cadência A: o primeiro contato',category:'Cadências',icon:'flow',minutes:5,pages:'4–7',
    summary:'Conheça as cinco interações em dez dias para iniciar uma relação.',
    objective:'Planejar uma primeira aproximação com progressão de contexto e valor.',
    sections:[
      {title:'Uma proposta de cinco interações',items:['Dia 1 · E-mail: apresente a Escala 7 e pergunte sobre o responsável.','Dia 3 · LinkedIn: faça uma conexão personalizada, sem apresentação comercial longa.','Dia 5 · Conteúdo: compartilhe uma aplicação de embalagem ou display alinhada ao segmento, quando apropriado.','Dia 7 · Aproximação: pergunte sobre as prioridades da área, sem cobrar retorno.','Dia 10 · Ligação: escute demandas e proponha um próximo passo, se fizer sentido.']},
      {title:'O e-mail de apresentação',text:'Um assunto possível é “Escala 7 | Embalagens para [Empresa]”. Apresente o trabalho com desenvolvimento e fabricação de embalagens, displays e materiais para PDV. Pergunte se o contato acompanha o tema ou pode indicar a pessoa responsável.'},
      {title:'O calendário é uma referência',text:'Esses intervalos organizam a rotina; não justificam insistência. Ajuste a sequência ao contexto, às respostas e à preferência registrada. Pedido de pausa ou de não contato tem prioridade sobre a próxima etapa.'}
    ],
    example:{context:'Chegou o dia 7 e você quer se aproximar.',good:'“Como estão as coisas por aí com as prioridades da equipe?”',avoid:'“Já enviei meu material três vezes. Quando você vai responder?”'},
    practice:'Monte os cinco próximos passos para uma empresa fictícia. Em cada um, registre canal, motivo e valor para o cliente. Não programe envios reais para realizar este exercício.',
    quiz:{question:'O que caracteriza a interação do dia 5?',options:['Conteúdo alinhado ao segmento e às necessidades do lead.','Um catálogo idêntico para todas as empresas.','Um pedido urgente de reunião, mesmo sem contexto.'],answer:0,explanation:'O dia 5 leva conteúdo que ajuda. A referência precisa fazer sentido para o segmento e respeitar autorização e preferência de contato.'}
  },
  {
    id:'followup',title:'Follow-up humano, na prática',category:'Relacionamento',icon:'users',minutes:6,pages:'8–11',
    summary:'Retome conversas com interesse legítimo, escuta e respeito.',
    objective:'Escrever follow-ups que contribuam sem cobrar uma resposta ou forçar intimidade.',
    sections:[
      {title:'Aproximação não é insistência disfarçada',text:'Retome algo que a pessoa comentou, reconheça prioridades e respeite o tempo dela. Evite “só passando para cobrar”, elogios artificiais, intimidade forçada e insistência após silêncio ou pedido de não contato.'},
      {title:'Cinco atitudes de um contato genuíno',items:['Lembrar: retome contexto que o cliente compartilhou e que é adequado mencionar.','Escutar: pergunte sobre desafios, prioridades e o melhor momento.','Reconhecer: valorize uma iniciativa real, sem elogio automático.','Contribuir: ofereça algo útil sem exigir resposta como contrapartida.','Respeitar: diminua a frequência, pause ou encerre quando necessário.']},
      {title:'Situações para adaptar a abordagem',items:['Após uma conversa: retome o tema e um desafio real antes de oferecer algo útil.','Sem projeto no momento: reconheça o planejamento e deixe espaço para retomar com calma.','Após uma feira: pergunte como foi o evento e proponha trocar ideias sobre o mercado.','Após uma publicação: mencione um detalhe real da iniciativa e faça uma pergunta autêntica.']}
    ],
    example:{context:'Depois de uma conversa sobre logística de embalagens.',good:'“Oi, [Nome]! Gostei da nossa conversa sobre [tema]. Fiquei pensando no ponto que você comentou sobre [desafio]. Se eu encontrar algo útil, posso te enviar?”',avoid:'“Olá, sumido! Só passando para cobrar aquele orçamento.”'},
    practice:'Reescreva um follow-up que começa com cobrança. Inclua um contexto verdadeiro, uma contribuição possível e espaço para a pessoa escolher o melhor momento.',
    quiz:{question:'O lead pediu que você não entre mais em contato. O que fazer?',options:['Mudar de canal para continuar a sequência.','Registrar o pedido e encerrar os contatos.','Enviar uma última oferta urgente para tentar reverter.'],answer:1,explanation:'Respeitar inclui encerrar contatos quando solicitado. Trocar de canal para contornar o pedido contraria o princípio do follow-up humano.'}
  },
  {
    id:'valor',title:'Seis ferramentas de relacionamento',category:'Relacionamento',icon:'heart',minutes:5,pages:'12–13',
    summary:'Necessidade, diferenciais, prova social, valor, proximidade e presença.',
    objective:'Usar perguntas e referências para descobrir a necessidade real antes de apresentar diferenciais.',
    sections:[
      {title:'Escolha a ferramenta pelo estágio do lead',items:['Necessidade: descubra os desafios da embalagem atual.','Diferenciais: mostre recursos relacionados à demanda identificada.','Prova social: compartilhe referências reais e autorizadas.','Valor: traga ideias sobre acabamento, exposição e logística.','Proximidade: entenda pessoas, rotinas e critérios de decisão.','Presença: continue relevante sem se tornar invasivo.']},
      {title:'Perguntas que abrem espaço',text:'Uma pergunta de diagnóstico: “Hoje, o que mais pesa para vocês numa embalagem: proteção, apresentação, montagem ou logística?”. Para o próximo passo: “Se fizesse sentido revisar um aspecto da embalagem atual, qual traria mais valor para a equipe?”. Escute a resposta antes de escolher o material a apresentar.'}
    ],
    example:{context:'O cliente relata dificuldades de montagem no ponto de venda.',good:'Investigar como a montagem funciona e selecionar uma referência autorizada ligada a esse desafio.',avoid:'Apresentar apenas acabamento premium, sem relação com a dificuldade relatada.'},
    practice:'Escolha um dos quatro desafios: proteção, apresentação, montagem ou logística. Escreva uma pergunta aberta e indique qual ferramenta de relacionamento usaria depois da resposta.',
    quiz:{question:'O que torna uma prova social adequada?',options:['Uma referência real e autorizada, relacionada ao desafio do lead.','O nome de um cliente famoso, mesmo sem autorização.','Uma história inventada para tornar a oferta mais convincente.'],answer:0,explanation:'O guia orienta usar referências reais e autorizadas. A prova social deve contribuir para a necessidade concreta, sem inventar resultados ou expor projetos sem permissão.'}
  },
  {
    id:'segunda-conversa',title:'Cadência B: entre duas conversas',category:'Cadências',icon:'flow',minutes:5,pages:'14',
    summary:'Mantenha o contexto vivo entre a primeira conversa e o próximo encontro.',
    objective:'Organizar retornos que partem do que já foi discutido com o cliente.',
    sections:[
      {title:'Uma jornada de dezesseis dias',items:['Dia 0 · Conversa: entenda necessidades, responsáveis e combine o retorno.','Dia 2 · Contexto: faça uma pergunta útil reconhecendo o que foi discutido.','Dia 5 · E-mail: envie conteúdo e diferenciais ligados à demanda.','Dia 8 · LinkedIn: faça uma interação autêntica ou mensagem de aproximação.','Dia 12 · Ligação: alinhe prioridades com escuta e sem pressão.','Dia 16 · Conversa 2: revise oportunidades e defina o próximo passo em conjunto.']},
      {title:'O contexto é o elo entre as etapas',text:'Registre o que foi conversado, quem participa da decisão e o retorno combinado. Se a pessoa mudar de prioridade ou pedir outro momento, ajuste o plano. O segundo encontro deve revisar oportunidades que façam sentido para os dois lados.'}
    ],
    example:{context:'Na primeira conversa, a pessoa mencionou perdas no transporte.',good:'Retomar o problema de proteção e selecionar conteúdo relacionado à demanda para o dia 5.',avoid:'Reiniciar a apresentação da empresa em cada contato e ignorar o histórico.'},
    practice:'Escreva uma nota do dia 0 com necessidade, responsáveis e retorno combinado. Use essa nota para formular a pergunta do dia 2 e o objetivo da conversa do dia 16.',
    quiz:{question:'O que deve orientar o conteúdo enviado no dia 5 da cadência B?',options:['O material promocional mais recente, qualquer que seja o tema.','A demanda discutida na primeira conversa.','A necessidade de completar uma quantidade de envios.'],answer:1,explanation:'O dia 5 conecta conteúdo e diferenciais à demanda já discutida. O histórico evita que a conversa recomece do zero a cada etapa.'}
  },
  {
    id:'nutricao',title:'Nutrir sem insistir',category:'Relacionamento',icon:'message',minutes:4,pages:'9 e 15',
    summary:'Aprenda a lidar com leads que não têm demanda no momento.',
    objective:'Combinar preferências e retornos pertinentes sem criar urgência inexistente.',
    sections:[
      {title:'Sem demanda não significa convite para insistir',text:'Reconheça a fase do cliente e agradeça a transparência. Pergunte se ele prefere um retorno em outro momento ou apenas alguma novidade realmente relevante. Registre a resposta, em vez de presumir que o silêncio autoriza uma nova abordagem.'},
      {title:'Nutrição com respeito',items:['Registre a preferência de contato e o canal adequado.','Faça retornos ocasionais e pertinentes quando combinados.','Não atribua urgência inexistente nem force uma reunião.','Pause ou encerre contatos conforme a vontade expressa pela pessoa.']}
    ],
    example:{context:'O lead explica que não tem projeto previsto neste semestre.',good:'“Obrigado pela transparência, [Nome]. Entendo que agora não seja prioridade. Prefere que eu retome em outro momento ou te compartilhe apenas alguma novidade realmente relevante?”',avoid:'“Essa condição termina hoje. Vamos marcar mesmo assim?”'},
    practice:'Redija uma resposta para um lead sem demanda. Ofereça uma escolha de preferência, sem sugerir que a pessoa deve aceitar algum retorno.',
    quiz:{question:'Como agir quando um lead diz que agora não é prioridade?',options:['Aumentar a frequência para não ser esquecido.','Criar urgência para antecipar a decisão.','Reconhecer o momento e perguntar qual preferência de contato deseja registrar.'],answer:2,explanation:'A nutrição respeita o planejamento da pessoa. Retornos precisam ser pertinentes e alinhados à preferência registrada, sem pressão artificial.'}
  },
  {
    id:'crm-checklist',title:'CRM e o checklist do bom contato',category:'Rotina comercial',icon:'check',minutes:5,pages:'16–17',
    summary:'Transforme contexto e escuta em próximos passos bem registrados.',
    objective:'Registrar qualidade de relação e verificar se um contato faz sentido antes de realizá-lo.',
    sections:[
      {title:'O que vale acompanhar no CRM',items:['Contexto: área, segmento, aplicação de embalagem e interesse.','Histórico: o que foi conversado e o que a pessoa autorizou receber.','Próxima ação: canal, data combinada e motivo do próximo contato.','Sinais: respostas, interesse, necessidades e avanço de etapa.','Limites: preferência de canal, pausa e pedido de não contato.']},
      {title:'Antes de cada contato, faça cinco perguntas',items:['Tenho uma razão real para entrar em contato?','A mensagem respeita o contexto e a agenda do cliente?','Estou contribuindo ou apenas cobrando resposta?','A comunicação soa como uma pessoa, não como um disparo?','O CRM mostra o próximo passo e a preferência do lead?']},
      {title:'Qualidade além de volume',text:'Contar tentativas não explica se existe uma relação. Registre o que você aprendeu, os sinais de interesse e o que foi combinado. Na plataforma, use o contexto da ficha, as preferências e o histórico para preparar a próxima conversa.'}
    ],
    example:{context:'Você acabou de conversar com uma pessoa de Compras.',good:'Registrar a necessidade relatada, o conteúdo autorizado, o canal preferido e o retorno combinado.',avoid:'Registrar apenas “liguei” e criar outra tarefa sem motivo ou data combinada.'},
    practice:'Em um cenário fictício, redija uma nota com os cinco campos do CRM. Depois aplique o checklist antes de definir o próximo contato.',
    quiz:{question:'Qual registro prepara melhor a próxima conversa?',options:['“Mais uma tentativa realizada.”','“Enviar algo depois.”','“Prioridade: proteção no transporte; autorizou referência por e-mail; retorno combinado para terça.”'],answer:2,explanation:'Um registro útil combina contexto, autorização, preferência e próximo passo. Assim, a cadência preserva a escuta em vez de apenas acumular tentativas.'}
  }
];
export function learningContent(db, userId) {
  const completed = new Map(db.prepare('SELECT lesson_id, completed_at FROM learning_progress WHERE user_id=?').all(userId).map(row=>[row.lesson_id,row.completed_at]));
  return lessons.map(({quiz,...lesson})=>({...lesson,quiz:{question:quiz.question,options:quiz.options},completed_at:completed.get(lesson.id)||null}));
}
