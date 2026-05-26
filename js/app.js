/* BoviControl — App v2.0 */

// ── ESTADO ──
var DB_KEY = 'bovicontrol_data';
var lotes = [
  { desc: 'Lote 1', cab: 0, peso: 0, at: 0, pcab: 0 },
  { desc: 'Lote 2', cab: 0, peso: 0, at: 0, pcab: 0 }
];
var gastos = [
  { cat: 'ALIMENTACAO', items: [
    { desc: 'Racao / Concentrado', v: 0, q: 1 },
    { desc: 'Sal Mineral', v: 0, q: 1 },
    { desc: 'Pastagem / Silagem', v: 0, q: 1 },
    { desc: 'Outros alimentacao', v: 0, q: 1 }
  ]},
  { cat: 'SANIDADE', items: [
    { desc: 'Vacinas', v: 0, q: 1 },
    { desc: 'Vermifugos', v: 0, q: 1 },
    { desc: 'Medicamentos', v: 0, q: 1 },
    { desc: 'Veterinario', v: 0, q: 1 }
  ]},
  { cat: 'TRANSPORTE', items: [
    { desc: 'Frete compra', v: 0, q: 1 },
    { desc: 'Frete venda', v: 0, q: 1 }
  ]},
  { cat: 'OUTROS', items: [
    { desc: 'Mao de obra', v: 0, q: 1 },
    { desc: 'Energia / agua', v: 0, q: 1 },
    { desc: 'Manutencao', v: 0, q: 1 },
    { desc: 'Impostos / taxas', v: 0, q: 1 },
    { desc: 'Outros', v: 0, q: 1 }
  ]}
];
var venda = { cab: 0, peso: 0, at: 0, pcab: 0 };
var atBoi = null;
var apiKey = '';

// ── PERSISTENCIA ──
function salvarDados() {
  try {
    var data = {
      lotes: lotes,
      gastos: gastos,
      venda: venda,
      atBoi: atBoi,
      ultimaSalva: new Date().toISOString()
    };
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  } catch (e) {
    // localStorage indisponivel
  }
}

function carregarDados() {
  try {
    var raw = localStorage.getItem(DB_KEY);
    if (!raw) return;
    var data = JSON.parse(raw);
    if (data.lotes && Array.isArray(data.lotes)) lotes = data.lotes;
    if (data.gastos && Array.isArray(data.gastos)) gastos = data.gastos;
    if (data.venda) venda = data.venda;
    if (data.atBoi) atBoi = data.atBoi;
  } catch (e) {
    // dados corrompidos
  }
}

// ── TOAST ──
function toast(msg, tipo) {
  var existing = document.querySelectorAll('.toast');
  existing.forEach(function(t) { t.remove(); });
  var div = document.createElement('div');
  div.className = 'toast ' + (tipo || 'info');
  var icons = { success: '\u2714', error: '\u2716', info: '\u2139' };
  div.innerHTML = '<span>' + (icons[tipo] || icons.info) + '</span> ' + msg;
  document.body.appendChild(div);
  setTimeout(function() { div.remove(); }, 3000);
}

// ── CHAVE API ──
function salvarChave() {
  var v = document.getElementById('api-key-inp').value.trim();
  if (v.startsWith('sk-ant-') || v.startsWith('sk-')) {
    apiKey = v;
    try { localStorage.setItem('bovi_key', v); } catch (e) {}
    document.getElementById('key-status').textContent = '\u2713 Ativa';
    document.getElementById('key-status').className = 'key-ok sim';
    toast('Chave API salva com sucesso!', 'success');
  } else if (v === '') {
    apiKey = '';
    document.getElementById('key-status').textContent = 'Sem chave';
    document.getElementById('key-status').className = 'key-ok nao';
  } else {
    apiKey = '';
    document.getElementById('key-status').textContent = 'Invalida';
    document.getElementById('key-status').className = 'key-ok nao';
  }
}

