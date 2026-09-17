const ADMIN_PASSWORD = "123";
const SESSION_KEY = "komorebi-admin-session";

const orders = [
  { id: 1048, customer: "Marina Alves", time: "19:42", type: "Entrega", address: "Rua das Cerejeiras, 82", items: ["1× Combinado Tradicional", "2× Gyoza Suíno"], total: 120, status: "active" },
  { id: 1047, customer: "Lucas Ferreira", time: "19:31", type: "Retirada", address: "Retirada no balcão", items: ["2× Ramen da Casa", "1× Mochi Trio"], total: 98, status: "active" },
  { id: 1046, customer: "Beatriz Nunes", time: "19:18", type: "Entrega", address: "Av. Central, 415, ap. 23", items: ["1× Poke de Salmão", "1× Parfait de Matcha"], total: 73, status: "active" },
  { id: 1045, customer: "Rafael Lima", time: "18:56", type: "Entrega", address: "Alameda Japão, 27", items: ["1× Teppanyaki de Salmão", "1× Kakigori de Morango"], total: 80, status: "active" },
  { id: 1044, customer: "Camila Rocha", time: "18:35", type: "Retirada", address: "Retirada no balcão", items: ["1× Hot Roll Especial", "1× Temaki de Salmão"], total: 60, status: "finished" },
  { id: 1043, customer: "Pedro Martins", time: "18:12", type: "Entrega", address: "Rua do Sol, 190", items: ["1× Tonkatsu Teishoku", "1× Dorayaki"], total: 51.99, status: "finished" },
  { id: 1042, customer: "Ana Ribeiro", time: "17:48", type: "Entrega", address: "Rua das Flores, 301", items: ["1× Experiência Kaiseki"], total: 210, status: "finished" }
];

let currentView = "active";

const loginView = document.querySelector("#admin-login-view");
const dashboard = document.querySelector("#admin-dashboard");
const loginForm = document.querySelector("#admin-login-form");
const cpfInput = document.querySelector("#admin-cpf");
const passwordInput = document.querySelector("#admin-password");
const ordersContainer = document.querySelector("#admin-orders");
const emptyState = document.querySelector("#admin-empty");
const searchInput = document.querySelector("#admin-search");
const adminNav = document.querySelector(".admin-nav");
const publicNav = document.querySelector(".public-nav");
const adminMenuToggle = document.querySelector(".admin-menu-toggle");
const brandSubtitle = document.querySelector("#admin-brand-sub");

document.querySelectorAll("[data-current-year]").forEach((item) => {
  item.textContent = new Date().getFullYear();
});

function onlyDigits(value) {
  return value.replace(/\D/g, "");
}

