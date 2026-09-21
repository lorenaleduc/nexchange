const STORAGE_KEYS = {
  usuarios: 'nexchange-users',
  sessao: 'nexchange-session',
  ativos: 'nexchange-assets',
  dados: 'nexchange-user-data'
};


function buscarUsuarios() {
  return JSON.parse(
    localStorage.getItem(
      STORAGE_KEYS.usuarios
    )
  ) || [];
}


function salvarUsuarios(usuarios) {
  localStorage.setItem(
    STORAGE_KEYS.usuarios,
    JSON.stringify(usuarios)
  );
}


function buscarSessao() {
  return localStorage.getItem(
    STORAGE_KEYS.sessao
  );
}


function salvarSessao(email) {
  localStorage.setItem(
    STORAGE_KEYS.sessao,
    email
  );
}


function removerSessao() {
  localStorage.removeItem(
    STORAGE_KEYS.sessao
  );
}


function buscarAtivos() {
  return JSON.parse(
    localStorage.getItem(
      STORAGE_KEYS.ativos
    )
  );
}


function salvarAtivos(ativos) {
  localStorage.setItem(
    STORAGE_KEYS.ativos,
    JSON.stringify(ativos)
  );
}


function buscarTodosDadosUsuarios() {
  return JSON.parse(
    localStorage.getItem(
      STORAGE_KEYS.dados
    )
  ) || {};
}


function buscarDadosUsuario(email) {
  const dados =
    buscarTodosDadosUsuarios();

  return dados[email] || null;
}


function salvarDadosUsuario(
  email,
  dadosUsuario
) {
  const dados =
    buscarTodosDadosUsuarios();

  dados[email] =
    dadosUsuario;

  localStorage.setItem(
    STORAGE_KEYS.dados,
    JSON.stringify(dados)
  );
}


function alterarEmailDadosUsuario(
  emailAntigo,
  emailNovo
) {
  if (emailAntigo === emailNovo) {
    return;
  }

  const dados =
    buscarTodosDadosUsuarios();

  if (!dados[emailAntigo]) {
    return;
  }

  dados[emailNovo] =
    dados[emailAntigo];

  delete dados[emailAntigo];

  localStorage.setItem(
    STORAGE_KEYS.dados,
    JSON.stringify(dados)
  );
}