function carregarChave() {
  try {
    var saved = localStorage.getItem('bovi_key');
    if (saved) {
      apiKey = saved;
      document.getElementById('api-key-inp').value = saved;
      salvarChave();
    }
  } catch (e) {}
}

// ── TABS ──
function goTab(n, el) {
  document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
  el.classList.add('active');
  document.getElementById('panel-' + n).classList.add('active');
  if (n === 'venda') calcVenda();
}

// ── FORMATO ──
function R(v) {
  return 'R$ ' + (v || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ── COMPRA ──
function custoLote(l) {
  if (l.pcab > 0) return l.cab * l.pcab;
  if (l.at > 0) return l.cab * l.peso * l.at;
  return 0;
}

function renderCompra() {
  var tb = document.getElementById('tb-compra');
  tb.innerHTML = '';
  lotes.forEach(function(l, i) {
    var c = custoLote(l);
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td><input type="text" value="' + l.desc + '" oninput="lotes[' + i + '].desc=this.value;salvarDados()" style="min-width:75px" aria-label="Nome do lote"></td>' +
      '<td><input type="number" value="' + (l.cab || '') + '" placeholder="0" oninput="lotes[' + i + '].cab=+this.value;renderCompra();resumo();salvarDados()" style="min-width:55px" aria-label="Cabecas"></td>' +
      '<td><input type="number" value="' + (l.peso || '') + '" placeholder="0" oninput="lotes[' + i + '].peso=+this.value;renderCompra();resumo();salvarDados()" style="min-width:55px" aria-label="Peso em arrobas"></td>' +
      '<td><input type="number" value="' + (l.at || '') + '" placeholder="0" oninput="lotes[' + i + '].at=+this.value;lotes[' + i + '].pcab=0;renderCompra();resumo();salvarDados()" style="min-width:65px" aria-label="Preco por arroba"></td>' +
      '<td><input type="number" value="' + (l.pcab || '') + '" placeholder="0" oninput="lotes[' + i + '].pcab=+this.value;lotes[' + i + '].at=0;renderCompra();resumo();salvarDados()" style="min-width:65px" aria-label="Preco por cabeca"></td>' +
      '<td class="mono ' + (c > 0 ? 'pos' : '') + '">' + R(c) + '</td>' +
      '<td><button class="del-btn" onclick="removeLote(' + i + ')" title="Remover lote" aria-label="Remover lote">\u2715</button></td>';
    tb.appendChild(tr);
  });
  var tc = lotes.reduce(function(s, l) { return s + (l.cab || 0); }, 0);
  var tt = lotes.reduce(function(s, l) { return s + custoLote(l); }, 0);
  document.getElementById('tot-cab').textContent = tc;
  document.getElementById('tot-custo').textContent = R(tt);
}

function addLote() {
  lotes.push({ desc: 'Lote ' + (lotes.length + 1), cab: 0, peso: 0, at: 0, pcab: 0 });
  renderCompra();
  salvarDados();
  toast('Lote adicionado', 'success');
}

function removeLote(i) {
  var nome = lotes[i].desc;
  lotes.splice(i, 1);
  renderCompra();
  resumo();
  salvarDados();
  toast('Lote "' + nome + '" removido', 'info');
}

// ── GASTOS ──
function renderGastos() {
  var tb = document.getElementById('tb-gastos');
  tb.innerHTML = '';
  var grand = 0;
  gastos.forEach(function(cat, ci) {
    var hdr = document.createElement('tr');
    hdr.className = 'sec-lbl';
    hdr.innerHTML = '<td colspan="4">' + cat.cat + '</td>';
    tb.appendChild(hdr);
    var sub = 0;
    cat.items.forEach(function(item, ii) {
      var tot = (item.v || 0) * (item.q || 1);
      sub += tot;
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td style="padding-left:20px;color:var(--mut)">\u21B3 ' + item.desc + '</td>' +
        '<td><input type="number" value="' + (item.v || '') + '" placeholder="0" oninput="gastos[' + ci + '].items[' + ii + '].v=+this.value;renderGastos();resumo();salvarDados()" style="min-width:80px" aria-label="Valor unitario"></td>' +
        '<td><input type="number" value="' + (item.q || 1) + '" placeholder="1" oninput="gastos[' + ci + '].items[' + ii + '].q=+this.value;renderGastos();resumo();salvarDados()" style="min-width:45px" aria-label="Quantidade"></td>' +
        '<td class="mono">' + R(tot) + '</td>';
      tb.appendChild(tr);
    });
    grand += sub;
    var st = document.createElement('tr');
    st.className = 'sub-row';
    st.innerHTML = '<td style="padding-left:10px">Subtotal ' + cat.cat + '</td><td></td><td></td><td class="mono">' + R(sub) + '</td>';
    tb.appendChild(st);
  });
  document.getElementById('tot-gastos').textContent = R(grand);
}

// ── RESUMO ──
function totalGastos() {
  return gastos.reduce(function(s, c) {
    return s + c.items.reduce(function(ss, i) {
      return ss + (i.v || 0) * (i.q || 1);
    }, 0);
  }, 0);
}

function totalCompra() {
  return lotes.reduce(function(s, l) { return s + custoLote(l); }, 0);
}

function resumo() {
  var cab = lotes.reduce(function(s, l) { return s + (l.cab || 0); }, 0);
  var comp = totalCompra();
  var gast = totalGastos();
  document.getElementById('s-cab').textContent = cab;
  document.getElementById('s-compra').textContent = R(comp);
  document.getElementById('s-gastos').textContent = R(gast);
  var rec = calcRecTotal();
  var custo = comp + gast;
  var lucro = rec - custo;
  var roi = custo > 0 ? lucro / custo * 100 : 0;
  var el = document.getElementById('s-lucro');
  el.textContent = R(lucro);
  el.className = 'sum-val ' + (lucro > 0 ? 'pos' : lucro < 0 ? 'neg' : '');
  document.getElementById('s-roi').textContent = 'ROI: ' + roi.toFixed(1).replace('.', ',') + '%';
}

function calcRecTotal() {
  var cab = venda.cab || 0;
  var peso = venda.peso || 0;
  var at = venda.at || 0;
  var pcab = venda.pcab || 0;
  return Math.max(cab * peso * at, cab * pcab);
}

function calcVenda() {
  venda.cab = +(document.getElementById('v-cab').value) || 0;
  venda.peso = +(document.getElementById('v-peso').value) || 0;
  venda.at = +(document.getElementById('v-at').value) || 0;
  venda.pcab = +(document.getElementById('v-pcab').value) || 0;
  salvarDados();

  var cab = venda.cab, peso = venda.peso, at = venda.at, pcab = venda.pcab;
  var rAt = cab * peso * at;
  var rCab = cab * pcab;
  var rTot = Math.max(rAt, rCab);
  document.getElementById('r-at').textContent = R(rAt);
  document.getElementById('r-cab').textContent = R(rCab);
  document.getElementById('r-total').textContent = R(rTot);

  var comp = totalCompra();
  var gast = totalGastos();
  var ct = comp + gast;
  var lucro = rTot - ct;
  var margem = rTot > 0 ? lucro / rTot * 100 : 0;
  var roi = ct > 0 ? lucro / ct * 100 : 0;

  document.getElementById('r-compra').textContent = R(comp);
  document.getElementById('r-gast').textContent = R(gast);
  document.getElementById('r-ctotal').textContent = R(ct);
  document.getElementById('r-lucro').textContent = R(lucro);
  document.getElementById('r-margem').textContent = margem.toFixed(1).replace('.', ',') + '%';
  document.getElementById('r-roi2').textContent = roi.toFixed(1).replace('.', ',') + '%';

  var rv = document.getElementById('rb-val');
  rv.textContent = R(lucro);
  rv.className = 'rb-val ' + (lucro > 0 ? 'pos' : lucro < 0 ? 'neg' : '');
  document.getElementById('rb-sub').textContent =
    lucro > 0 ? 'Lucro \u00B7 ROI ' + roi.toFixed(1) + '%' :
    lucro < 0 ? 'Prejuizo \u00B7 Margem ' + margem.toFixed(1) + '%' :
    'Preencha os dados';
  resumo();
}

// ── COTACAO VIA SCRAPING PUBLICO ──
async function atualizarCotacao() {
  if (document.getElementById('btn-cot').disabled) return;
  var btn = document.getElementById('btn-cot');
  var ic = document.getElementById('ic-cot');
  var dot = document.getElementById('h-dot');
  btn.disabled = true;
  ic.classList.add('spin');
  dot.className = 'dot busy';
  document.getElementById('cot-status').textContent = 'Buscando cotacao...';
  document.getElementById('h-preco').textContent = '\u00B7\u00B7\u00B7';

  var fontes = [
    {
      url: 'https://api.allorigins.win/get?url=' + encodeURIComponent('https://www.cepea.esalq.usp.br/br/indicador/boi-gordo.aspx'),
      nome: 'CEPEA/ESALQ'
    },
    {
      url: 'https://api.allorigins.win/get?url=' + encodeURIComponent('https://www.noticiasagricolas.com.br/cotacoes/boi'),
      nome: 'Noticias Agricolas'
    }
  ];

  var encontrou = false;
  for (var i = 0; i < fontes.length; i++) {
    try {
      var f = fontes[i];
      var resp = await fetch(f.url, { signal: AbortSignal.timeout(8000) });
      if (!resp.ok) continue;
      var data = await resp.json();
      var html = data.contents || '';
      var matches = html.match(/(\d{2,3}[.,]\d{2,3})/g) || [];
      var precos = matches
        .map(function(m) { return parseFloat(m.replace(',', '.')); })
        .filter(function(p) { return p >= 180 && p <= 550; });
      if (precos.length > 0) {
        precos.sort(function(a, b) { return a - b; });
        var preco = precos[Math.floor(precos.length / 2)];
        setPreco(preco, f.nome);
        encontrou = true;
        break;
      }
    } catch (e) {
      // falha na fonte, tentar proxima
    }
  }

  if (!encontrou && apiKey) {
    try {
      var hoje = new Date().toLocaleDateString('pt-BR');
      var resp2 = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 100,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          messages: [{
            role: 'user',
            content: 'Preco arroba boi gordo Goias hoje ' + hoje + '. Responda apenas o numero, ex: 285.50'
          }]
        })
      });
      var d = await resp2.json();
      var txt = (d.content || []).map(function(b) { return b.text || ''; }).join('');
      var m = txt.match(/(\d{2,3}[.,]\d{2,3})/);
      if (m) {
        var p = parseFloat(m[1].replace(',', '.'));
        if (p >= 180 && p <= 550) {
          setPreco(p, 'IA/Claude');
          encontrou = true;
        }
      }
    } catch (e) {
      // fallback IA falhou
    }
  }

  if (!encontrou) {
    document.getElementById('cot-preco').textContent = '\u2014';
    document.getElementById('cot-fonte').textContent = 'Nao foi possivel buscar';
    document.getElementById('cot-status').textContent = 'Verifique sua conexao';
    document.getElementById('h-preco').textContent = 'Erro';
    dot.className = 'dot err';
    toast('Erro ao buscar cotacao. Verifique sua conexao.', 'error');
  }

  btn.disabled = false;
  ic.classList.remove('spin');
}

