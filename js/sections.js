function obterSecoesDashboard() {
  const usuario =
    verificarSessao();

  if (!usuario) {
    return [];
  }

  if (
    usuario.role === 'admin'
  ) {
    return [
      {
        container:
          'overview-container',

        arquivo:
          'admin-overview.html'
      },
      {
        container:
          'admin-assets-container',

        arquivo:
          'admin-ativos.html'
      }
    ];
  }

  return [
    {
      container:
        'overview-container',

      arquivo:
        'overview.html'
    },
    {
      container:
        'mercado-container',

      arquivo:
        'mercado.html'
    },
    {
      container:
        'regras-container',

      arquivo:
        'regras.html'
    },
    {
      container:
        'historico-container',

      arquivo:
        'historico.html'
    }
  ];
}


async function carregarSecao(
  containerId,
  arquivo
) {
  const container =
    document.getElementById(
      containerId
    );

  if (!container) {
    return;
  }

  const resposta =
    await fetch(
      `sections/${arquivo}`
    );

  if (!resposta.ok) {
    throw new Error(
      `Não foi possível carregar ${arquivo}`
    );
  }

  container.innerHTML =
    await resposta.text();
}


async function iniciarPagina() {
  try {
    const usuario =
      verificarSessao();

    if (!usuario) {
      window.location.href =
        '../index.html';

      return;
    }

    const secoes =
      obterSecoesDashboard();

    for (
      const secao of secoes
    ) {
      await carregarSecao(
        secao.container,
        secao.arquivo
      );
    }

    iniciarDashboard();

  } catch (erro) {
    console.error(
      'Erro ao carregar o dashboard:',
      erro
    );
  }
}


document.addEventListener(
  'DOMContentLoaded',
  iniciarPagina
);