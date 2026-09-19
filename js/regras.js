function criarRegra(event) {
  event.preventDefault();

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

  salvarDados(dadosDashboard);

  event.target.reset();

  atualizarPrecoAtual();
  renderizarDashboard();

  mostrarToast('Regra de compra adicionada.');
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
  renderizarDashboard();

  mostrarToast('Regra removida.');
}

function controlarCliqueRegra(event) {
  const id = Number(event.target.dataset.remove);

  if (!id) {
    return;
  }

  removerRegra(id);
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

  lista.innerHTML = dadosDashboard.rules.map(regra => `
    <div class="rule">
      <div class="rule-head">
        <strong>
          Comprar ${regra.asset}
        </strong>

        <button
          data-remove="${regra.id}"
          type="button"
        >
          Remover
        </button>
      </div>

      <div class="target">
        Se chegar a ${formatarDinheiro(regra.target)}
      </div>

      <small>
        Limite: ${formatarDinheiro(regra.amount)}
        ·
        ${
          regra.notify
            ? 'Notificação ativada'
            : 'Sem notificação'
        }
      </small>
    </div>
  `).join('');
}