function setPreco(preco, fonte) {
  atBoi = preco;
  var fmt = preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('cot-preco').textContent = fmt;
  document.getElementById('cot-fonte').textContent = 'Fonte: ' + fonte;
  var agora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('cot-hora').textContent = agora;
  document.getElementById('cot-status').textContent = '';
  document.getElementById('h-preco').textContent = 'R$ ' + fmt + '/@';
  document.getElementById('h-dot').className = 'dot ok';
  document.getElementById('s-at').textContent = 'R$ ' + fmt;
  salvarDados();
  toast('Cotacao atualizada: R$ ' + fmt + '/@ (' + fonte + ')', 'success');
}

// ── CHAT IA ──
function addMsg(txt, who) {
  var box = document.getElementById('ai-msgs');
  var d = document.createElement('div');
  d.className = 'msg msg-' + (who === 'ai' ? 'ai' : 'usr');
  d.textContent = txt;
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
  return d;
}

function addTyping() {
  var box = document.getElementById('ai-msgs');
  var d = document.createElement('div');
  d.className = 'msg msg-ai ty';
  d.innerHTML = '<span></span><span></span><span></span>';
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
  return d;
}

function ctxStr() {
  return 'Operacao: ' + lotes.reduce(function(s, l) { return s + (l.cab || 0); }, 0) +
    ' cabecas, custo compra R$' + totalCompra().toFixed(2) +
    ', gastos R$' + totalGastos().toFixed(2) +
    ', preco @ hoje: ' + (atBoi ? 'R$' + atBoi.toFixed(2) : 'nao buscado') +
    '. Regiao: Goias Brasil.';
}

