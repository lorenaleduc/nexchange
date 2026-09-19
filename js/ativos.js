const ATIVOS_PADRAO = [
  {
    symbol: 'PETR4',
    name: 'Petrobras PN',
    kind: 'Ação',
    price: 31.84,
    change: '+1,18%'
  },
  {
    symbol: 'VALE3',
    name: 'Vale ON',
    kind: 'Ação',
    price: 58.26,
    change: '-0,42%'
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    kind: 'Cripto',
    price: 487000,
    change: '+2,31%'
  },
  {
    symbol: 'CDB 120%',
    name: 'Renda fixa',
    kind: 'CDB',
    price: 100,
    change: '+0,03%'
  }
];

let ativos = [];

function carregarAtivos() {
  ativos = buscarAtivos();

  if (!ativos) {
    ativos = [...ATIVOS_PADRAO];
    salvarAtivos(ativos);
  }

  return ativos;
}

function renderizarAtivos() {
  const container = document.getElementById('ativos');

  container.innerHTML = ativos.map(ativo => `
    <article class="asset">
      <div class="asset-top">
        <span class="asset-symbol">${ativo.symbol}</span>
        <span class="asset-kind">${ativo.kind}</span>
      </div>

      <h3>${ativo.name}</h3>

      <span class="asset-price">
        ${formatarDinheiro(ativo.price)}
      </span>

      <span class="asset-change ${
        ativo.change.startsWith('-') ? 'down' : ''
      }">
        ${ativo.change}
      </span>
    </article>
  `).join('');

  atualizarSeletorAtivos();
  renderizarAtivosAdmin();
}

function atualizarSeletorAtivos() {
  const seletor = document.getElementById('ativo');

  seletor.innerHTML = ativos.map(ativo => `
    <option value="${ativo.symbol}">
      ${ativo.symbol} - ${ativo.name}
    </option>
  `).join('');

  atualizarPrecoAtual();
}

function atualizarPrecoAtual() {
  const seletor = document.getElementById('ativo');
  const precoAtual = document.getElementById('preco-atual');

  const ativo = ativos.find(
    item => item.symbol === seletor.value
  );

  if (!ativo) {
    precoAtual.textContent = '';
    return;
  }

  precoAtual.textContent =
    `Preço simulado agora: ${formatarDinheiro(ativo.price)}`;
}

function renderizarAtivosAdmin() {
  if (!usuarioAtual || usuarioAtual.role !== 'admin') {
    return;
  }

  const lista = document.getElementById('admin-assets-list');

  lista.innerHTML = ativos.map(ativo => `
    <article class="admin-asset-item">
      <div>
        <strong>
          ${ativo.symbol} — ${ativo.name}
        </strong>

        <small>
          ${ativo.kind} ·
          ${formatarDinheiro(ativo.price)} ·
          ${ativo.change}
        </small>
      </div>

      <div class="item-actions">
        <button
          data-edit-asset="${ativo.symbol}"
          class="edit-button"
          type="button"
        >
          Editar
        </button>

        <button
          data-delete-asset="${ativo.symbol}"
          class="delete-button"
          type="button"
        >
          Excluir
        </button>
      </div>
    </article>
  `).join('');
}

function salvarFormularioAtivo(event) {
  event.preventDefault();

  const simboloOriginal =
    document.getElementById('asset-original-symbol').value;

  const ativo = {
    symbol: document
      .getElementById('asset-symbol')
      .value
      .trim()
      .toUpperCase(),

    name: document
      .getElementById('asset-name')
      .value
      .trim(),

    kind: document
      .getElementById('asset-kind')
      .value
      .trim(),

    price: Number(
      document.getElementById('asset-price').value
    ),

    change: document
      .getElementById('asset-change')
      .value
      .trim()
  };

  if (
    !ativo.symbol ||
    !ativo.name ||
    !ativo.kind ||
    ativo.price <= 0 ||
    !ativo.change
  ) {
    mostrarToast(
      'Preencha todos os dados do ativo corretamente.'
    );
    return;
  }

  const simboloJaExiste = ativos.some(item =>
    item.symbol === ativo.symbol &&
    item.symbol !== simboloOriginal
  );

  if (simboloJaExiste) {
    mostrarToast('Já existe um ativo com este símbolo.');
    return;
  }

  if (simboloOriginal) {
    atualizarAtivo(simboloOriginal, ativo);
  } else {
    ativos.push(ativo);
  }

  salvarAtivos(ativos);
  limparFormularioAtivo();
  renderizarAtivos();

  mostrarToast(
    simboloOriginal
      ? 'Ativo atualizado.'
      : 'Ativo adicionado.'
  );
}

function atualizarAtivo(simboloOriginal, ativoAtualizado) {
  const indice = ativos.findIndex(
    ativo => ativo.symbol === simboloOriginal
  );

  if (indice === -1) {
    return;
  }

  ativos[indice] = ativoAtualizado;

  atualizarAtivoNasRegras(
    simboloOriginal,
    ativoAtualizado.symbol
  );
}

function editarAtivo(simbolo) {
  const ativo = ativos.find(
    item => item.symbol === simbolo
  );

  if (!ativo) {
    return;
  }

  document.getElementById('asset-original-symbol').value =
    ativo.symbol;

  document.getElementById('asset-name').value =
    ativo.name;

  document.getElementById('asset-symbol').value =
    ativo.symbol;

  document.getElementById('asset-kind').value =
    ativo.kind;

  document.getElementById('asset-price').value =
    ativo.price;

  document.getElementById('asset-change').value =
    ativo.change;

  document.getElementById('asset-submit').textContent =
    'Salvar ativo';

  document
    .getElementById('asset-cancel')
    .classList.remove('hidden');

  document.getElementById('asset-name').focus();
}

function excluirAtivo(simbolo) {
  if (ativos.length === 1) {
    mostrarToast(
      'Mantenha ao menos um ativo cadastrado na simulação.'
    );
    return;
  }

  ativos = ativos.filter(
    ativo => ativo.symbol !== simbolo
  );

  salvarAtivos(ativos);

  removerRegrasDoAtivo(simbolo);

  limparFormularioAtivo();
  renderizarAtivos();
  renderizarDashboard();

  mostrarToast(
    'Ativo excluído e regras relacionadas removidas.'
  );
}

function limparFormularioAtivo() {
  const formulario =
    document.getElementById('asset-form');

  formulario.reset();

  document.getElementById('asset-original-symbol').value = '';

  document.getElementById('asset-submit').textContent =
    'Adicionar ativo';

  document
    .getElementById('asset-cancel')
    .classList.add('hidden');
}

function controlarCliqueAtivo(event) {
  const simboloEditar =
    event.target.dataset.editAsset;

  const simboloExcluir =
    event.target.dataset.deleteAsset;

  if (simboloEditar) {
    editarAtivo(simboloEditar);
  }

  if (simboloExcluir) {
    excluirAtivo(simboloExcluir);
  }
}