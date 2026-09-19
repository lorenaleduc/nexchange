let usuarioAtual = null;

let usuarioEmEdicao = null;


function carregarUsuarioAtual() {
  usuarioAtual = verificarSessao();

  if (!usuarioAtual) {
    window.location.href = '../index.html';
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

  const iniciais = usuarioAtual.name
    .split(' ')
    .slice(0, 2)
    .map(nome => nome[0])
    .join('')
    .toUpperCase();

  const administrador =
    usuarioAtual.role === 'admin';


  document.getElementById(
    'user-first-name'
  ).textContent = primeiroNome;


  document.getElementById(
    'profile-name'
  ).textContent = usuarioAtual.name;


  document.getElementById(
    'avatar'
  ).textContent = iniciais;


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
      : 'Perfil moderado';


  document
    .getElementById('admin-assets')
    .classList.toggle(
      'hidden',
      !administrador
    );


  document
    .getElementById('admin-users')
    .classList.toggle(
      'hidden',
      !administrador
    );


  if (administrador) {
    renderizarUsuarios();
  }
}


function abrirModalPerfil() {
  document.getElementById(
    'profile-input-name'
  ).value = usuarioAtual.name;


  document.getElementById(
    'profile-input-email'
  ).value = usuarioAtual.email;


  document.getElementById(
    'profile-input-password'
  ).value = '';


  document
    .getElementById('profile-modal')
    .classList.remove('hidden');
}


function fecharModalPerfil() {
  document
    .getElementById('profile-modal')
    .classList.add('hidden');
}


function atualizarPerfil(event) {
  event.preventDefault();

  const nome = document
    .getElementById('profile-input-name')
    .value
    .trim();

  const email = document
    .getElementById('profile-input-email')
    .value
    .trim()
    .toLowerCase();

  const senha = document
    .getElementById('profile-input-password')
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
    usuarioAtual.password = senha;
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


  const emailJaExiste =
    usuarios.some(usuario =>
      usuario.email === email &&
      usuario.email !== usuarioAtual.email
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
        usuarioAtual.email
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
    usuarioAtualizado.password = senha;
  }


  usuarios[indice] =
    usuarioAtualizado;


  salvarUsuarios(usuarios);

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


/* GERENCIAMENTO DE USUÁRIOS */


function renderizarUsuarios() {
  const lista =
    document.getElementById(
      'admin-users-list'
    );

  if (!lista) {
    return;
  }


  const usuarios =
    buscarUsuarios();


  if (usuarios.length === 0) {
    lista.innerHTML = `
      <div class="empty">
        Nenhum usuário cadastrado.
      </div>
    `;

    return;
  }


  lista.innerHTML =
    usuarios.map(usuario => `
      <div class="admin-user-item">

        <div class="admin-user-info">

          <strong>
            ${usuario.name}
          </strong>

          <span>
            ${usuario.email}
          </span>

        </div>

        <div class="admin-user-actions">

          <button
            type="button"
            class="edit-button"
            data-edit-user="${usuario.id}"
          >
            Editar
          </button>

          <button
            type="button"
            class="delete-button"
            data-delete-user="${usuario.id}"
          >
            Excluir
          </button>

        </div>

      </div>
    `).join('');
}


function controlarCliqueUsuario(event) {
  const idEditar =
    Number(
      event.target.dataset.editUser
    );

  const idExcluir =
    Number(
      event.target.dataset.deleteUser
    );


  if (idEditar) {
    abrirEdicaoUsuario(idEditar);
    return;
  }


  if (idExcluir) {
    excluirUsuario(idExcluir);
  }
}


function abrirEdicaoUsuario(id) {
  const usuarios =
    buscarUsuarios();


  const usuario =
    usuarios.find(
      item => item.id === id
    );


  if (!usuario) {
    mostrarToast(
      'Usuário não encontrado.'
    );

    return;
  }


  usuarioEmEdicao = id;


  document.getElementById(
    'admin-user-name'
  ).value = usuario.name;


  document.getElementById(
    'admin-user-email'
  ).value = usuario.email;


  document.getElementById(
    'admin-user-password'
  ).value = '';


  document
    .getElementById(
      'admin-user-modal'
    )
    .classList.remove('hidden');
}


function fecharEdicaoUsuario() {
  usuarioEmEdicao = null;


  document
    .getElementById(
      'admin-user-modal'
    )
    .classList.add('hidden');


  document
    .getElementById(
      'admin-user-form'
    )
    .reset();
}


function salvarEdicaoUsuario(event) {
  event.preventDefault();


  if (!usuarioEmEdicao) {
    return;
  }


  const nome = document
    .getElementById(
      'admin-user-name'
    )
    .value
    .trim();


  const email = document
    .getElementById(
      'admin-user-email'
    )
    .value
    .trim()
    .toLowerCase();


  const senha = document
    .getElementById(
      'admin-user-password'
    )
    .value;


  if (!nome || !email) {
    mostrarToast(
      'Preencha nome e e-mail.'
    );

    return;
  }


  const usuarios =
    buscarUsuarios();


  const indice =
    usuarios.findIndex(
      usuario =>
        usuario.id ===
        usuarioEmEdicao
    );


  if (indice === -1) {
    mostrarToast(
      'Usuário não encontrado.'
    );

    return;
  }


  const emailJaExiste =
    usuarios.some(usuario =>
      usuario.email === email &&
      usuario.id !== usuarioEmEdicao
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


  usuarios[indice] = {
    ...usuarios[indice],
    name: nome,
    email: email
  };


  if (senha) {
    usuarios[indice].password =
      senha;
  }


  salvarUsuarios(usuarios);

  fecharEdicaoUsuario();

  renderizarUsuarios();


  mostrarToast(
    'Usuário atualizado com sucesso.'
  );
}


function excluirUsuario(id) {
  const usuarios =
    buscarUsuarios();


  const usuario =
    usuarios.find(
      item => item.id === id
    );


  if (!usuario) {
    mostrarToast(
      'Usuário não encontrado.'
    );

    return;
  }


  const confirmou =
    confirm(
      `Tem certeza que deseja excluir o usuário "${usuario.name}"?`
    );


  if (!confirmou) {
    return;
  }


  const usuariosAtualizados =
    usuarios.filter(
      item => item.id !== id
    );


  salvarUsuarios(
    usuariosAtualizados
  );


  renderizarUsuarios();


  mostrarToast(
    'Usuário excluído com sucesso.'
  );
}