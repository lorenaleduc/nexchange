const STORAGE = "nexchange-price-rules";
const USERS_STORAGE = "nexchange-users";
const SESSION_STORAGE = "nexchange-session";
const ASSETS_STORAGE = "nexchange-assets";
const ADMIN = {
  name: "Administrador",
  email: "admin@nexchange.com",
  password: "admin123",
  role: "admin"
};

const defaultMarket = [
  { symbol: "PETR4", name: "Petrobras PN", kind: "Ação", price: 31.84, change: "+1,18%" },
  { symbol: "VALE3", name: "Vale ON", kind: "Ação", price: 58.26, change: "-0,42%" },
  { symbol: "BTC", name: "Bitcoin", kind: "Cripto", price: 487000, change: "+2,31%" },
  { symbol: "CDB 120%", name: "Renda fixa", kind: "CDB", price: 100, change: "+0,03%" }
];

const initialState = {
  balance: 10000,
  automation: false,
  rules: [],
  history: []
};

let state = loadState();
let currentUser = getSession();
let market = loadAssets();

const $ = id => document.getElementById(id);
const money = value => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function loadState() {
  return JSON.parse(localStorage.getItem(STORAGE)) || { ...initialState };
}

function saveState() {
  localStorage.setItem(STORAGE, JSON.stringify(state));
}

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_STORAGE)) || [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_STORAGE, JSON.stringify(users));
}

function loadAssets() {
  return JSON.parse(localStorage.getItem(ASSETS_STORAGE)) || defaultMarket;
}

function saveAssets() {
  localStorage.setItem(ASSETS_STORAGE, JSON.stringify(market));
}

function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_STORAGE));
}

function saveSession(user) {
  localStorage.setItem(SESSION_STORAGE, JSON.stringify(user));
  currentUser = user;
}

function clearSession() {
  localStorage.removeItem(SESSION_STORAGE);
  currentUser = null;
}

function toast(message) {
  const element = $("toast");
  element.textContent = message;
  element.classList.add("show");
  setTimeout(() => element.classList.remove("show"), 2700);
}

function showAuthMessage(message, isError = true) {
  const element = $("auth-message");
  element.textContent = message;
  element.classList.toggle("error", isError);
  element.classList.toggle("success", !isError);
}

function switchAuthTab(tab) {
  const isLogin = tab === "login";
  $("login-form").classList.toggle("hidden", !isLogin);
  $("register-form").classList.toggle("hidden", isLogin);
  document.querySelectorAll("[data-auth-tab]").forEach(button => {
    button.classList.toggle("active", button.dataset.authTab === tab);
  });
  showAuthMessage("");
}

function updateUserInterface() {
  const firstName = currentUser.name.split(" ")[0];
  const initials = currentUser.name
    .split(" ")
    .slice(0, 2)
    .map(name => name[0])
    .join("")
    .toUpperCase();
  const isAdmin = currentUser.role === "admin";

  $("user-first-name").textContent = firstName;
  $("profile-name").textContent = currentUser.name;
  $("avatar").textContent = initials;
  $("user-role").textContent = isAdmin ? "PAINEL ADMINISTRATIVO" : "PAINEL DO INVESTIDOR";
  $("profile-type").textContent = isAdmin ? "Administrador" : "Perfil moderado";
  $("admin-assets").classList.toggle("hidden", !isAdmin);
}

function showApplication() {
  $("auth-screen").classList.add("hidden");
  $("app-screen").classList.remove("hidden");
  updateUserInterface();
  renderAssets();
  render();
}

function showAuthentication() {
  $("app-screen").classList.add("hidden");
  $("auth-screen").classList.remove("hidden");
  $("login-form").reset();
  switchAuthTab("login");
}

function renderAssets() {
  $("ativos").innerHTML = market.map(asset => `
    <article class="asset">
      <div class="asset-top">
        <span class="asset-symbol">${asset.symbol}</span>
        <span class="asset-kind">${asset.kind}</span>
      </div>
      <h3>${asset.name}</h3>
      <span class="asset-price">${money(asset.price)}</span>
      <span class="asset-change ${asset.change.startsWith("-") ? "down" : ""}">${asset.change}</span>
    </article>
  `).join("");

  $("ativo").innerHTML = market
    .map(asset => `<option value="${asset.symbol}">${asset.symbol} - ${asset.name}</option>`)
    .join("");
  updateCurrentPrice();
  renderAdminAssets();
}

function renderAdminAssets() {
  if (!currentUser || currentUser.role !== "admin") return;

  $("admin-assets-list").innerHTML = market.map(asset => `
    <article class="admin-asset-item">
      <div>
        <strong>${asset.symbol} — ${asset.name}</strong>
        <small>${asset.kind} · ${money(asset.price)} · ${asset.change}</small>
      </div>
      <div class="item-actions">
        <button data-edit-asset="${asset.symbol}" class="edit-button" type="button">Editar</button>
        <button data-delete-asset="${asset.symbol}" class="delete-button" type="button">Excluir</button>
      </div>
    </article>
  `).join("");
}

