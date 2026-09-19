const ADMIN = {
  name: 'Administrador',
  email: 'admin@nexchange.com',
  password: 'admin123',
  role: 'admin'
};

function buscarUsuarioPorEmail(email) {
  if (email === ADMIN.email) {
    return ADMIN;
  }

  const usuarios = buscarUsuarios();

  return usuarios.find(usuario => usuario.email === email);
}

function cadastrarUsuario(nome, email, senha) {
  const usuarios = buscarUsuarios();

  const emailJaExiste =
    email === ADMIN.email ||
    usuarios.some(usuario => usuario.email === email);

  if (emailJaExiste) {
    return {
      sucesso: false,
      mensagem: 'Já existe uma conta com este e-mail.'
    };
  }

  const novoUsuario = {
    id: Date.now(),
    name: nome,
    email: email,
    password: senha,
    role: 'user'
  };

  usuarios.push(novoUsuario);
  salvarUsuarios(usuarios);

  return {
    sucesso: true,
    usuario: novoUsuario
  };
}

function fazerLogin(email, senha) {
  const usuario = buscarUsuarioPorEmail(email);

  if (!usuario || usuario.password !== senha) {
    return {
      sucesso: false,
      mensagem: 'E-mail ou senha incorretos.'
    };
  }

  salvarSessao(usuario.email);

  return {
    sucesso: true,
    usuario: usuario
  };
}

function verificarSessao() {
  const email = buscarSessao();

  if (!email) {
    return null;
  }

  return buscarUsuarioPorEmail(email);
}

function mostrarMensagemAuth(mensagem, erro = true) {
  const elemento = document.getElementById('auth-message');

  if (!elemento) {
    return;
  }

  elemento.textContent = mensagem;
  elemento.classList.toggle('error', erro);
  elemento.classList.toggle('success', !erro);
}

function abrirAuth(tipo) {
  const modal = document.getElementById('auth-modal');

  modal.classList.remove('hidden');

  trocarAbaAuth(tipo);
}

function fecharAuth() {
  document
    .getElementById('auth-modal')
    .classList.add('hidden');

  mostrarMensagemAuth('');
}

function trocarAbaAuth(tipo) {
  const formularioLogin =
    document.getElementById('login-form');

  const formularioCadastro =
    document.getElementById('register-form');

  const loginAtivo = tipo === 'login';

  formularioLogin.classList.toggle(
    'hidden',
    !loginAtivo
  );

  formularioCadastro.classList.toggle(
    'hidden',
    loginAtivo
  );

  document
    .querySelectorAll('[data-auth-tab]')
    .forEach(botao => {
      botao.classList.toggle(
        'active',
        botao.dataset.authTab === tipo
      );
    });

  mostrarMensagemAuth('');
}

function enviarLogin(event) {
  event.preventDefault();

  const email = document
    .getElementById('login-email')
    .value
    .trim()
    .toLowerCase();

  const senha = document
    .getElementById('login-password')
    .value;

  const resultado = fazerLogin(email, senha);

  if (!resultado.sucesso) {
    mostrarMensagemAuth(resultado.mensagem);
    return;
  }

  window.location.href = 'pages/dashboard.html';
}

function enviarCadastro(event) {
  event.preventDefault();

  const nome = document
    .getElementById('register-name')
    .value
    .trim();

  const email = document
    .getElementById('register-email')
    .value
    .trim()
    .toLowerCase();

  const senha = document
    .getElementById('register-password')
    .value;

  if (!nome || !email || !senha) {
    mostrarMensagemAuth(
      'Preencha todos os campos.'
    );
    return;
  }

  const resultado =
    cadastrarUsuario(nome, email, senha);

  if (!resultado.sucesso) {
    mostrarMensagemAuth(resultado.mensagem);
    return;
  }

  salvarSessao(resultado.usuario.email);

  window.location.href = 'pages/dashboard.html';
}

function iniciarAutenticacao() {
  const botaoEntrar =
    document.getElementById('open-login');

  const botaoHeroLogin =
    document.getElementById('hero-login');

  const botaoCadastro =
    document.getElementById('hero-register');

  const botaoFechar =
    document.getElementById('close-auth');

  const formularioLogin =
    document.getElementById('login-form');

  const formularioCadastro =
    document.getElementById('register-form');

  const modal =
    document.getElementById('auth-modal');

  botaoEntrar.addEventListener('click', () => {
    abrirAuth('login');
  });

  botaoHeroLogin.addEventListener('click', () => {
    abrirAuth('login');
  });

  botaoCadastro.addEventListener('click', () => {
    abrirAuth('register');
  });

  botaoFechar.addEventListener(
    'click',
    fecharAuth
  );

  formularioLogin.addEventListener(
    'submit',
    enviarLogin
  );

  formularioCadastro.addEventListener(
    'submit',
    enviarCadastro
  );

  document
    .querySelectorAll('[data-auth-tab]')
    .forEach(botao => {
      botao.addEventListener('click', () => {
        trocarAbaAuth(botao.dataset.authTab);
      });
    });

  modal.addEventListener('click', event => {
    if (event.target === modal) {
      fecharAuth();
    }
  });
}

document.addEventListener(
  'DOMContentLoaded',
  iniciarAutenticacao
);