-- Student Saver / Financial Clarity
-- Basic SQL schema (SQLite syntax; works on MySQL with tiny tweaks noted below)

DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS budget_goal;

CREATE TABLE categories (
    id            INTEGER PRIMARY KEY AUTOINCREMENT, -- MySQL: INT AUTO_INCREMENT
    name          TEXT NOT NULL,
    icon          TEXT NOT NULL,          -- material-symbols icon name
    color         TEXT NOT NULL,          -- tailwind color token used on frontend
    monthly_limit REAL NOT NULL DEFAULT 0
);

CREATE TABLE transactions (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    merchant     TEXT NOT NULL,
    description  TEXT,
    category_id  INTEGER,
    amount       REAL NOT NULL,
    txn_type     TEXT NOT NULL DEFAULT 'expense', -- 'expense' or 'income'
    txn_date     TEXT NOT NULL,                    -- ISO 'YYYY-MM-DD HH:MM'
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE budget_goal (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    goal_name      TEXT NOT NULL,
    target_amount  REAL NOT NULL,
    current_amount REAL NOT NULL,
    monthly_budget REAL NOT NULL,
    streak_days    INTEGER NOT NULL DEFAULT 0,
    accuracy_pct   INTEGER NOT NULL DEFAULT 0
);

-- Seed data matching the design mock
INSERT INTO categories (name, icon, color, monthly_limit) VALUES
 ('Food & Drink',       'restaurant',      'primary-container', 16000),
 ('Travel',             'directions_bus',  'tertiary-container', 6000),
 ('Stationery & Books', 'book',            'secondary',          4000),
 ('Entertainment',      'subscriptions',   'error-container',   10000);

INSERT INTO transactions (merchant, description, category_id, amount, txn_type, txn_date) VALUES
 ('Campus Canteen',  'Lunch Special',    1, 250.00,  'expense', '2024-10-16 12:45'),
 ('Auto Rickshaw',    'Hostel to Library', 2, 80.00,  'expense', '2024-10-15 09:15'),
 ('Higginbothams',    'Reference Books',  3, 1850.00,'expense', '2024-10-14 00:00'),
 ('Hotstar Student',  'Annual Plan',      4, 499.00, 'expense', '2024-10-12 00:00');

INSERT INTO budget_goal (goal_name, target_amount, current_amount, monthly_budget, streak_days, accuracy_pct) VALUES
 ('New Tablet', 42000, 25000, 40000, 14, 92);
