// =====================================================================
// categories.html — page-specific logic.
// Shared stuff (API_BASE, inr, modal, toast, category dropdown) lives in
// common.js, which is loaded before this file.
//
// There's no dedicated "category spend" endpoint, so this page combines
// two existing calls:
//   GET /api/categories  -> id, name, icon, color, monthlyLimit
//   GET /api/dashboard   -> .categories[] with this month's spent/percent
//                           (already computed server-side, per category)
// and merges them by category name.
// =====================================================================

const cardAccent = {
  "primary-container": "border-primary-container",
  "tertiary-container": "border-tertiary-container",
  "secondary": "border-secondary",
  "error-container": "border-error-container"
};
const iconChip = {
  "primary-container": "bg-primary-container/10 text-primary-container",
  "tertiary-container": "bg-tertiary-container/10 text-tertiary-container",
  "secondary": "bg-secondary-container/30 text-secondary",
  "error-container": "bg-error-container/20 text-error"
};

async function loadCategoriesPage() {
  const grid = document.getElementById("categoriesGrid");
  try {
    const [catRes, dashRes] = await Promise.all([
      fetch(`${API_BASE}/api/categories`),
      fetch(`${API_BASE}/api/dashboard`)
    ]);
    const categories = await catRes.json(); // id, name, icon, color, monthlyLimit
    const dashboard = await dashRes.json(); // .categories[] = name, icon, color, spent, percent

    const spendByName = {};
    (dashboard.categories || []).forEach((c) => {
      spendByName[c.name] = { spent: c.spent, percent: c.percent };
    });

    if (!categories.length) {
      grid.innerHTML = `<p class="text-sm text-on-surface-variant col-span-full">No categories found.</p>`;
      return;
    }

    grid.innerHTML = categories
      .map((c) => {
        const spend = spendByName[c.name] || { spent: 0, percent: 0 };
        const remaining = c.monthlyLimit - spend.spent;
        const overBudget = remaining < 0;
        const accent = cardAccent[c.color] || "border-outline-variant";
        const chip = iconChip[c.color] || "bg-secondary-container/30 text-secondary";
        const barCls = barColor[c.color] || "bg-secondary";

        return `
        <div class="bg-white border-l-4 ${accent} border border-outline-variant rounded-xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-lg ${chip} flex items-center justify-center">
                <span class="material-symbols-outlined">${c.icon}</span>
              </div>
              <div>
                <p class="font-bold text-on-surface">${c.name}</p>
                <p class="text-xs text-on-surface-variant">Monthly limit ${inr(c.monthlyLimit)}</p>
              </div>
            </div>
          </div>

          <div class="flex justify-between items-baseline mb-2">
            <span class="text-2xl font-bold text-on-surface">${inr(spend.spent)}</span>
            <span class="text-xs text-on-surface-variant">of ${inr(c.monthlyLimit)}</span>
          </div>
          <div class="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden mb-3">
            <div class="h-full ${barCls} rounded-full" style="width: ${Math.min(100, spend.percent)}%;"></div>
          </div>

          <p class="text-xs font-semibold ${overBudget ? "text-error" : "text-primary"}">
            ${overBudget ? `Over budget by ${inr(Math.abs(remaining))}` : `${inr(remaining)} remaining`}
          </p>
        </div>`;
      })
      .join("");
  } catch (e) {
    console.error("Failed to load categories:", e);
    grid.innerHTML = `<p class="text-sm text-error col-span-full">Could not reach backend at ${API_BASE}. Is the Java server running?</p>`;
  }
}

// after the shared modal saves a new expense, refresh the spend numbers
window.onExpenseSaved = () => {
  loadCategoriesPage();
};

// ---- initial load ---------------------------------------------------------
loadCategoriesPage();
