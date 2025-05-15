function getLoggedInUserEmail() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  return user?.email || "guest";
}

function getCartKey() {
  return `cart_${getLoggedInUserEmail()}`;
}

function addToCart(productName, price) {
  const cart = JSON.parse(localStorage.getItem(getCartKey())) || [];
  const existingItem = cart.find(item => item.name === productName);

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ name: productName, price, qty: 1 });
  }

  localStorage.setItem(getCartKey(), JSON.stringify(cart));
  showNotification(`🛒 ${productName} added to cart!`);
}

function loadCart() {
  const cart = JSON.parse(localStorage.getItem(getCartKey())) || [];
  const cartContainer = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  if (!cartContainer || !cartTotal) return;

  if (cart.length === 0) {
cartContainer.innerHTML = `
  <div class="empty-cart text-center py-5">
    <i class="bi bi-cart-x display-1 text-muted"></i>
    <h3 class="mt-3">Your cart is empty</h3>
    <p class="text-muted">Looks like you haven't added anything yet.</p>
    <a href="products.html" class="btn btn-gold mt-3">Browse Products</a>
  </div>
`;
    cartTotal.textContent = "Total: ₱0.00";
    return;
  }

  let total = 0;
  const rows = cart.map((item, i) => {
    const subtotal = item.price * item.qty;
    total += subtotal;
    return `
      <tr>
        <td>${item.name}</td>
        <td><input type="number" value="${item.qty}" min="1" onchange="updateQuantity(${i}, this.value)" class="form-control text-center" /></td>
        <td>₱${item.price.toFixed(2)}</td>
        <td>₱${subtotal.toFixed(2)}</td>
        <td><button class="btn btn-sm btn-danger" onclick="removeItem(${i})">Remove</button></td>
      </tr>`;
  });

  cartContainer.innerHTML = `<table class="table table-bordered text-center">
    <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th><th>Action</th></tr></thead>
    <tbody>${rows.join("")}</tbody></table>`;
  cartTotal.textContent = `Total: ₱${total.toFixed(2)}`;
}



function updateQuantity(index, qty) {
  const cart = JSON.parse(localStorage.getItem(getCartKey())) || [];
  cart[index].qty = parseInt(qty) || 1;
  localStorage.setItem(getCartKey(), JSON.stringify(cart));
  loadCart();
}

function removeItem(index) {
  const cart = JSON.parse(localStorage.getItem(getCartKey())) || [];
  cart.splice(index, 1);
  localStorage.setItem(getCartKey(), JSON.stringify(cart));
  loadCart();
}

let selectedRating = 0;

function toggleFeedbackBox() {
  const box = document.getElementById("feedbackBox");
  box.style.display = box.style.display === "none" ? "block" : "none";
}

document.getElementById("feedbackToggle")?.addEventListener("click", toggleFeedbackBox);

document.querySelectorAll("#emojiRating span").forEach(emoji => {
  emoji.addEventListener("click", function () {
    selectedRating = parseInt(this.getAttribute("data-rating"));
    document.querySelectorAll("#emojiRating span").forEach(e => e.classList.remove("selected"));
    this.classList.add("selected");
  });
});

function submitEmojiFeedback() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const message = document.getElementById("emojiFeedbackMessage").value.trim();
  const emoji = document.querySelector("#emojiRating span.selected")?.textContent || "";

if (!user || !selectedRating || !message) {
  showNotification("⚠️ Please provide a rating, message, and make sure you're logged in.");
  return;
}


  const feedback = {
    username: user.username,
    rating: selectedRating,
    emoji,
    message,
    timestamp: new Date().toLocaleString()
  };

  const feedbacks = JSON.parse(localStorage.getItem("feedbackList")) || [];
  feedbacks.push(feedback);
  localStorage.setItem("feedbackList", JSON.stringify(feedbacks));

  document.getElementById("emojiFeedbackMessage").value = "";
  selectedRating = 0;
  document.querySelectorAll("#emojiRating span").forEach(e => e.classList.remove("selected"));

  toggleFeedbackBox();
  showNotification("Thank you for your feedback!");
  renderFeedbackList();
}