async function sendAI() {
  if (!apiKey) {
    addMsg('Cole sua chave API Anthropic no campo acima para usar o assistente.', 'ai');
    return;
  }
  var inp = document.getElementById('ai-inp');
  var msg = inp.value.trim();
  if (!msg) return;
  inp.value = '';
  addMsg(msg, 'usr');
  var btn = document.getElementById('btn-send');
  btn.disabled = true;
  var typing = addTyping();
  try {
    var resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: 'Voce e assistente de pecuaria bovina em Goias. Responda em portugues, de forma pratica e direta. ' + ctxStr(),
        messages: [{ role: 'user', content: msg }]
      })
    });
    var data = await resp.json();
    if (data.error) {
      typing.remove();
      addMsg('Erro: ' + data.error.message, 'ai');
      btn.disabled = false;
      return;
    }
    var txt = (data.content || [])
      .map(function(b) { return b.text || ''; })
      .filter(Boolean)
      .join('\n') || 'Sem resposta.';
    typing.remove();
    addMsg(txt, 'ai');
  } catch (e) {
    typing.remove();
    addMsg('Erro de conexao. Verifique sua chave e internet.', 'ai');
  }
  btn.disabled = false;
}

function qask(q) {
  document.getElementById('ai-inp').value = q;
  document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.tab')[3].classList.add('active');
  document.getElementById('panel-ia').classList.add('active');
  sendAI();
}

