  const $=id=>document.getElementById(id);
  const brl=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const today=()=>new Date().toISOString().slice(0,10);

  let animais=[
    {id:'007',nome:'Flora',raca:'Holandesa',prod:34.2,status:'Ótima',ccs:110,lactDias:18,peso:'542kg'},
    {id:'014',nome:'Mimosa',raca:'Jersey',prod:22.8,status:'Atenção',ccs:320,lactDias:87,peso:'460kg'},
    {id:'031',nome:'Joana',raca:'Girolando',prod:18.4,status:'CCS Alto',ccs:580,lactDias:210,peso:'498kg'},
    {id:'042',nome:'Serena',raca:'Holandesa',prod:31,status:'Ótima',ccs:95,lactDias:12,peso:'510kg'}
  ];
  let metricasGerais={producaoTotalDia:1847,vacasLactacao:62,mediaVaca:29.8,ccsMedio:248,scoreBenchmark:87,custoLitro:1.42};
  let rankingFazendas=[
    {nome:'Boa Esperança',producao:38.4,rank:'🥇'},{nome:'Sítio Três Irmãos',producao:35.9,rank:'🥈'},
    {nome:'Granja Santa Clara',producao:33.1,rank:'🥉'},{nome:'★ São Pedro (você)',producao:29.8,rank:'4º'},
    {nome:'Campo Verde Agro',producao:27.4,rank:'5º'}
  ];
  let transacoes=[
    {id:1,data:today(),descricao:'Venda de leite (cooperativa)',categoria:'Venda de Leite',tipo:'receita',valor:48500},
    {id:2,data:today(),descricao:'Compra de ração concentrada',categoria:'Alimentação',tipo:'despesa',valor:12400},
    {id:3,data:today(),descricao:'Assistência veterinária',categoria:'Sanidade',tipo:'despesa',valor:650},
    {id:4,data:today(),descricao:'Energia elétrica',categoria:'Energia',tipo:'despesa',valor:2420}
  ];
  let nextTransacaoId=5;
  let solicitacoes=[
    {id:1,data:today(),servico:'Visita veterinária',prestador:'Dr. Carlos Mendes',valor:280,status:'Confirmado',financeiro:false},
    {id:2,data:'2026-09-18',servico:'Ensilagem de milho',prestador:'Agro Máquinas Müller',valor:0,status:'Orçamento solicitado',financeiro:false}
  ];
  let cart=[];
  const PRECO_MEDIO_LITRO=2.47;

  const profissionais=[
    {id:'p1',tipo:'humanos',icon:'🩺',nome:'Dr. Carlos Mendes',servico:'Médico Veterinário',categoria:'Veterinária',distancia:12,preco:280,unidade:'visita',estrelas:4.9,avaliacoes:84,disponivel:'Hoje',descricao:'Clínica, sanidade, reprodução e atendimento de emergência em bovinos leiteiros.'},
    {id:'p2',tipo:'humanos',icon:'🌾',nome:'Eng. Roberto Alves',servico:'Engenheiro Agrônomo',categoria:'Agronomia',distancia:28,preco:220,unidade:'visita',estrelas:4.8,avaliacoes:61,disponivel:'Amanhã',descricao:'Pastagens, silagem, fertilidade do solo e planejamento forrageiro.'},
    {id:'p3',tipo:'humanos',icon:'🥛',nome:'Fernanda Lima',servico:'Zootecnista / Nutrição',categoria:'Nutrição',distancia:18,preco:240,unidade:'visita',estrelas:4.9,avaliacoes:46,disponivel:'Hoje',descricao:'Formulação de dietas, avaliação de silagem e desempenho do rebanho.'},
    {id:'p4',tipo:'humanos',icon:'🧬',nome:'Genética Sul',servico:'Inseminação artificial',categoria:'Reprodução',distancia:32,preco:95,unidade:'animal',estrelas:4.7,avaliacoes:98,disponivel:'Hoje',descricao:'Inseminação, protocolos reprodutivos e suporte em genética leiteira.'},
    {id:'p5',tipo:'humanos',icon:'🐄',nome:'Paulo Casqueamento',servico:'Casqueamento bovino',categoria:'Casqueamento',distancia:41,preco:75,unidade:'animal',estrelas:4.8,avaliacoes:112,disponivel:'19/09',descricao:'Casqueamento preventivo e corretivo para bovinos leiteiros.'},
    {id:'p6',tipo:'humanos',icon:'📊',nome:'Gestão Rural Norte',servico:'Consultoria em gestão',categoria:'Gestão',distancia:22,preco:350,unidade:'visita',estrelas:4.9,avaliacoes:39,disponivel:'20/09',descricao:'Custos, fluxo de caixa, indicadores, metas e gestão econômica da atividade.'}
  ];
  const maquinas=[
    {id:'m1',tipo:'maquinas',icon:'🌽',nome:'Agro Máquinas Müller',servico:'Ensilagem de milho',categoria:'Silagem',distancia:14,preco:950,unidade:'hora',estrelas:4.9,avaliacoes:72,disponivel:'18/09',descricao:'Ensiladeira autopropelida 6 linhas + operador. Capacidade aproximada 2,5 ha/h.'},
    {id:'m2',tipo:'maquinas',icon:'🚜',nome:'Serviços Becker',servico:'Plantio de milho',categoria:'Plantio',distancia:24,preco:420,unidade:'ha',estrelas:4.8,avaliacoes:55,disponivel:'15/09',descricao:'Trator e plantadeira pneumática 7 linhas. Plantio com taxa variável.'},
    {id:'m3',tipo:'maquinas',icon:'🏗️',nome:'Terraplanagem Três Irmãos',servico:'Retroescavadeira',categoria:'Terraplanagem',distancia:9,preco:290,unidade:'hora',estrelas:4.7,avaliacoes:103,disponivel:'Hoje',descricao:'Retroescavadeira com operador para valas, pátios, esterqueiras e manutenção.'},
    {id:'m4',tipo:'maquinas',icon:'🌱',nome:'Campo Forte',servico:'Distribuição de calcário',categoria:'Solo',distancia:31,preco:185,unidade:'ha',estrelas:4.6,avaliacoes:44,disponivel:'17/09',descricao:'Distribuidor autopropelido com taxa regulável e operador.'},
    {id:'m5',tipo:'maquinas',icon:'🚛',nome:'Transportes RuralSul',servico:'Transporte de silagem',categoria:'Silagem',distancia:20,preco:210,unidade:'hora',estrelas:4.8,avaliacoes:67,disponivel:'18/09',descricao:'Conjunto trator + carreta basculante para apoio à colheita de silagem.'},
    {id:'m6',tipo:'maquinas',icon:'🌿',nome:'AgroPulveriza',servico:'Pulverização',categoria:'Pulverização',distancia:46,preco:110,unidade:'ha',estrelas:4.7,avaliacoes:81,disponivel:'16/09',descricao:'Pulverizador autopropelido com GPS e controle de seções.'}
  ];
  const produtos=[
    {id:'racao22',icon:'🌾',nome:'Ração Lactação 22% · 40 kg',categoria:'Nutrição',loja:'Agropecuária Regional',preco:119.90,avaliacao:'4,8 ★',tag:'Mais vendido'},
    {id:'mineral',icon:'🧂',nome:'Núcleo mineral leite · 25 kg',categoria:'Nutrição',loja:'NutriBov',preco:164.50,avaliacao:'4,9 ★',tag:'Destaque'},
    {id:'presemente',icon:'🌽',nome:'Semente de milho silagem · 60 mil',categoria:'Sementes',loja:'Sementes Campo Sul',preco:689.00,avaliacao:'4,7 ★',tag:'Safra 26/27'},
    {id:'luva',icon:'🧤',nome:'Luva para ordenha · caixa 100 un.',categoria:'Ordenha',loja:'MilkShop',preco:42.90,avaliacao:'4,8 ★',tag:'Pronta entrega'},
    {id:'dip',icon:'🥛',nome:'Pós-dipping 20 L',categoria:'Ordenha',loja:'Higiene Leiteira',preco:298.00,avaliacao:'4,9 ★',tag:'CCS'},
    {id:'brinco',icon:'🏷️',nome:'Brinco identificação bovina · 25 un.',categoria:'Equipamentos',loja:'BovTag',preco:89.90,avaliacao:'4,6 ★',tag:'Identificação'},
    {id:'cerca',icon:'⚡',nome:'Eletrificador rural 120 km',categoria:'Equipamentos',loja:'Agro Elétrica',preco:879.00,avaliacao:'4,8 ★',tag:'Oferta'},
    {id:'bota',icon:'🥾',nome:'Bota PVC cano longo',categoria:'EPI',loja:'Campo Seguro',preco:79.90,avaliacao:'4,7 ★',tag:'EPI'},
    {id:'sanitario',icon:'🧪',nome:'Kit higiene e sanidade do úbere',categoria:'Sanidade',loja:'VetCampo',preco:239.00,avaliacao:'4,9 ★',tag:'Sanidade'},
    {id:'filtro',icon:'🔧',nome:'Filtro linha de leite · kit 50',categoria:'Ordenha',loja:'MilkParts',preco:138.00,avaliacao:'4,7 ★',tag:'Manutenção'},
    {id:'adubo',icon:'🌱',nome:'Fertilizante para pastagem · 50 kg',categoria:'Fertilizantes',loja:'FertiSul',preco:154.00,avaliacao:'4,6 ★',tag:'Pastagem'},
    {id:'balde',icon:'🪣',nome:'Balde amamentador 5 bicos',categoria:'Equipamentos',loja:'Bezerra Forte',preco:184.90,avaliacao:'4,8 ★',tag:'Bezerras'}
  ];

  function salvarTudo(){localStorage.setItem('leitebov_pitch_v2',JSON.stringify({animais,metricasGerais,rankingFazendas,transacoes,solicitacoes,cart,nextTransacaoId}))}
  function carregarDados(){
    try{
      const saved=localStorage.getItem('leitebov_pitch_v2');
      if(saved){const d=JSON.parse(saved);animais=d.animais||animais;metricasGerais=d.metricasGerais||metricasGerais;rankingFazendas=d.rankingFazendas||rankingFazendas;transacoes=d.transacoes||transacoes;solicitacoes=d.solicitacoes||solicitacoes;cart=d.cart||[];nextTransacaoId=d.nextTransacaoId||Math.max(...transacoes.map(t=>t.id),0)+1}
      else{
        const antigo=localStorage.getItem('leitebov_completo');
        if(antigo){const d=JSON.parse(antigo);animais=d.animais||animais;metricasGerais=d.metricasGerais||metricasGerais;rankingFazendas=d.rankingFazendas||rankingFazendas;transacoes=d.transacoes||transacoes;nextTransacaoId=Math.max(...transacoes.map(t=>t.id),0)+1}
      }
    }catch(e){console.warn('Dados locais não carregados',e)}
  }
  function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),2300)}