function renderFeedbackList() {
  const list = JSON.parse(localStorage.getItem("feedbackList")) || [];
  const container = document.getElementById("feedbackList");
  if (!container) return;
  container.innerHTML = list.map(fb => `
    <div class="border rounded p-3 mb-3 bg-light shadow-sm">
      <div><strong>${fb.emoji} ${fb.rating * 20}%</strong> from <span class="text-gold">${fb.username}</span></div>
      <div class="mt-1">${fb.message}</div>
      <small class="text-muted">${fb.timestamp}</small>
    </div>`).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  setupFormAutoTab("loginForm");
  setupFormAutoTab("signupForm");
  setupFormAutoTab("checkoutForm");
  setupFormAutoTab("contactForm");
  renderFeedbackList();
  showCheckoutSummary();
  if (document.getElementById("cart-items")) loadCart();

const signupForm = document.getElementById("signupForm");
signupForm?.addEventListener("submit", function (e) {
e.preventDefault();

  const username = document.getElementById("signupUsername")?.value.trim();
  const email = document.getElementById("signupEmail")?.value.trim();
  const password = document.getElementById("signupPassword")?.value;

  if (!username || !email || !password) {
    showNotification("⚠️ Please fill in all fields.");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.some(user => user.email === email)) {
    showNotification("⚠️ This email is already registered.");
    return;
  }

  users.push({ username, email, password });
  localStorage.setItem("users", JSON.stringify(users));

  showNotification("Account created! Redirecting to login...");
  setTimeout(() => window.location.href = "login.html", 2000);
});


const loginForm = document.getElementById("loginForm");
loginForm?.addEventListener("submit", function (e) {
e.preventDefault();

  const email = document.getElementById("loginEmail")?.value.trim();
  const password = document.getElementById("loginPassword")?.value;
  const users = JSON.parse(localStorage.getItem("users")) || [];

  const validUser = users.find(user => user.email === email && user.password === password);

  if (validUser) {
    localStorage.setItem("loggedInUser", JSON.stringify(validUser));
    showNotification(`Welcome back, ${validUser.username}!`);
    setTimeout(() => window.location.href = "index.html", 1500);
  } else {
    showNotification("Invalid email or password.");
  }
});


  const loader = document.getElementById("preloader");
  if (loader) loader.style.display = "none";
});

function showNotification(message) {
  const box = document.getElementById("notification");
  if (!box) return;
  box.textContent = message;
  box.classList.add("show");
  setTimeout(() => box.classList.remove("show"), 2000);
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupFormAutoTab(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  const fields = Array.from(form.querySelectorAll("input, select, textarea"));
  const submitBtn = form.querySelector("button[type='submit']");
  fields.forEach((field, index) => {
    field.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        const next = fields[index + 1];
        next ? next.focus() : submitBtn?.click();
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.2 });

  cards.forEach(card => observer.observe(card));
});

function showNotification(message) {
  const box = document.getElementById("notification");
  if (!box) return;

  box.textContent = message;
  box.style.display = "block";
  box.classList.add("show");

  setTimeout(() => {
    box.classList.remove("show");
    setTimeout(() => {
      box.style.display = "none";
    }, 500);
  }, 3000);
}

function logout() {
  const loader = document.getElementById("logoutLoader");
  if (loader) loader.style.display = "flex";

  setTimeout(() => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  }, 3000);
}

function showCheckoutSummary() {
  const key = getCartKey();
  const summaryBox = document.getElementById("checkout-summary");
  const cart = JSON.parse(localStorage.getItem(key)) || [];

  if (!summaryBox) return;

  if (cart.length === 0) {
    summaryBox.innerHTML = `
      <div class="text-center text-muted">
        <i class="bi bi-cart-x" style="font-size: 3rem;"></i>
        <p class="mt-2">Your cart is empty.</p>
      </div>`;
    return;
  }

  let total = 0;
  let totalItems = 0;

  const itemsHtml = cart.map(item => {
    const subtotal = item.qty * item.price;
    total += subtotal;
    totalItems += item.qty;
    return `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div>${item.name} × ${item.qty}</div>
        <div>₱${subtotal.toFixed(2)}</div>
      </div>`;
  }).join("");

  summaryBox.innerHTML = `
    ${itemsHtml}
    <hr />
    <div class="d-flex justify-content-between fw-bold">
      <div>Total Items: ${totalItems}</div>
      <div>Total: ₱${total.toFixed(2)}</div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.classList.add("was-validated");
        return;
      }

      const name = document.getElementById("contactName").value.trim();
      const email = document.getElementById("contactEmail").value.trim();
      const message = document.getElementById("contactMessage").value.trim();

      console.log("Message Sent:", { name, email, message });

      showNotification("Thank you for contacting us! We'll get back to you soon.");
      contactForm.reset();
      contactForm.classList.remove("was-validated");
    });
  }
});

