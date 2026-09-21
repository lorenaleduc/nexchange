const ATIVOS_PADRAO = [
  {
    symbol: 'PETR4',
    name: 'Petrobras PN',
    kind: 'Ação',
    price: 31.84,
    change: '+1,18%',
    active: true
  },
  {
    symbol: 'VALE3',
    name: 'Vale ON',
    kind: 'Ação',
    price: 58.26,
    change: '-0,42%',
    active: true
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    kind: 'Cripto',
    price: 487000,
    change: '+2,31%',
    active: true
  },
  {
    symbol: 'CDB 120%',
    name: 'Renda fixa',
    kind: 'CDB',
    price: 100,
    change: '+0,03%',
    active: true
  }
];


let ativos = [];


function carregarAtivos() {
  ativos =
    buscarAtivos();

  if (!ativos) {
    ativos =
      [...ATIVOS_PADRAO];

    salvarAtivos(ativos);

    return ativos;
  }

  ativos = ativos.map(ativo => ({
    ...ativo,

    active:
      ativo.active !== false
  }));

  salvarAtivos(ativos);

  return ativos;
}


function obterAtivosDisponiveis() {
  return ativos.filter(
    ativo => ativo.active
  );
}


function renderizarAtivos() {
  const container =
    document.getElementById(
      'ativos'
    );

  if (container) {
    const ativosDisponiveis =
      obterAtivosDisponiveis();

    if (
      ativosDisponiveis.length === 0
    ) {
      container.innerHTML = `
        <div class="empty">
          Não existem ativos disponíveis no momento.
        </div>
      `;
    } else {
      container.innerHTML =
        ativosDisponiveis.map(
          ativo => `
            <article
              class="asset"
              data-kind="${ativo.kind}"
            >

              <div class="asset-top">

                <span class="asset-symbol">
                  ${ativo.symbol}
                </span>

                <span class="asset-kind">
                  ${ativo.kind}
                </span>

              </div>

              <h3>
                ${ativo.name}
              </h3>

              <span class="asset-price">
                ${formatarDinheiro(
                  ativo.price
                )}
              </span>

              <span
                class="asset-change ${
                  ativo.change.startsWith('-')
                    ? 'down'
                    : ''
                }"
              >
                ${ativo.change}
              </span>

            </article>
          `
        ).join('');
    }
  }

  atualizarSeletorAtivos();

  renderizarAtivosAdmin();

  renderizarResumoAdmin();
}


function atualizarSeletorAtivos() {
  const seletor =
    document.getElementById(
      'ativo'
    );

  if (!seletor) {
    return;
  }

  const ativosDisponiveis =
    obterAtivosDisponiveis();

  if (
    ativosDisponiveis.length === 0
  ) {
    seletor.innerHTML = `
      <option value="">
        Nenhum ativo disponível
      </option>
    `;

    atualizarPrecoAtual();

    return;
  }

  seletor.innerHTML =
    ativosDisponiveis.map(
      ativo => `
        <option value="${ativo.symbol}">
          ${ativo.symbol} - ${ativo.name}
        </option>
      `
    ).join('');

  atualizarPrecoAtual();
}


function atualizarPrecoAtual() {
  const seletor =
    document.getElementById(
      'ativo'
    );

  const precoAtual =
    document.getElementById(
      'preco-atual'
    );

  if (
    !seletor ||
    !precoAtual
  ) {
    return;
  }

  const ativo =
    ativos.find(
      item =>
        item.symbol ===
        seletor.value &&
        item.active
    );

  if (!ativo) {
    precoAtual.textContent = '';

    return;
  }

  precoAtual.textContent =
    `Preço atual: ${formatarDinheiro(
      ativo.price
    )}`;
}


function renderizarResumoAdmin() {
  if (
    !usuarioAtual ||
    usuarioAtual.role !== 'admin'
  ) {
    return;
  }

  const total =
    document.getElementById(
      'admin-total-assets'
    );

  const ativosAtivos =
    document.getElementById(
      'admin-active-assets'
    );

  const ativosInativos =
    document.getElementById(
      'admin-inactive-assets'
    );

  if (
    !total ||
    !ativosAtivos ||
    !ativosInativos
  ) {
    return;
  }

  total.textContent =
    ativos.length;

  ativosAtivos.textContent =
    ativos.filter(
      ativo => ativo.active
    ).length;

  ativosInativos.textContent =
    ativos.filter(
      ativo => !ativo.active
    ).length;
}


function renderizarAtivosAdmin() {
  if (
    !usuarioAtual ||
    usuarioAtual.role !== 'admin'
  ) {
    return;
  }

  const lista =
    document.getElementById(
      'admin-assets-list'
    );

  if (!lista) {
    return;
  }

  if (ativos.length === 0) {
    lista.innerHTML = `
      <div class="empty">
        Nenhum ativo cadastrado.
      </div>
    `;

    return;
  }

  lista.innerHTML =
    ativos.map(
      ativo => `
        <article class="admin-asset-item">

          <div>

            <strong>
              ${ativo.symbol} — ${ativo.name}
            </strong>

            <small>
              ${ativo.kind} ·
              ${formatarDinheiro(
                ativo.price
              )} ·
              ${ativo.change} ·
              ${
                ativo.active
                  ? 'Ativo'
                  : 'Inativo'
              }
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

            ${
              ativo.active
                ? `
                  <button
                    data-inactivate-asset="${ativo.symbol}"
                    class="delete-button"
                    type="button"
                  >
                    Inativar
                  </button>
                `
                : `
                  <button
                    data-reactivate-asset="${ativo.symbol}"
                    class="edit-button"
                    type="button"
                  >
                    Reativar
                  </button>
                `
            }

          </div>

        </article>
      `
    ).join('');
}