// ── BACKUP / EXPORTAR ──
function exportarDados() {
  var data = {
    app: 'BoviControl',
    versao: '2.0',
    exportadoEm: new Date().toISOString(),
    lotes: lotes,
    gastos: gastos,
    venda: venda,
    atBoi: atBoi
  };
  var json = JSON.stringify(data, null, 2);
  var blob = new Blob([json], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'bovicontrol-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('Backup exportado com sucesso!', 'success');
}

function importarDados() {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      try {
        var data = JSON.parse(ev.target.result);
        if (data.app !== 'BoviControl') {
          toast('Arquivo invalido. Use um backup do BoviControl.', 'error');
          return;
        }
        if (data.lotes) lotes = data.lotes;
        if (data.gastos) gastos = data.gastos;
        if (data.venda) venda = data.venda;
        if (data.atBoi) atBoi = data.atBoi;
        salvarDados();
        renderCompra();
        renderGastos();
        restaurarVenda();
        resumo();
        if (atBoi) {
          setPreco(atBoi, 'Backup');
        }
        toast('Dados importados com sucesso!', 'success');
      } catch (err) {
        toast('Erro ao ler arquivo. Verifique o formato.', 'error');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function limparDados() {
  mostrarModal(
    'Limpar Todos os Dados',
    'Tem certeza que deseja apagar todos os dados? Esta acao nao pode ser desfeita. Recomendamos exportar um backup antes.',
    [
      { texto: 'Cancelar', classe: 'secondary', acao: fecharModal },
      { texto: 'Apagar Tudo', classe: 'danger', acao: function() {
        lotes = [
          { desc: 'Lote 1', cab: 0, peso: 0, at: 0, pcab: 0 },
          { desc: 'Lote 2', cab: 0, peso: 0, at: 0, pcab: 0 }
        ];
        gastos = [
          { cat: 'ALIMENTACAO', items: [
            { desc: 'Racao / Concentrado', v: 0, q: 1 },
            { desc: 'Sal Mineral', v: 0, q: 1 },
            { desc: 'Pastagem / Silagem', v: 0, q: 1 },
            { desc: 'Outros alimentacao', v: 0, q: 1 }
          ]},
          { cat: 'SANIDADE', items: [
            { desc: 'Vacinas', v: 0, q: 1 },
            { desc: 'Vermifugos', v: 0, q: 1 },
            { desc: 'Medicamentos', v: 0, q: 1 },
            { desc: 'Veterinario', v: 0, q: 1 }
          ]},
          { cat: 'TRANSPORTE', items: [
            { desc: 'Frete compra', v: 0, q: 1 },
            { desc: 'Frete venda', v: 0, q: 1 }
          ]},
          { cat: 'OUTROS', items: [
            { desc: 'Mao de obra', v: 0, q: 1 },
            { desc: 'Energia / agua', v: 0, q: 1 },
            { desc: 'Manutencao', v: 0, q: 1 },
            { desc: 'Impostos / taxas', v: 0, q: 1 },
            { desc: 'Outros', v: 0, q: 1 }
          ]}
        ];
        venda = { cab: 0, peso: 0, at: 0, pcab: 0 };
        atBoi = null;
        salvarDados();
        renderCompra();
        renderGastos();
        restaurarVenda();
        resumo();
        document.getElementById('cot-preco').textContent = '\u2014';
        document.getElementById('h-preco').textContent = 'Toque p/ atualizar';
        document.getElementById('s-at').textContent = 'R$ \u2014';
        fecharModal();
        toast('Todos os dados foram apagados.', 'info');
      }}
    ]
  );
}

// ── MODAL ──
function mostrarModal(titulo, mensagem, botoes) {
  fecharModal();
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-overlay';
  overlay.onclick = function(e) {
    if (e.target === overlay) fecharModal();
  };
  var modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = '<h2>' + titulo + '</h2><p>' + mensagem + '</p>';
  var btnsDiv = document.createElement('div');
  btnsDiv.className = 'modal-btns';
  botoes.forEach(function(b) {
    var btn = document.createElement('button');
    btn.className = 'btn-modal ' + b.classe;
    btn.textContent = b.texto;
    btn.onclick = b.acao;
    btnsDiv.appendChild(btn);
  });
  modal.appendChild(btnsDiv);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

function fecharModal() {
  var overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.remove();
}

// ── RESTAURAR VENDA ──
function restaurarVenda() {
  document.getElementById('v-cab').value = venda.cab || 0;
  document.getElementById('v-peso').value = venda.peso || 0;
  document.getElementById('v-at').value = venda.at || 0;
  document.getElementById('v-pcab').value = venda.pcab || 0;
}

// ── INIT ──
function init() {
  carregarDados();
  carregarChave();
  renderCompra();
  renderGastos();
  restaurarVenda();
  resumo();
  if (atBoi) {
    var fmt = atBoi.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('cot-preco').textContent = fmt;
    document.getElementById('h-preco').textContent = 'R$ ' + fmt + '/@';
    document.getElementById('h-dot').className = 'dot ok';
    document.getElementById('s-at').textContent = 'R$ ' + fmt;
    document.getElementById('cot-fonte').textContent = 'Dados salvos';
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
  }
}

document.addEventListener('DOMContentLoaded', init);
