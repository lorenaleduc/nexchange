const DADOS_INICIAIS = {
  balance: 10000,
  automation: false,
  rules: [],
  history: []
};


let dadosDashboard =
  carregarDadosDashboard();


function carregarDadosDashboard() {
  const dadosSalvos =
    buscarDados();


  if (!dadosSalvos) {
    const novosDados = {
      balance:
        DADOS_INICIAIS.balance,

      automation:
        DADOS_INICIAIS.automation,

      rules: [],

      history: []
    };


    salvarDados(novosDados);

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
    document.getElementById('toast');


  toast.textContent = mensagem;

  toast.classList.add('show');


  setTimeout(() => {
    toast.classList.remove('show');
  }, 2700);
}


function adicionarHistorico(
  ativo,
  acao,
  detalhe
) {
  dadosDashboard.history.unshift({
    date:
      new Date().toLocaleString(
        'pt-BR'
      ),

    asset: ativo,

    action: acao,

    detail: detalhe
  });
}


function renderizarResumo() {
  const reservado =
    dadosDashboard.rules.reduce(
      (total, regra) =>
        total + regra.amount,
      0
    );


  document.getElementById(
    'saldo'
  ).textContent =
    formatarDinheiro(
      dadosDashboard.balance
    );


  document.getElementById(
    'reservado'
  ).textContent =
    formatarDinheiro(reservado);


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
  const tabela =
    document.getElementById(
      'historico-corpo'
    );


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
  renderizarResumo();

  renderizarRegras();

  renderizarHistorico();
}


function alterarAutomacao(event) {
  dadosDashboard.automation =
    event.target.checked;


  adicionarHistorico(
    'Automação',

    dadosDashboard.automation
      ? 'Ativada'
      : 'Desativada',

    'Alteração de configuração'
  );


  salvarDados(dadosDashboard);

  renderizarDashboard();


  mostrarToast(
    dadosDashboard.automation
      ? 'Automação ativada.'
      : 'Automação desativada.'
  );
}


function limparHistorico() {
  dadosDashboard.history = [];


  salvarDados(dadosDashboard);

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


function adicionarEventos() {
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


  document
    .getElementById(
      'admin-users-list'
    )
    .addEventListener(
      'click',
      controlarCliqueUsuario
    );


  document
    .getElementById(
      'admin-user-form'
    )
    .addEventListener(
      'submit',
      salvarEdicaoUsuario
    );


  document
    .getElementById(
      'close-admin-user-modal'
    )
    .addEventListener(
      'click',
      fecharEdicaoUsuario
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

  renderizarAtivos();

  renderizarDashboard();

  adicionarEventos();
}


document.addEventListener(
  'DOMContentLoaded',
  iniciarDashboard
);