function updateCurrentPrice() {
  const asset = market.find(item => item.symbol === $("ativo").value);
  $("preco-atual").textContent = `Preço simulado agora: ${money(asset.price)}`;
}

function render() {
  const reserved = state.rules.reduce((sum, rule) => sum + rule.amount, 0);
  $("saldo").textContent = money(state.balance);
  $("reservado").textContent = money(reserved);
  $("regras-resumo").textContent = state.rules.length
    ? `${state.rules.length} regra(s) configurada(s)`
    : "Nenhuma regra ativa";
  $("automacao").checked = state.automation;
  $("automacao-status").textContent = state.automation ? "Ativada" : "Desativada";
  $("automacao-status").style.color = state.automation ? "#12866a" : "#8893a4";
  $("contador-regras").textContent = `${state.rules.length} regra(s)`;

  $("lista-regras").innerHTML = state.rules.length
    ? state.rules.map(rule => `
        <div class="rule">
          <div class="rule-head">
            <strong>Comprar ${rule.asset}</strong>
            <button data-remove="${rule.id}" type="button">Remover</button>
          </div>
          <div class="target">Se chegar a ${money(rule.target)}</div>
          <small>Limite: ${money(rule.amount)} · ${rule.notify ? "Notificação ativada" : "Sem notificação"}</small>
        </div>
      `).join("")
    : '<div class="empty">Nenhuma regra cadastrada. Crie uma regra ao lado para acompanhar um preço.</div>';

  $("historico-corpo").innerHTML = state.history.length
    ? state.history.map(item => `
        <tr><td>${item.date}</td><td>${item.asset}</td><td>${item.action}</td><td>${item.detail}</td></tr>
      `).join("")
    : '<tr><td colspan="4">Nenhuma atividade registrada.</td></tr>';
}

function handleLogin(event) {
  event.preventDefault();
  const email = $("login-email").value.trim().toLowerCase();
  const password = $("login-password").value;
  const user = getUsers().find(item => item.email === email && item.password === password);
  const validAdmin = email === ADMIN.email && password === ADMIN.password;

  if (!user && !validAdmin) {
    showAuthMessage("E-mail ou senha incorretos.");
    return;
  }

  saveSession(validAdmin ? ADMIN : { ...user, role: "investor" });
  showApplication();
}

function handleRegister(event) {
  event.preventDefault();
  const name = $("register-name").value.trim();
  const email = $("register-email").value.trim().toLowerCase();
  const password = $("register-password").value;
  const users = getUsers();

  if (email === ADMIN.email || users.some(user => user.email === email)) {
    showAuthMessage("Já existe uma conta com este e-mail.");
    return;
  }

  const newUser = { name, email, password, role: "investor" };
  users.push(newUser);
  saveUsers(users);
  saveSession(newUser);
  showApplication();
}

function openProfileModal() {
  $("profile-input-name").value = currentUser.name;
  $("profile-input-email").value = currentUser.email;
  $("profile-input-password").value = "";
  $("profile-modal").classList.remove("hidden");
}

function closeProfileModal() {
  $("profile-modal").classList.add("hidden");
}

function handleProfileUpdate(event) {
  event.preventDefault();
  const name = $("profile-input-name").value.trim();
  const email = $("profile-input-email").value.trim().toLowerCase();
  const password = $("profile-input-password").value;
  const isAdmin = currentUser.role === "admin";
  const users = getUsers();

  if (!isAdmin && users.some(user => user.email === email && user.email !== currentUser.email)) {
    toast("Já existe uma conta com este e-mail.");
    return;
  }
  if (isAdmin && email !== ADMIN.email) {
    toast("O e-mail do administrador não pode ser alterado nesta demonstração.");
    return;
  }

  const updatedUser = { ...currentUser, name, email };
  if (password) updatedUser.password = password;

  if (!isAdmin) {
    const index = users.findIndex(user => user.email === currentUser.email);
    users[index] = updatedUser;
    saveUsers(users);
  }
  saveSession(updatedUser);
  updateUserInterface();
  closeProfileModal();
  toast("Perfil atualizado com sucesso.");
}

function resetAssetForm() {
  $("asset-form").reset();
  $("asset-original-symbol").value = "";
  $("asset-submit").textContent = "Adicionar ativo";
  $("asset-cancel").classList.add("hidden");
}

