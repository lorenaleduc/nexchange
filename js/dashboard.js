const DADOS_INICIAIS = {
  balance: 10000,
  automation: false,
  rules: [],
  history: []
};


let dadosDashboard = null;


function carregarDadosDashboard() {
  if (
    !usuarioAtual ||
    usuarioAtual.role === 'admin'
  ) {
    return null;
  }

  const dadosSalvos =
    buscarDadosUsuario(
      usuarioAtual.email
    );

  if (!dadosSalvos) {
    const novosDados = {
      balance:
        DADOS_INICIAIS.balance,

      automation:
        DADOS_INICIAIS.automation,

      rules: [],

      history: []
    };

    salvarDadosUsuario(
      usuarioAtual.email,
      novosDados
    );

    return novosDados;
  }

  return dadosSalvos;
}


function formatarDinheiro(valor) {
  return valor.toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL'
    }
  );
}


function mostrarToast(mensagem) {
  const toast =
    document.getElementById(
      'toast'
    );

  toast.textContent =
    mensagem;

  toast.classList.add(
    'show'
  );

  setTimeout(() => {
    toast.classList.remove(
      'show'
    );
  }, 2700);
}


function adicionarHistorico(
  ativo,
  acao,
  detalhe
) {
  if (!dadosDashboard) {
    return;
  }

  dadosDashboard.history.unshift({
    date:
      new Date().toLocaleString(
        'pt-BR'
      ),

    asset:
      ativo,

    action:
      acao,

    detail:
      detalhe
  });
}


function renderizarResumo() {
  if (!dadosDashboard) {
    return;
  }

  const saldo =
    document.getElementById(
      'saldo'
    );

  if (!saldo) {
    return;
  }

  const reservado =
    dadosDashboard.rules.reduce(
      (total, regra) =>
        total + regra.amount,
      0
    );

  saldo.textContent =
    formatarDinheiro(
      dadosDashboard.balance
    );

  document.getElementById(
    'reservado'
  ).textContent =
    formatarDinheiro(
      reservado
    );

  document.getElementById(
    'regras-resumo'
  ).textContent =
    dadosDashboard.rules.length
      ? `${dadosDashboard.rules.length} regra(s) configurada(s)`
      : 'Nenhuma regra ativa';

  const automacao =
    document.getElementById(
      'automacao'
    );

  const status =
    document.getElementById(
      'automacao-status'
    );

  automacao.checked =
    dadosDashboard.automation;

  status.textContent =
    dadosDashboard.automation
      ? 'Ativada'
      : 'Desativada';
}


function renderizarHistorico() {
  if (!dadosDashboard) {
    return;
  }

  const tabela =
    document.getElementById(
      'historico-corpo'
    );

  if (!tabela) {
    return;
  }

  if (
    dadosDashboard.history.length === 0
  ) {
    tabela.innerHTML = `
      <tr>
        <td colspan="4">
          Nenhuma atividade registrada.
        </td>
      </tr>
    `;

    return;
  }

  tabela.innerHTML =
    dadosDashboard.history.map(
      item => `
        <tr>
          <td>${item.date}</td>
          <td>${item.asset}</td>
          <td>${item.action}</td>
          <td>${item.detail}</td>
        </tr>
      `
    ).join('');
}


function renderizarDashboard() {
  if (
    usuarioAtual.role === 'admin'
  ) {
    renderizarAtivosAdmin();
    renderizarResumoAdmin();

    return;
  }

  renderizarResumo();

  renderizarRegras();

  renderizarHistorico();
}


function alterarAutomacao(event) {
  if (!dadosDashboard) {
    return;
  }

  dadosDashboard.automation =
    event.target.checked;

  adicionarHistorico(
    'Automação',

    dadosDashboard.automation
      ? 'Ativada'
      : 'Desativada',

    'Alteração de configuração'
  );

  salvarDadosUsuario(
    usuarioAtual.email,
    dadosDashboard
  );

  renderizarDashboard();

  mostrarToast(
    dadosDashboard.automation
      ? 'Automação ativada.'
      : 'Automação desativada.'
  );
}


function limparHistorico() {
  if (!dadosDashboard) {
    return;
  }

  dadosDashboard.history = [];

  salvarDadosUsuario(
    usuarioAtual.email,
    dadosDashboard
  );

  renderizarHistorico();

  mostrarToast(
    'Histórico limpo.'
  );
}


function sairDaConta() {
  removerSessao();

  window.location.href =
    '../index.html';
}


function adicionarEventosComuns() {
  document
    .getElementById(
      'edit-profile-button'
    )
    .addEventListener(
      'click',
      abrirModalPerfil
    );

  document
    .getElementById(
      'close-profile-modal'
    )
    .addEventListener(
      'click',
      fecharModalPerfil
    );

  document
    .getElementById(
      'profile-form'
    )
    .addEventListener(
      'submit',
      atualizarPerfil
    );

  document
    .getElementById(
      'logout-button'
    )
    .addEventListener(
      'click',
      sairDaConta
    );
}


function adicionarEventosInvestidor() {
  document
    .getElementById(
      'form-regra'
    )
    .addEventListener(
      'submit',
      salvarRegra
    );

  document
    .getElementById(
      'regra-cancelar'
    )
    .addEventListener(
      'click',
      limparFormularioRegra
    );

  document
    .getElementById(
      'lista-regras'
    )
    .addEventListener(
      'click',
      controlarCliqueRegra
    );

  document
    .getElementById(
      'ativo'
    )
    .addEventListener(
      'change',
      atualizarPrecoAtual
    );

  document
    .getElementById(
      'automacao'
    )
    .addEventListener(
      'change',
      alterarAutomacao
    );

  document
    .getElementById(
      'limpar-historico'
    )
    .addEventListener(
      'click',
      limparHistorico
    );
}


function adicionarEventosAdministrador() {
  document
    .getElementById(
      'asset-form'
    )
    .addEventListener(
      'submit',
      salvarFormularioAtivo
    );

  document
    .getElementById(
      'asset-cancel'
    )
    .addEventListener(
      'click',
      limparFormularioAtivo
    );

  document
    .getElementById(
      'admin-assets-list'
    )
    .addEventListener(
      'click',
      controlarCliqueAtivo
    );
}


function iniciarDashboard() {
  const usuario =
    carregarUsuarioAtual();

  if (!usuario) {
    return;
  }

  carregarAtivos();

  atualizarInformacoesUsuario();

  dadosDashboard =
    carregarDadosDashboard();

  if (
    usuario.role === 'admin'
  ) {
    renderizarDashboard();

    adicionarEventosComuns();

    adicionarEventosAdministrador();

    return;
  }

  renderizarAtivos();

  renderizarDashboard();

  adicionarEventosComuns();

  adicionarEventosInvestidor();
}