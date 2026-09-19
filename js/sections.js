const secoesDashboard = [
  {
    container: 'overview-container',
    arquivo: 'overview.html'
  },
  {
    container: 'mercado-container',
    arquivo: 'mercado.html'
  },
  {
    container: 'admin-assets-container',
    arquivo: 'admin-ativos.html'
  },
  {
    container: 'admin-users-container',
    arquivo: 'admin-usuarios.html'
  },
  {
    container: 'regras-container',
    arquivo: 'regras.html'
  },
  {
    container: 'historico-container',
    arquivo: 'historico.html'
  }
];

async function carregarSecao(containerId, arquivo) {
  const container = document.getElementById(containerId);

  if (!container) {
    throw new Error(`Container não encontrado: ${containerId}`);
  }

  const resposta = await fetch(`sections/${arquivo}`);

  if (!resposta.ok) {
    throw new Error(`Não foi possível carregar ${arquivo}`);
  }

  container.innerHTML = await resposta.text();
}

async function carregarSecoes() {
  for (const secao of secoesDashboard) {
    await carregarSecao(secao.container, secao.arquivo);
  }
}

function carregarDashboardJs() {
  const script = document.createElement('script');

  script.src = '../js/dashboard.js';

  script.onload = function () {
    iniciarDashboard();
  };

  document.body.appendChild(script);
}

async function iniciarPagina() {
  try {
    await carregarSecoes();
    carregarDashboardJs();
  } catch (erro) {
    console.error('Erro ao carregar o dashboard:', erro);
  }
}

iniciarPagina();