// =====================================================================
// Financial Clarity — shared logic used by ALL pages
// (index.html, history.html, categories.html, profile.html)
//
// Every page includes this file BEFORE its own page-specific script.
// It owns: the API base URL, formatting helpers, the color-token maps,
// the "Add Expense" modal (shared markup + wiring), and the toast.
//
// Pages that want to refresh themselves after an expense is saved should
// set `window.onExpenseSaved = function () { ...reload this page's data... }`
// in their own script file. common.js calls it automatically after a
// successful save (if it's been set).
// =====================================================================

const API_BASE = "http://localhost:8080";

// ---- formatting helpers -------------------------------------------------
const inr = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// map category "color" tokens (from the DB) to Tailwind classes
const colorBg = {
  "primary-container": "bg-primary-container/10 text-primary-container",
  "tertiary-container": "bg-tertiary-container/10 text-tertiary-container",
  "secondary": "bg-secondary-container/20 text-on-secondary-container",
  "error-container": "bg-error-container/20 text-error"
};
const barColor = {
  "primary-container": "bg-primary-container",
  "tertiary-container": "bg-tertiary-container",
  "secondary": "bg-secondary",
  "error-container": "bg-error-container"
};

let categoriesCache = [];

// ---- categories (used to populate the "Add Expense" form) ---------------
async function loadCategoriesIntoForm() {
  try {
    const res = await fetch(`${API_BASE}/api/categories`);
    categoriesCache = await res.json();
    const sel = document.getElementById("fCategory");
    if (sel) {
      sel.innerHTML = categoriesCache.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
    }
  } catch (e) {
    console.error("Failed to load categories:", e);
  }
}

// ---- toast ----------------------------------------------------------------
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  document.getElementById("toastMsg").textContent = msg;
  toast.classList.remove("opacity-0", "translate-y-10", "pointer-events-none");
  toast.classList.add("opacity-100", "translate-y-0");
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-10", "pointer-events-none");
    toast.classList.remove("opacity-100", "translate-y-0");
  }, 2500);
}

// ---- Add Expense modal ----------------------------------------------------
function openModal() {
  const modal = document.getElementById("expenseModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}
function closeModal() {
  const modal = document.getElementById("expenseModal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

// Wire up every element that should open/close the modal, IF that element
// exists on the current page (not every page necessarily has all of them,
// though in this app all four pages do).
["quickAddExpense", "addExpenseBtn"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("click", openModal);
});
const navLogExpenseEl = document.getElementById("navLogExpense");
if (navLogExpenseEl) {
  navLogExpenseEl.addEventListener("click", (e) => {
    e.preventDefault();
    openModal();
  });
}
const closeModalBtnEl = document.getElementById("closeModalBtn");
if (closeModalBtnEl) closeModalBtnEl.addEventListener("click", closeModal);

const expenseFormEl = document.getElementById("expenseForm");
if (expenseFormEl) {
  expenseFormEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      merchant: document.getElementById("fMerchant").value,
      description: document.getElementById("fDescription").value,
      categoryId: document.getElementById("fCategory").value,
      type: document.getElementById("fType").value,
      amount: document.getElementById("fAmount").value
    };
    try {
      const res = await fetch(`${API_BASE}/api/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Save failed");

      closeModal();
      expenseFormEl.reset();
      showToast("Expense logged successfully!");

      // let the current page decide how to refresh itself
      if (typeof window.onExpenseSaved === "function") {
        window.onExpenseSaved();
      }
    } catch (err) {
      showToast("Could not save expense. Check backend connection.");
    }
  });
}

// every page needs the category dropdown populated for the modal
loadCategoriesIntoForm();
