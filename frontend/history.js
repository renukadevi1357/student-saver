// =====================================================================
// history.html — page-specific logic.
// Shared stuff (API_BASE, inr, modal, toast, category dropdown) lives in
// common.js, which is loaded before this file.
//
// Strategy: fetch the full transaction list ONCE from
// GET /api/transactions?type=all, then do type-filtering and text search
// entirely client-side. This keeps the page snappy (typing in the search
// box doesn't hit the network) and the backend API stays untouched.
// =====================================================================

let allTransactions = [];
let historyFilter = "all";

async function loadHistory() {
  const tbody = document.getElementById("txnTableBody");
  try {
    const res = await fetch(`${API_BASE}/api/transactions?type=all`);
    allTransactions = await res.json();
    renderHistory();
  } catch (e) {
    console.error("Failed to load transaction history:", e);
    tbody.innerHTML = `<tr><td class="p-8 text-center text-sm text-error" colspan="4">Could not reach backend at ${API_BASE}. Is the Java server running?</td></tr>`;
  }
}

function renderHistory() {
  const tbody = document.getElementById("txnTableBody");
  const searchTerm = (document.getElementById("historySearch").value || "").trim().toLowerCase();

  let rows = allTransactions;
  if (historyFilter !== "all") {
    rows = rows.filter((r) => r.type === historyFilter);
  }
  if (searchTerm) {
    rows = rows.filter(
      (r) =>
        (r.merchant || "").toLowerCase().includes(searchTerm) ||
        (r.description || "").toLowerCase().includes(searchTerm) ||
        (r.categoryName || "").toLowerCase().includes(searchTerm)
    );
  }

  // summary totals reflect whatever is currently filtered/searched
  let totalExpenses = 0;
  let totalIncome = 0;
  rows.forEach((r) => {
    if (r.type === "income") totalIncome += r.amount;
    else totalExpenses += r.amount;
  });
  document.getElementById("sumExpenses").textContent = inr(totalExpenses);
  document.getElementById("sumIncome").textContent = inr(totalIncome);
  document.getElementById("sumNet").textContent = inr(totalIncome - totalExpenses);
  document.getElementById("resultCount").textContent = `Showing ${rows.length} of ${allTransactions.length} transactions`;

  if (!rows.length) {
    tbody.innerHTML = `<tr><td class="p-8 text-center text-sm text-on-surface-variant" colspan="4">No transactions match your search.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows
    .map(
      (r) => `
    <tr class="hover:bg-surface-container-lowest transition-colors cursor-pointer group">
      <td class="px-8 py-5">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-surface-container flex items-center justify-center rounded-lg">
            <span class="material-symbols-outlined text-primary">${r.categoryIcon}</span>
          </div>
          <div>
            <p class="text-sm font-bold text-on-surface">${r.merchant}</p>
            <p class="text-xs text-on-surface-variant">${r.description || ""}</p>
          </div>
        </div>
      </td>
      <td class="px-8 py-5">
        <span class="px-3 py-1 ${colorBg[r.categoryColor] || "bg-secondary-container/20 text-on-secondary-container"} rounded-full text-xs font-bold">${r.categoryName}</span>
      </td>
      <td class="px-8 py-5 text-sm text-on-surface-variant">${r.date}</td>
      <td class="px-8 py-5 text-sm font-bold text-on-surface text-right">${r.type === "income" ? "+" : "-"}${inr(r.amount)}</td>
    </tr>
  `
    )
    .join("");
}

// ---- event wiring ---------------------------------------------------------
document.getElementById("historyFilterTabs").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-type]");
  if (!btn) return;
  historyFilter = btn.dataset.type;
  [...document.getElementById("historyFilterTabs").children].forEach((b) => b.classList.remove("bg-surface-container-high"));
  btn.classList.add("bg-surface-container-high");
  renderHistory();
});

document.getElementById("historySearch").addEventListener("input", renderHistory);

// after the shared modal saves a new expense, reload the full list
window.onExpenseSaved = () => {
  loadHistory();
};

// ---- initial load ---------------------------------------------------------
loadHistory();
