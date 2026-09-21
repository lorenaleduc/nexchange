let usuarioAtual = null;


function carregarUsuarioAtual() {
  usuarioAtual =
    verificarSessao();

  if (!usuarioAtual) {
    window.location.href =
      '../index.html';

    return null;
  }

  return usuarioAtual;
}


function atualizarInformacoesUsuario() {
  if (!usuarioAtual) {
    return;
  }

  const primeiroNome =
    usuarioAtual.name.split(' ')[0];

  const iniciais =
    usuarioAtual.name
      .split(' ')
      .slice(0, 2)
      .map(nome => nome[0])
      .join('')
      .toUpperCase();

  const administrador =
    usuarioAtual.role === 'admin';

  document.getElementById(
    'user-first-name'
  ).textContent =
    primeiroNome;

  document.getElementById(
    'profile-name'
  ).textContent =
    usuarioAtual.name;

  document.getElementById(
    'avatar'
  ).textContent =
    iniciais;

  document.getElementById(
    'user-role'
  ).textContent =
    administrador
      ? 'PAINEL ADMINISTRATIVO'
      : 'PAINEL DO INVESTIDOR';

  document.getElementById(
    'profile-type'
  ).textContent =
    administrador
      ? 'Administrador'
      : 'Investidor';

  document.getElementById(
    'dashboard-description'
  ).textContent =
    administrador
      ? 'Gerencie o catálogo de ativos disponíveis na plataforma.'
      : 'Acompanhe seus investimentos e configure suas regras.';

  document.getElementById(
    'nav-mercado'
  ).classList.toggle(
    'hidden',
    administrador
  );

  document.getElementById(
    'nav-regras'
  ).classList.toggle(
    'hidden',
    administrador
  );

  document.getElementById(
    'nav-historico'
  ).classList.toggle(
    'hidden',
    administrador
  );

  document.getElementById(
    'nav-admin-assets'
  ).classList.toggle(
    'hidden',
    !administrador
  );
}


function abrirModalPerfil() {
  document.getElementById(
    'profile-input-name'
  ).value =
    usuarioAtual.name;

  document.getElementById(
    'profile-input-email'
  ).value =
    usuarioAtual.email;

  document.getElementById(
    'profile-input-password'
  ).value = '';

  document
    .getElementById(
      'profile-modal'
    )
    .classList.remove('hidden');
}


function fecharModalPerfil() {
  document
    .getElementById(
      'profile-modal'
    )
    .classList.add('hidden');
}


function atualizarPerfil(event) {
  event.preventDefault();

  const nome =
    document
      .getElementById(
        'profile-input-name'
      )
      .value
      .trim();

  const email =
    document
      .getElementById(
        'profile-input-email'
      )
      .value
      .trim()
      .toLowerCase();

  const senha =
    document
      .getElementById(
        'profile-input-password'
      )
      .value;

  const administrador =
    usuarioAtual.role === 'admin';

  if (!nome || !email) {
    mostrarToast(
      'Preencha nome e e-mail.'
    );

    return;
  }

  if (administrador) {
    atualizarAdministrador(
      nome,
      email,
      senha
    );

    return;
  }

  atualizarUsuarioComum(
    nome,
    email,
    senha
  );
}


function atualizarAdministrador(
  nome,
  email,
  senha
) {
  if (email !== ADMIN.email) {
    mostrarToast(
      'O e-mail do administrador não pode ser alterado.'
    );

    return;
  }

  usuarioAtual = {
    ...usuarioAtual,
    name: nome
  };

  if (senha) {
    usuarioAtual.password =
      senha;
  }

  salvarSessao(
    usuarioAtual.email
  );

  atualizarInformacoesUsuario();

  fecharModalPerfil();

  mostrarToast(
    'Perfil atualizado com sucesso.'
  );
}


function atualizarUsuarioComum(
  nome,
  email,
  senha
) {
  const usuarios =
    buscarUsuarios();

  const emailAntigo =
    usuarioAtual.email;

  const emailJaExiste =
    usuarios.some(usuario =>
      usuario.email === email &&
      usuario.email !== emailAntigo
    );

  if (
    emailJaExiste ||
    email === ADMIN.email
  ) {
    mostrarToast(
      'Já existe uma conta com este e-mail.'
    );

    return;
  }

  const indice =
    usuarios.findIndex(
      usuario =>
        usuario.email ===
        emailAntigo
    );

  if (indice === -1) {
    mostrarToast(
      'Usuário não encontrado.'
    );

    return;
  }

  const usuarioAtualizado = {
    ...usuarios[indice],
    name: nome,
    email: email
  };

  if (senha) {
    usuarioAtualizado.password =
      senha;
  }

  usuarios[indice] =
    usuarioAtualizado;

  salvarUsuarios(
    usuarios
  );

  alterarEmailDadosUsuario(
    emailAntigo,
    email
  );

  salvarSessao(
    usuarioAtualizado.email
  );

  usuarioAtual =
    usuarioAtualizado;

  atualizarInformacoesUsuario();

  fecharModalPerfil();

  mostrarToast(
    'Perfil atualizado com sucesso.'
  );
}