function salvarRegra(event) {
  event.preventDefault();

  const id = Number(
    document.getElementById('regra-id').value
  );

  const simboloAtivo =
    document.getElementById('ativo').value;

  const ativo = ativos.find(
    item => item.symbol === simboloAtivo
  );

  const precoAlvo = Number(
    document.getElementById('preco-alvo').value
  );

  const valor = Number(
    document.getElementById('valor').value
  );

  const notificar =
    document.getElementById('notificar').checked;

  if (!ativo) {
    mostrarToast('Selecione um ativo válido.');
    return;
  }

  if (precoAlvo <= 0 || valor <= 0) {
    mostrarToast('Informe valores válidos.');
    return;
  }

  if (valor > dadosDashboard.balance) {
    mostrarToast(
      'O limite não pode ser maior que o saldo simulado.'
    );

    return;
  }

  if (id) {
    atualizarRegra(
      id,
      ativo,
      precoAlvo,
      valor,
      notificar
    );
  } else {
    criarRegra(
      ativo,
      precoAlvo,
      valor,
      notificar
    );
  }

  salvarDados(dadosDashboard);

  limparFormularioRegra();
  renderizarDashboard();
}

function criarRegra(
  ativo,
  precoAlvo,
  valor,
  notificar
) {
  const novaRegra = {
    id: Date.now(),
    asset: ativo.symbol,
    target: precoAlvo,
    amount: valor,
    notify: notificar
  };

  dadosDashboard.rules.unshift(novaRegra);

  adicionarHistorico(
    ativo.symbol,
    'Regra criada',
    `Comprar até ${formatarDinheiro(precoAlvo)}`
  );

  mostrarToast(
    'Regra de compra adicionada.'
  );
}

function atualizarRegra(
  id,
  ativo,
  precoAlvo,
  valor,
  notificar
) {
  const indice = dadosDashboard.rules.findIndex(
    regra => regra.id === id
  );

  if (indice === -1) {
    mostrarToast('Regra não encontrada.');
    return;
  }

  dadosDashboard.rules[indice] = {
    id: id,
    asset: ativo.symbol,
    target: precoAlvo,
    amount: valor,
    notify: notificar
  };

  adicionarHistorico(
    ativo.symbol,
    'Regra atualizada',
    `Novo preço-alvo: ${formatarDinheiro(precoAlvo)}`
  );

  mostrarToast(
    'Regra atualizada com sucesso.'
  );
}

function editarRegra(id) {
  const regra = dadosDashboard.rules.find(
    item => item.id === id
  );

  if (!regra) {
    mostrarToast('Regra não encontrada.');
    return;
  }

  document.getElementById('regra-id').value =
    regra.id;

  document.getElementById('ativo').value =
    regra.asset;

  document.getElementById('preco-alvo').value =
    regra.target;

  document.getElementById('valor').value =
    regra.amount;

  document.getElementById('notificar').checked =
    regra.notify;

  document.getElementById(
    'regra-submit'
  ).textContent = 'Salvar alterações';

  document.getElementById(
    'regra-cancelar'
  ).classList.remove('hidden');

  atualizarPrecoAtual();

  document.getElementById(
    'form-regra'
  ).scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
}

function limparFormularioRegra() {
  document.getElementById(
    'form-regra'
  ).reset();

  document.getElementById(
    'regra-id'
  ).value = '';

  document.getElementById(
    'regra-submit'
  ).textContent = 'Criar regra';

  document.getElementById(
    'regra-cancelar'
  ).classList.add('hidden');

  atualizarPrecoAtual();
}

function removerRegra(id) {
  const regra = dadosDashboard.rules.find(
    item => item.id === id
  );

  if (!regra) {
    return;
  }

  dadosDashboard.rules =
    dadosDashboard.rules.filter(
      item => item.id !== id
    );

  adicionarHistorico(
    regra.asset,
    'Regra removida',
    'Configuração cancelada'
  );

  salvarDados(dadosDashboard);

  const regraEmEdicao = Number(
    document.getElementById('regra-id').value
  );

  if (regraEmEdicao === id) {
    limparFormularioRegra();
  }

  renderizarDashboard();

  mostrarToast('Regra removida.');
}

function controlarCliqueRegra(event) {
  const idEditar = Number(
    event.target.dataset.editRule
  );

  const idRemover = Number(
    event.target.dataset.remove
  );

  if (idEditar) {
    editarRegra(idEditar);
    return;
  }

  if (idRemover) {
    removerRegra(idRemover);
  }
}

function atualizarAtivoNasRegras(
  simboloAnterior,
  novoSimbolo
) {
  dadosDashboard.rules.forEach(regra => {
    if (regra.asset === simboloAnterior) {
      regra.asset = novoSimbolo;
    }
  });

  salvarDados(dadosDashboard);
}

function removerRegrasDoAtivo(simbolo) {
  dadosDashboard.rules =
    dadosDashboard.rules.filter(
      regra => regra.asset !== simbolo
    );

  salvarDados(dadosDashboard);
}

function renderizarRegras() {
  const lista =
    document.getElementById('lista-regras');

  const contador =
    document.getElementById('contador-regras');

  contador.textContent =
    `${dadosDashboard.rules.length} regra(s)`;

  if (dadosDashboard.rules.length === 0) {
    lista.innerHTML = `
      <div class="empty">
        Nenhuma regra cadastrada.
        Crie uma regra ao lado para acompanhar um preço.
      </div>
    `;

    return;
  }

  lista.innerHTML =
    dadosDashboard.rules.map(regra => `
      <div class="rule">

        <div class="rule-head">

          <strong>
            Comprar ${regra.asset}
          </strong>

          <div class="rule-actions">

            <button
              class="edit-rule-button"
              data-edit-rule="${regra.id}"
              type="button"
            >
              Editar
            </button>

            <button
              class="remove-rule-button"
              data-remove="${regra.id}"
              type="button"
            >
              Remover
            </button>

          </div>

        </div>

        <div class="target">
          <span>Se chegar a</span>
          <strong>${formatarDinheiro(regra.target)}</strong>
        </div>

        <div class="rule-meta">
          <span class="rule-limit">
            Limite: ${formatarDinheiro(regra.amount)}
          </span>

          <span class="notify-badge ${regra.notify ? 'on' : ''}">
            ${regra.notify ? 'Notificação ativada' : 'Sem notificação'}
          </span>
        </div>

      </div>
    `).join('');
}