function formatCpf(value) {
  return onlyDigits(value).slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function setFieldError(input, message) {
  const error = document.querySelector(`#${input.id === "admin-cpf" ? "cpf" : "password"}-error`);
  error.textContent = message;
  input.classList.toggle("is-invalid", Boolean(message));
  input.setAttribute("aria-invalid", message ? "true" : "false");
  return !message;
}

function currency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function updateSummary() {
  const active = orders.filter((order) => order.status === "active");
  const finished = orders.filter((order) => order.status === "finished");
  document.querySelector("#active-count").textContent = active.length;
  document.querySelector("#finished-count").textContent = finished.length;
  document.querySelector("#stat-active").textContent = active.length;
  document.querySelector("#stat-finished").textContent = finished.length;
  document.querySelector("#stat-revenue").textContent = currency(finished.reduce((sum, order) => sum + order.total, 0));
}

function renderOrders() {
  const query = searchInput.value.trim().toLocaleLowerCase("pt-BR");
  const filtered = orders.filter((order) => {
    const matchesView = order.status === currentView;
    const content = `${order.id} ${order.customer} ${order.items.join(" ")}`.toLocaleLowerCase("pt-BR");
    return matchesView && content.includes(query);
  });

  document.querySelector("#view-title").textContent = currentView === "active" ? "Em atendimento" : "Finalizadas";
  document.querySelector("#view-eyebrow").textContent = currentView === "active" ? "Pedidos atuais" : "Histórico de hoje";
  emptyState.hidden = filtered.length > 0;
  ordersContainer.hidden = filtered.length === 0;
  ordersContainer.innerHTML = filtered.map((order) => `
    <article class="admin-order-card">
      <div class="order-card-top">
        <div><span class="order-number">Pedido #${order.id}</span><h3>${order.customer}</h3></div>
        <span class="order-status ${order.status}">${order.status === "active" ? "Em preparo" : "Finalizado"}</span>
      </div>
      <div class="order-meta"><span>◷ ${order.time}</span><span>${order.type === "Entrega" ? "⌂" : "⌁"} ${order.type}</span></div>
      <ul>${order.items.map((item) => `<li>${item}</li>`).join("")}</ul>
      <p class="order-address">${order.address}</p>
      <div class="order-card-bottom"><strong>${currency(order.total)}</strong><button class="${order.status === "active" ? "btn-finish-order" : "btn-reopen-order"}" type="button" data-order-id="${order.id}">${order.status === "active" ? "Finalizar pedido" : "Reabrir pedido"}</button></div>
    </article>
  `).join("");
  updateSummary();
}

function showDashboard() {
  loginView.hidden = true;
  dashboard.hidden = false;
  adminNav.hidden = false;
  publicNav.hidden = true;
  adminMenuToggle.hidden = false;
  brandSubtitle.textContent = "Painel do funcionário";
  document.body.classList.add("admin-authenticated");
  renderOrders();
  updateClock();
}

function showLogin() {
  sessionStorage.removeItem(SESSION_KEY);
  loginView.hidden = false;
  dashboard.hidden = true;
  adminNav.hidden = true;
  publicNav.hidden = false;
  adminMenuToggle.hidden = false;
  brandSubtitle.textContent = "O Japão clássico no seu paladar";
  document.body.classList.remove("admin-authenticated");
  loginForm.reset();
  document.querySelector("#login-error").hidden = true;
  setFieldError(cpfInput, "");
  setFieldError(passwordInput, "");
  cpfInput.focus();
}

function updateClock() {
  const clock = document.querySelector("#admin-clock");
  if (clock) clock.textContent = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

cpfInput.addEventListener("input", () => {
  cpfInput.value = formatCpf(cpfInput.value);
  setFieldError(cpfInput, "");
  document.querySelector("#login-error").hidden = true;
});

passwordInput.addEventListener("input", () => {
  setFieldError(passwordInput, "");
  document.querySelector("#login-error").hidden = true;
});

document.querySelector("#password-toggle").addEventListener("click", (event) => {
  const showing = passwordInput.type === "text";
  passwordInput.type = showing ? "password" : "text";
  event.currentTarget.textContent = showing ? "Mostrar" : "Ocultar";
  event.currentTarget.setAttribute("aria-label", showing ? "Mostrar senha" : "Ocultar senha");
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const cpf = onlyDigits(cpfInput.value);
  const cpfValid = setFieldError(cpfInput, !cpf ? "Informe o CPF." : (cpf.length !== 11 ? "Digite os 11 números do CPF." : ""));
  const passwordValid = setFieldError(passwordInput, !passwordInput.value ? "Informe a senha." : "");
  if (!cpfValid || !passwordValid) return;
  if (passwordInput.value !== ADMIN_PASSWORD) {
    document.querySelector("#login-error").hidden = false;
    passwordInput.focus();
    return;
  }
  sessionStorage.setItem(SESSION_KEY, "authenticated");
  showDashboard();
});

document.querySelectorAll("[data-admin-view]").forEach((button) => {
  button.addEventListener("click", () => {
    currentView = button.dataset.adminView;
    document.querySelectorAll("[data-admin-view]").forEach((item) => item.classList.toggle("active", item === button));
    searchInput.value = "";
    renderOrders();
    dashboard.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

ordersContainer.addEventListener("click", (event) => {
  const button = event.target.closest("[data-order-id]");
  if (!button) return;
  const order = orders.find((item) => item.id === Number(button.dataset.orderId));
  if (!order) return;
  order.status = order.status === "active" ? "finished" : "active";
  renderOrders();
});

searchInput.addEventListener("input", renderOrders);
document.querySelector("#admin-logout").addEventListener("click", showLogin);
window.setInterval(updateClock, 60000);

if (sessionStorage.getItem(SESSION_KEY) === "authenticated") showDashboard();
else showLogin();