function salvarFormularioAtivo(event) {
  event.preventDefault();

  const simboloOriginal =
    document.getElementById(
      'asset-original-symbol'
    ).value;

  const ativoExistente =
    ativos.find(
      item =>
        item.symbol ===
        simboloOriginal
    );

  const ativo = {
    symbol:
      document
        .getElementById(
          'asset-symbol'
        )
        .value
        .trim()
        .toUpperCase(),

    name:
      document
        .getElementById(
          'asset-name'
        )
        .value
        .trim(),

    kind:
      document
        .getElementById(
          'asset-kind'
        )
        .value
        .trim(),

    price:
      Number(
        document.getElementById(
          'asset-price'
        ).value
      ),

    change:
      document
        .getElementById(
          'asset-change'
        )
        .value
        .trim(),

    active:
      ativoExistente
        ? ativoExistente.active
        : true
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


  const simboloJaExiste =
    ativos.some(
      item =>
        item.symbol ===
          ativo.symbol &&
        item.symbol !==
          simboloOriginal
    );


  if (simboloJaExiste) {
    mostrarToast(
      'Já existe um ativo com este código.'
    );

    return;
  }


  if (simboloOriginal) {
    atualizarAtivo(
      simboloOriginal,
      ativo
    );
  } else {
    ativos.push(
      ativo
    );
  }


  salvarAtivos(
    ativos
  );

  limparFormularioAtivo();

  renderizarAtivos();


  mostrarToast(
    simboloOriginal
      ? 'Ativo atualizado com sucesso.'
      : 'Ativo cadastrado com sucesso.'
  );
}


function atualizarAtivo(
  simboloOriginal,
  ativoAtualizado
) {
  const indice =
    ativos.findIndex(
      ativo =>
        ativo.symbol ===
        simboloOriginal
    );


  if (indice === -1) {
    return;
  }


  ativos[indice] =
    ativoAtualizado;


  atualizarAtivoNasRegras(
    simboloOriginal,
    ativoAtualizado.symbol
  );
}


function editarAtivo(simbolo) {
  const ativo =
    ativos.find(
      item =>
        item.symbol === simbolo
    );


  if (!ativo) {
    return;
  }


  document.getElementById(
    'asset-original-symbol'
  ).value =
    ativo.symbol;


  document.getElementById(
    'asset-name'
  ).value =
    ativo.name;


  document.getElementById(
    'asset-symbol'
  ).value =
    ativo.symbol;


  document.getElementById(
    'asset-kind'
  ).value =
    ativo.kind;


  document.getElementById(
    'asset-price'
  ).value =
    ativo.price;


  document.getElementById(
    'asset-change'
  ).value =
    ativo.change;


  document.getElementById(
    'asset-submit'
  ).textContent =
    'Salvar alterações';


  document
    .getElementById(
      'asset-cancel'
    )
    .classList.remove(
      'hidden'
    );


  document.getElementById(
    'asset-name'
  ).focus();
}


function inativarAtivo(simbolo) {
  const ativo =
    ativos.find(
      item =>
        item.symbol === simbolo
    );


  if (!ativo) {
    mostrarToast(
      'Ativo não encontrado.'
    );

    return;
  }


  const confirmou =
    confirm(
      `Deseja inativar o ativo "${ativo.symbol}"?`
    );


  if (!confirmou) {
    return;
  }


  ativo.active = false;


  salvarAtivos(
    ativos
  );

  limparFormularioAtivo();

  renderizarAtivos();


  mostrarToast(
    'Ativo inativado com sucesso.'
  );
}


function reativarAtivo(simbolo) {
  const ativo =
    ativos.find(
      item =>
        item.symbol === simbolo
    );


  if (!ativo) {
    mostrarToast(
      'Ativo não encontrado.'
    );

    return;
  }


  const confirmou =
    confirm(
      `Deseja reativar o ativo "${ativo.symbol}"?`
    );


  if (!confirmou) {
    return;
  }


  ativo.active = true;


  salvarAtivos(
    ativos
  );

  limparFormularioAtivo();

  renderizarAtivos();


  mostrarToast(
    'Ativo reativado com sucesso.'
  );
}


function limparFormularioAtivo() {
  const formulario =
    document.getElementById(
      'asset-form'
    );


  if (!formulario) {
    return;
  }


  formulario.reset();


  document.getElementById(
    'asset-original-symbol'
  ).value = '';


  document.getElementById(
    'asset-submit'
  ).textContent =
    'Cadastrar ativo';


  document
    .getElementById(
      'asset-cancel'
    )
    .classList.add(
      'hidden'
    );
}


function controlarCliqueAtivo(event) {
  const simboloEditar =
    event.target.dataset.editAsset;

  const simboloInativar =
    event.target.dataset.inactivateAsset;

  const simboloReativar =
    event.target.dataset.reactivateAsset;


  if (simboloEditar) {
    editarAtivo(
      simboloEditar
    );

    return;
  }


  if (simboloInativar) {
    inativarAtivo(
      simboloInativar
    );

    return;
  }


  if (simboloReativar) {
    reativarAtivo(
      simboloReativar
    );
  }
}