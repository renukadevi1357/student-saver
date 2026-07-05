// =====================================================================
// profile.html — page-specific logic.
// Shared stuff (API_BASE, inr, modal, toast, category dropdown) lives in
// common.js, which is loaded before this file.
//
// There's no user/account endpoint in the backend, so this page is a
// summary view built entirely from the three existing APIs:
//   GET /api/dashboard      -> totals + budget goal
//   GET /api/transactions   -> used only for a total count
//   GET /api/categories     -> used only for a total count
// =====================================================================

async function loadProfile() {
  try {
    const [dashRes, txnRes, catRes] = await Promise.all([
      fetch(`${API_BASE}/api/dashboard`),
      fetch(`${API_BASE}/api/transactions?type=all`),
      fetch(`${API_BASE}/api/categories`)
    ]);
    const dashboard = await dashRes.json();
    const transactions = await txnRes.json();
    const categories = await catRes.json();

    document.getElementById("statSpent").textContent = inr(dashboard.totalThisMonth);
    document.getElementById("statTxnCount").textContent = transactions.length;
    document.getElementById("statCategoryCount").textContent = categories.length;

    const g = dashboard.budgetGoal || {};
    document.getElementById("statStreak").textContent = g.streakDays ?? 0;

    document.getElementById("goalName").textContent = "Goal: " + (g.name || "-");
    document.getElementById("goalAmounts").textContent = `${inr(g.current || 0)} / ${inr(g.target || 0)}`;
    const goalPct = g.target ? Math.min(100, (g.current / g.target) * 100) : 0;
    document.getElementById("goalProgressBar").style.width = goalPct + "%";
    document.getElementById("goalAccuracy").textContent = `Accuracy: ${g.accuracyPct ?? 0}%`;
  } catch (e) {
    console.error("Failed to load profile data:", e);
    showToast(`Could not reach backend at ${API_BASE}.`);
  }
}

// after the shared modal saves a new expense, refresh these stats
window.onExpenseSaved = () => {
  loadProfile();
};

// ---- initial load ---------------------------------------------------------
loadProfile();
