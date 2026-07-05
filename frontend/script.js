// =====================================================================
// index.html (Dashboard) — page-specific logic.
// Shared stuff (API_BASE, inr, modal, toast, category dropdown) lives in
// common.js, which is loaded before this file.
// =====================================================================

let currentFilter = "all";

// ---- dashboard summary --------------------------------------------------
async function loadDashboard() {
  try {
    const res = await fetch(`${API_BASE}/api/dashboard`);
    const d = await res.json();

    document.getElementById("totalSpent").textContent = inr(d.totalThisMonth);
    document.getElementById("lastMonthTotal").textContent = inr(d.totalLastMonth);
    document.getElementById("dailyAvg").textContent = inr(d.dailyAvg);
    document.getElementById("budgetLeft").textContent = inr(d.budgetLeft);
    document.getElementById("safeToSpend").textContent = inr(d.safeToSpendPerDay) + "/day";

    const pct = d.percentChange || 0;
    const pctEl = document.getElementById("percentChange");
    const pctIcon = document.getElementById("percentChangeIcon");
    const pctWrap = document.getElementById("percentChangeWrap");
    pctEl.textContent = Math.abs(pct).toFixed(0) + "%";
    if (pct >= 0) {
      pctIcon.textContent = "trending_up";
      pctWrap.classList.add("text-error");
      pctWrap.classList.remove("text-primary");
    } else {
      pctIcon.textContent = "trending_down";
      pctWrap.classList.add("text-primary");
      pctWrap.classList.remove("text-error");
    }

    renderCategories(d.categories || []);
    renderBudgetGoal(d.budgetGoal || {}, d.budgetLeft);
  } catch (e) {
    console.error("Failed to load dashboard:", e);
    document.getElementById("categoryList").innerHTML =
      `<p class="text-sm text-error">Could not reach backend at ${API_BASE}. Is the Java server running?</p>`;
  }
}

function renderCategories(categories) {
  const catList = document.getElementById("categoryList");
  catList.innerHTML = "";
  let totalPctUsed = 0;
  let catCount = 0;

  categories.forEach((c) => {
    catCount++;
    totalPctUsed += c.percent;
    const div = document.createElement("div");
    div.innerHTML = `
      <div class="flex justify-between mb-2">
        <span class="text-sm font-semibold text-on-surface">${c.name}</span>
        <span class="text-sm text-on-surface-variant">${inr(c.spent)}</span>
      </div>
      <div class="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
        <div class="h-full ${barColor[c.color] || "bg-secondary"} rounded-full" style="width: ${c.percent}%;"></div>
      </div>`;
    catList.appendChild(div);
  });

  document.getElementById("budgetUsedLabel").textContent =
    (catCount ? Math.round(totalPctUsed / catCount) : 0) + "% of budget used";
}

function renderBudgetGoal(g, budgetLeft) {
  document.getElementById("goalName").textContent = "Goal: " + (g.name || "-");
  document.getElementById("goalAmounts").textContent = `${inr(g.current || 0)} / ${inr(g.target || 0)}`;
  document.getElementById("goalDescription").textContent =
    `You're doing great! Keep it up to save ${inr(budgetLeft)} by end of semester.`;

  const goalPct = g.target ? Math.min(100, (g.current / g.target) * 100) : 0;
  document.getElementById("goalProgressBar").style.width = goalPct + "%";
  document.getElementById("streakDays").textContent = g.streakDays ?? 0;
  document.getElementById("accuracyPct").textContent = (g.accuracyPct ?? 0) + "%";
}

// ---- transactions table (recent rows preview on the dashboard) ----------
async function loadTransactions(type = "all") {
  const tbody = document.getElementById("txnTableBody");
  try {
    const res = await fetch(`${API_BASE}/api/transactions?type=${type}`);
    const rows = await res.json();

    if (!rows.length) {
      tbody.innerHTML = `<tr><td class="p-8 text-center text-sm text-on-surface-variant" colspan="4">No transactions yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = rows
      .slice(0, 8) // dashboard only previews recent activity; full list lives on history.html
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
  } catch (e) {
    console.error("Failed to load transactions:", e);
    tbody.innerHTML = `<tr><td class="p-8 text-center text-sm text-error" colspan="4">Could not reach backend at ${API_BASE}.</td></tr>`;
  }
}

// ---- event wiring specific to this page ---------------------------------
document.getElementById("filterTabs").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-type]");
  if (!btn) return;
  currentFilter = btn.dataset.type;
  [...document.getElementById("filterTabs").children].forEach((b) => b.classList.remove("bg-surface-container-high"));
  btn.classList.add("bg-surface-container-high");
  loadTransactions(currentFilter);
});

document.getElementById("exportBtn").addEventListener("click", () => showToast("Export coming soon!"));

// "View All Transactions" button -> go to the full history page
const viewAllBtn = document.getElementById("viewAllTransactionsBtn");
if (viewAllBtn) viewAllBtn.addEventListener("click", () => (window.location.href = "history.html"));

// after the shared modal saves a new expense, refresh this page's data
window.onExpenseSaved = () => {
  loadDashboard();
  loadTransactions(currentFilter);
};

// ---- initial load --------------------------------------------------
loadDashboard();
loadTransactions();
