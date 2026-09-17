document.querySelectorAll("[data-current-year]").forEach((item) => {
  item.textContent = new Date().getFullYear();
});

const currentYear = new Date().getFullYear();
const today = new Date();
today.setHours(23, 59, 59, 999);

function showFieldError(field, message) {
  let error = field.parentElement.querySelector(".field-error");
  if (!error) {
    error = document.createElement("small");
    error.className = "field-error";
    field.insertAdjacentElement("afterend", error);
  }

  error.textContent = message;
  field.classList.toggle("is-invalid", Boolean(message));
  field.setAttribute("aria-invalid", message ? "true" : "false");
  return !message;
}

function validateField(field) {
  const value = field.value.trim();
  const fieldName = (field.name || field.id || "").toLocaleLowerCase("pt-BR");
  let message = "";

  if (field.required && !value) {
    message = "Este campo é obrigatório.";
  } else if (value && fieldName.includes("nome")) {
    const validName = /^[\p{L}\s'-]+$/u.test(value);
    if (!validName) message = "O nome deve conter apenas letras.";
    else if (value.replace(/[^\p{L}]/gu, "").length < 3) message = "Digite um nome válido.";
  } else if (value && (field.type === "email" || fieldName.includes("email"))) {
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    if (!validEmail) message = "Digite um e-mail válido, como nome@dominio.com.";
  } else if (value && (field.type === "tel" || fieldName.includes("telefone"))) {
    const phoneDigits = value.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 11) message = "Digite um telefone com DDD e 10 ou 11 números.";
  } else if (value && (field.type === "date" || field.dataset.validate === "past-date")) {
    const parts = value.split("-").map(Number);
    const enteredDate = new Date(parts[0], parts[1] - 1, parts[2], 12);
    const realDate = enteredDate.getFullYear() === parts[0] && enteredDate.getMonth() === parts[1] - 1 && enteredDate.getDate() === parts[2];
    if (!realDate || parts[0] < 1900 || enteredDate > today) message = "Digite uma data existente, entre 1900 e hoje.";
  } else if (value && /(^|_)(ano|year)($|_)/.test(fieldName)) {
    const year = Number(value);
    if (!/^\d{4}$/.test(value) || year < 1900 || year > currentYear) message = `Digite um ano válido entre 1900 e ${currentYear}.`;
  } else if (value && field.type === "password" && value.length < 6) {
    message = "A senha deve ter pelo menos 6 caracteres.";
  }

  return showFieldError(field, message);
}

document.querySelectorAll(".demo-form").forEach((form) => {
  form.noValidate = true;

  form.querySelectorAll('input[type="date"][data-validate="past-date"]').forEach((field) => {
    field.max = new Date().toISOString().split("T")[0];
    field.min = "1900-01-01";
  });

  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("change", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.classList.contains("is-invalid")) validateField(field);
      const feedback = form.querySelector(".form-feedback");
      if (feedback) feedback.classList.remove("show");
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = [...form.querySelectorAll("input, select, textarea")];
    const valid = fields.map(validateField).every(Boolean);

    if (!valid) {
      form.querySelector(".is-invalid")?.focus();
      return;
    }

    const feedback = form.querySelector(".form-feedback");
    if (feedback) feedback.classList.add("show");
  });
});

const searchInput = document.querySelector("#product-search");
if (searchInput) {
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLocaleLowerCase("pt-BR");
    document.querySelectorAll(".product-item").forEach((item) => {
      item.hidden = !item.textContent.toLocaleLowerCase("pt-BR").includes(query);
    });
  });
}

const categoryLinks = [...document.querySelectorAll('.category-tabs a[href^="#"]')];
categoryLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const section = document.querySelector(link.getAttribute("href"));
    if (!section) return;

    event.preventDefault();
    categoryLinks.forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", link.getAttribute("href"));
  });
});

if (categoryLinks.length && "IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visibleSection = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visibleSection) return;

    categoryLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visibleSection.target.id}`);
    });
  }, { rootMargin: "-120px 0px -55% 0px", threshold: [0, 0.25, 0.5] });

  document.querySelectorAll(".product-section[id]").forEach((section) => sectionObserver.observe(section));
}

const cart = [];
const countElement = document.querySelector("#cart-count");
const totalElement = document.querySelector("#cart-total");
const itemsElement = document.querySelector("#order-items");

function updateCart() {
  if (!countElement || !totalElement || !itemsElement) return;
  countElement.textContent = cart.length;
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  totalElement.textContent = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  if (!cart.length) {
    itemsElement.className = "order-empty";
    itemsElement.textContent = "Seu carrinho está vazio.";
    return;
  }
  itemsElement.className = "cart-items";
  itemsElement.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <span class="cart-item-name">${item.name}</span>
      <span class="cart-item-actions">
        <strong>${item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
        <button class="remove-item" type="button" data-cart-index="${index}" aria-label="Remover ${item.name}" title="Remover item">×</button>
      </span>
    </div>
  `).join("");
}

if (itemsElement) {
  itemsElement.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".remove-item");
    if (!removeButton) return;

    const itemIndex = Number(removeButton.dataset.cartIndex);
    cart.splice(itemIndex, 1);
    updateCart();
  });
}

document.querySelectorAll(".add-item").forEach((button) => {
  button.addEventListener("click", () => {
    const product = button.closest(".product-item");
    cart.push({ name: product.dataset.product, price: Number(product.dataset.price) });
    updateCart();
    button.textContent = "✓";
    window.setTimeout(() => { button.textContent = "+"; }, 700);
  });
});