function handleAssetForm(event) {
  event.preventDefault();
  const originalSymbol = $("asset-original-symbol").value;
  const asset = {
    symbol: $("asset-symbol").value.trim().toUpperCase(),
    name: $("asset-name").value.trim(),
    kind: $("asset-kind").value.trim(),
    price: Number($("asset-price").value),
    change: $("asset-change").value.trim()
  };

  if (!asset.symbol || !asset.name || !asset.kind || asset.price <= 0 || !asset.change) {
    toast("Preencha todos os dados do ativo corretamente.");
    return;
  }
  if (market.some(item => item.symbol === asset.symbol && item.symbol !== originalSymbol)) {
    toast("Já existe um ativo com este símbolo.");
    return;
  }

  if (originalSymbol) {
    const index = market.findIndex(item => item.symbol === originalSymbol);
    market[index] = asset;
    state.rules.forEach(rule => {
      if (rule.asset === originalSymbol) rule.asset = asset.symbol;
    });
  } else {
    market.push(asset);
  }
  saveAssets();
  saveState();
  resetAssetForm();
  renderAssets();
  toast(originalSymbol ? "Ativo atualizado." : "Ativo adicionado.");
}

function editAsset(symbol) {
  const asset = market.find(item => item.symbol === symbol);
  $("asset-original-symbol").value = asset.symbol;
  $("asset-name").value = asset.name;
  $("asset-symbol").value = asset.symbol;
  $("asset-kind").value = asset.kind;
  $("asset-price").value = asset.price;
  $("asset-change").value = asset.change;
  $("asset-submit").textContent = "Salvar ativo";
  $("asset-cancel").classList.remove("hidden");
  $("asset-name").focus();
}

function deleteAsset(symbol) {
  if (market.length === 1) {
    toast("Mantenha ao menos um ativo cadastrado na simulação.");
    return;
  }

  market = market.filter(asset => asset.symbol !== symbol);
  state.rules = state.rules.filter(rule => rule.asset !== symbol);
  saveAssets();
  saveState();
  resetAssetForm();
  renderAssets();
  render();
  toast("Ativo excluído e regras relacionadas removidas.");
}

function handleNewRule(event) {
  event.preventDefault();
  const asset = market.find(item => item.symbol === $("ativo").value);
  const target = Number($("preco-alvo").value);
  const amount = Number($("valor").value);

  if (target <= 0 || amount <= 0) {
    toast("Informe valores válidos.");
    return;
  }
  if (amount > state.balance) {
    toast("O limite não pode ser maior que o saldo simulado.");
    return;
  }

  state.rules.unshift({
    id: Date.now(),
    asset: asset.symbol,
    target,
    amount,
    notify: $("notificar").checked
  });
  state.history.unshift({
    date: new Date().toLocaleString("pt-BR"),
    asset: asset.symbol,
    action: "Regra criada",
    detail: `Comprar até ${money(target)}`
  });
  saveState();
  event.target.reset();
  updateCurrentPrice();
  render();
  toast("Regra de compra adicionada.");
}

document.querySelectorAll("[data-auth-tab]").forEach(button => {
  button.addEventListener("click", () => switchAuthTab(button.dataset.authTab));
});

$("login-form").addEventListener("submit", handleLogin);
$("register-form").addEventListener("submit", handleRegister);
$("edit-profile-button").addEventListener("click", openProfileModal);
$("close-profile-modal").addEventListener("click", closeProfileModal);
$("profile-form").addEventListener("submit", handleProfileUpdate);
$("logout-button").addEventListener("click", () => {
  clearSession();
  showAuthentication();
});
$("form-regra").addEventListener("submit", handleNewRule);
$("asset-form").addEventListener("submit", handleAssetForm);
$("asset-cancel").addEventListener("click", resetAssetForm);
$("ativo").addEventListener("change", updateCurrentPrice);
$("automacao").addEventListener("change", event => {
  state.automation = event.target.checked;
  state.history.unshift({
    date: new Date().toLocaleString("pt-BR"),
    asset: "Automação",
    action: state.automation ? "Ativada" : "Desativada",
    detail: "Alteração de configuração"
  });
  saveState();
  render();
  toast(`Automação ${state.automation ? "ativada" : "desativada"}.`);
});
$("lista-regras").addEventListener("click", event => {
  const id = Number(event.target.dataset.remove);
  if (!id) return;

  const rule = state.rules.find(item => item.id === id);
  state.rules = state.rules.filter(item => item.id !== id);
  state.history.unshift({
    date: new Date().toLocaleString("pt-BR"),
    asset: rule.asset,
    action: "Regra removida",
    detail: "Configuração cancelada"
  });
  saveState();
  render();
  toast("Regra removida.");
});
$("admin-assets-list").addEventListener("click", event => {
  const editSymbol = event.target.dataset.editAsset;
  const deleteSymbol = event.target.dataset.deleteAsset;
  if (editSymbol) editAsset(editSymbol);
  if (deleteSymbol) deleteAsset(deleteSymbol);
});
$("limpar-historico").addEventListener("click", () => {
  state.history = [];
  saveState();
  render();
  toast("Histórico limpo.");
});

currentUser ? showApplication() : showAuthentication();
