(()=>{
  const clean=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const money=s=>{const m=String(s).match(/(?:r\$\s*)?([\d.]+(?:,\d{1,2})?)/i);return m?Number(m[1].replace(/\./g,'').replace(',','.')):NaN};
  const ptDate=(text)=>{const n=clean(text),d=new Date();if(n.includes('amanha'))d.setDate(d.getDate()+1);else if(n.includes('depois de amanha'))d.setDate(d.getDate()+2);else{const m=text.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);if(m){const y=m[3]?Number(m[3].length===2?'20'+m[3]:m[3]):d.getFullYear();return `${y}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`}}return d.toISOString().slice(0,10)};
  const category=t=>{const n=clean(t);if(/racao|silagem|milho|mineral|aliment/.test(n))return 'Alimentação';if(/veter|remedio|medic|sanidade|mastite/.test(n))return 'Sanidade';if(/insemin|reproduc/.test(n))return 'Reprodução';if(/energia|luz/.test(n))return 'Energia';if(/funcionario|salario|mao de obra/.test(n))return 'Mão de obra';if(/trator|maquina|servico|ensilagem/.test(n))return 'Máquinas e Serviços';if(/equipamento|ordenha/.test(n))return 'Equipamentos';return 'Outros'};

  const style=document.createElement('link');style.rel='stylesheet';style.href='assistant.css';document.head.appendChild(style);
  const wrap=document.createElement('div');wrap.innerHTML=`
    <button class="ai-fab" id="aiFab" title="Assistente LeiteBov">✨</button>
    <section class="ai-panel" id="aiPanel" aria-label="Assistente IA LeiteBov">
      <div class="ai-head"><div class="ai-head-main"><div class="ai-avatar">🐄</div><div><div class="ai-title">Assistente LeiteBov</div><div class="ai-status" id="aiStatus">pronto para lançar dados por texto ou voz</div></div></div><button class="ai-close" id="aiClose">×</button></div>
      <div class="ai-messages" id="aiMessages"></div>
      <div class="ai-suggestions"><button class="ai-chip">Registrar R$ 850 de ração</button><button class="ai-chip">Flora produziu 36 litros</button><button class="ai-chip">Resumo financeiro</button></div>
      <div class="ai-input-wrap"><button class="ai-icon-btn" id="aiMic" title="Falar">🎙️</button><input class="ai-input" id="aiInput" placeholder="Digite ou fale um lançamento..."><button class="ai-icon-btn ai-send" id="aiSend" title="Enviar">➤</button></div>
      <div class="ai-note">A voz usa o reconhecimento disponível no navegador. Revise lançamentos importantes.</div>
    </section>`;document.body.appendChild(wrap);

  const fab=document.getElementById('aiFab'),panel=document.getElementById('aiPanel'),msgs=document.getElementById('aiMessages'),input=document.getElementById('aiInput'),status=document.getElementById('aiStatus');
  const add=(text,who='bot')=>{const e=document.createElement('div');e.className=`ai-msg ${who}`;e.textContent=text;msgs.appendChild(e);msgs.scrollTop=msgs.scrollHeight};
  const totals=()=>{const r=transacoes.filter(x=>x.tipo==='receita').reduce((s,x)=>s+x.valor,0),d=transacoes.filter(x=>x.tipo==='despesa').reduce((s,x)=>s+x.valor,0);return {r,d,s:r-d}};
  const findAnimal=t=>animais.find(a=>clean(t).includes(clean(a.nome))||new RegExp(`(?:#|animal\\s*)${a.id}\\b`).test(clean(t)));
  const findProduct=t=>produtos.find(p=>clean(t).includes(clean(p.nome).split(' · ')[0])||clean(p.nome).split(' ').some(w=>w.length>5&&clean(t).includes(clean(w))));

  async function remoteAI(text){
    if(!window.LEITEBOV_AI_ENDPOINT)return null;
    try{const res=await fetch(window.LEITEBOV_AI_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,context:{metricasGerais,animais,transacoes:transacoes.slice(-20),solicitacoes,cart}})});if(!res.ok)return null;return await res.json()}catch(e){return null}
  }

  async function handle(text){
    text=String(text||'').trim();if(!text)return;add(text,'user');input.value='';
    const n=clean(text),animal=findAnimal(text);
    if(animal&&/(produziu|producao|litros|litro)/.test(n)){
      const mm=text.match(/(\d+(?:[,.]\d+)?)\s*(?:l|litro|litros)/i);if(mm){const v=Number(mm[1].replace(',','.')),dif=v-animal.prod;animal.prod=v;metricasGerais.producaoTotalDia=Math.max(0,Number(metricasGerais.producaoTotalDia)+dif);metricasGerais.mediaVaca=Number((metricasGerais.producaoTotalDia/metricasGerais.vacasLactacao).toFixed(1));salvarTudo();renderizarTudo();add(`✅ Produção de ${animal.nome} atualizada para ${v.toLocaleString('pt-BR')} L/dia.`);return}
    }
    if(/(despesa|gastei|paguei|compra|comprei|registrar|lancar|lance)/.test(n)&&!/(receita|recebi|venda)/.test(n)){
      const v=money(text);if(!isNaN(v)&&v>0){let desc=text.replace(/registrar|registre|lançar|lance|uma|despesa|de|r\$\s*[\d.,]+/gi,' ').replace(/\s+/g,' ').trim();if(!desc)desc='Lançamento via assistente';adicionarTransacao('despesa',ptDate(text),desc,category(text),v);salvarTudo();add(`✅ Despesa de ${brl(v)} registrada em ${category(text)}.`);return}
    }
    if(/(receita|recebi|venda|vendi)/.test(n)){
      const v=money(text);if(!isNaN(v)&&v>0){adicionarTransacao('receita',ptDate(text),'Receita via assistente',n.includes('leite')?'Venda de Leite':'Outros',v);salvarTudo();add(`✅ Receita de ${brl(v)} registrada.`);return}
    }
    if(/(solicitar|agendar|chamar|preciso).*?(veter|agron|zootec|casque|ensil|retro|trator|plantio|pulver)/.test(n)){
      const map=[['veter','Visita veterinária'],['agron','Assistência agronômica'],['zootec','Consultoria zootécnica'],['casque','Casqueamento bovino'],['ensil','Ensilagem de milho'],['retro','Retroescavadeira'],['trator','Serviço com trator'],['plantio','Plantio de milho'],['pulver','Pulverização']];const hit=map.find(([k])=>n.includes(k));const serv=hit?hit[1]:'Serviço solicitado';solicitacoes.push({id:Date.now(),data:ptDate(text),servico:serv,prestador:'Prestadores próximos',valor:0,status:'Orçamento solicitado',financeiro:false});salvarTudo();renderSolicitacoes();add(`✅ Solicitação de “${serv}” criada para ${new Date(ptDate(text)+'T12:00:00').toLocaleDateString('pt-BR')}.`);return
    }
    if(/(adicionar|colocar|comprar).*(carrinho)/.test(n)){
      const p=findProduct(text);if(p){addToCart(p.id);add(`✅ ${p.nome} adicionado ao carrinho.`);return}
    }
    if(/resumo.*finance|finance.*resumo|saldo|resultado/.test(n)){
      const t=totals();add(`📊 Resumo financeiro\nReceitas: ${brl(t.r)}\nDespesas: ${brl(t.d)}\nResultado: ${brl(t.s)}\nCusto estimado: ${brl(metricasGerais.custoLitro)}/L.`);return
    }
    if(/producao|rebanho|leite hoje|media por vaca/.test(n)){
      add(`🥛 Produção atual: ${Number(metricasGerais.producaoTotalDia).toLocaleString('pt-BR')} L/dia, com média de ${metricasGerais.mediaVaca} L/vaca e ${metricasGerais.vacasLactacao} vacas em lactação.`);return
    }
    const cloud=await remoteAI(text);if(cloud?.reply){add(cloud.reply);return}
    add('Posso lançar despesas e receitas, atualizar produção de animais, criar solicitações de serviço, adicionar produtos ao carrinho e responder resumos. Ex.: “registre R$ 1.250 de ração” ou “Flora produziu 36 litros”.');
  }

  fab.onclick=()=>panel.classList.toggle('open');document.getElementById('aiClose').onclick=()=>panel.classList.remove('open');document.getElementById('aiSend').onclick=()=>handle(input.value);input.addEventListener('keydown',e=>{if(e.key==='Enter')handle(input.value)});document.querySelectorAll('.ai-chip').forEach(c=>c.onclick=()=>handle(c.textContent));
  add('Olá! Eu sou o assistente do LeiteBov. Você pode alimentar o app falando ou digitando. Diga, por exemplo: “registre R$ 850 de ração” ou “Flora produziu 36 litros”.');

  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;const mic=document.getElementById('aiMic');
  if(SR){const rec=new SR();rec.lang='pt-BR';rec.interimResults=false;rec.continuous=false;rec.onstart=()=>{status.textContent='ouvindo...';mic.classList.add('ai-fab-listening')};rec.onend=()=>{status.textContent='pronto para lançar dados por texto ou voz';mic.classList.remove('ai-fab-listening')};rec.onerror=()=>{status.textContent='não consegui ouvir; tente novamente'};rec.onresult=e=>{const said=e.results[0][0].transcript;input.value=said;handle(said)};mic.onclick=()=>{try{rec.start()}catch(e){}}}else{mic.onclick=()=>add('Este navegador não oferece reconhecimento de voz. O chat por texto continua funcionando normalmente.');}
})();