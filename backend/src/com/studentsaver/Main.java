package com.studentsaver;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Student Saver / Financial Clarity - backend.
 *
 * Plain JDK HttpServer + JDBC + SQLite. No Spring, no Gson - deliberately
 * minimal so it's easy to read, compile, and run.
 *
 * Endpoints:
 *   GET  /api/dashboard              -> summary numbers, category breakdown, budget goal
 *   GET  /api/transactions?type=all|expense|income  -> list of transactions
 *   POST /api/transactions           -> add a new transaction
 *   GET  /api/categories             -> list of categories
 */
public class Main {

    private static final int PORT = 8080;

    public static void main(String[] args) throws IOException {
        Db.initIfNeeded();

        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/api/dashboard", Main::handleDashboard);
        server.createContext("/api/transactions", Main::handleTransactions);
        server.createContext("/api/categories", Main::handleCategories);
        server.setExecutor(null);
        server.start();

        System.out.println("Student Saver backend running on http://localhost:" + PORT);
    }

    // ---------------------------------------------------------------
    // /api/dashboard
    // ---------------------------------------------------------------
    private static void handleDashboard(HttpExchange ex) throws IOException {
        if (!allowCorsAndMethod(ex, "GET")) return;

        try (Connection conn = Db.getConnection()) {
            LocalDate today = LocalDate.now();
            String thisMonthPrefix = today.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            String lastMonthPrefix = today.minusMonths(1).format(DateTimeFormatter.ofPattern("yyyy-MM"));

            double totalThisMonth = sumExpensesForMonth(conn, thisMonthPrefix);
            double totalLastMonth = sumExpensesForMonth(conn, lastMonthPrefix);

            int dayOfMonth = today.getDayOfMonth();
            double dailyAvg = dayOfMonth > 0 ? totalThisMonth / dayOfMonth : 0;

            double monthlyBudget = 0;
            double currentAmount = 0, targetAmount = 0;
            String goalName = "";
            int streak = 0, accuracy = 0;
            try (Statement st = conn.createStatement();
                 ResultSet rs = st.executeQuery("SELECT * FROM budget_goal LIMIT 1")) {
                if (rs.next()) {
                    monthlyBudget = rs.getDouble("monthly_budget");
                    currentAmount = rs.getDouble("current_amount");
                    targetAmount = rs.getDouble("target_amount");
                    goalName = rs.getString("goal_name");
                    streak = rs.getInt("streak_days");
                    accuracy = rs.getInt("accuracy_pct");
                }
            }

            double budgetLeft = monthlyBudget - totalThisMonth;
            int daysLeftInMonth = today.lengthOfMonth() - dayOfMonth;
            double safeToSpendPerDay = daysLeftInMonth > 0 ? Math.max(budgetLeft, 0) / daysLeftInMonth : Math.max(budgetLeft, 0);

            double pctChange = totalLastMonth > 0 ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100 : 0;

            // category breakdown for this month
            StringBuilder catJson = new StringBuilder("[");
            String catSql = "SELECT c.name, c.icon, c.color, c.monthly_limit, " +
                    "COALESCE(SUM(t.amount),0) as spent " +
                    "FROM categories c LEFT JOIN transactions t " +
                    "ON t.category_id = c.id AND t.txn_type='expense' AND t.txn_date LIKE ? " +
                    "GROUP BY c.id ORDER BY spent DESC";
            try (PreparedStatement ps = conn.prepareStatement(catSql)) {
                ps.setString(1, thisMonthPrefix + "%");
                try (ResultSet rs = ps.executeQuery()) {
                    boolean first = true;
                    while (rs.next()) {
                        if (!first) catJson.append(",");
                        first = false;
                        double spent = rs.getDouble("spent");
                        double limit = rs.getDouble("monthly_limit");
                        double pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
                        catJson.append("{")
                                .append(JsonUtil.str("name", rs.getString("name"))).append(",")
                                .append(JsonUtil.str("icon", rs.getString("icon"))).append(",")
                                .append(JsonUtil.str("color", rs.getString("color"))).append(",")
                                .append(JsonUtil.num("spent", spent)).append(",")
                                .append(JsonUtil.num("percent", pct))
                                .append("}");
                    }
                }
            }
            catJson.append("]");

            String json = "{" +
                    JsonUtil.num("totalThisMonth", totalThisMonth) + "," +
                    JsonUtil.num("totalLastMonth", totalLastMonth) + "," +
                    JsonUtil.num("percentChange", pctChange) + "," +
                    JsonUtil.num("dailyAvg", dailyAvg) + "," +
                    JsonUtil.num("budgetLeft", budgetLeft) + "," +
                    JsonUtil.num("safeToSpendPerDay", safeToSpendPerDay) + "," +
                    JsonUtil.num("monthlyBudget", monthlyBudget) + "," +
                    JsonUtil.raw("categories", catJson.toString()) + "," +
                    JsonUtil.raw("budgetGoal", "{" +
                            JsonUtil.str("name", goalName) + "," +
                            JsonUtil.num("target", targetAmount) + "," +
                            JsonUtil.num("current", currentAmount) + "," +
                            JsonUtil.num("streakDays", streak) + "," +
                            JsonUtil.num("accuracyPct", accuracy) +
                            "}") +
                    "}";

            sendJson(ex, 200, json);
        } catch (Exception e) {
            sendJson(ex, 500, "{" + JsonUtil.str("error", e.getMessage()) + "}");
        }
    }

    private static double sumExpensesForMonth(Connection conn, String monthPrefix) throws Exception {
        String sql = "SELECT COALESCE(SUM(amount),0) as total FROM transactions " +
                "WHERE txn_type='expense' AND txn_date LIKE ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, monthPrefix + "%");
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getDouble("total") : 0;
            }
        }
    }

    // ---------------------------------------------------------------
    // /api/transactions  (GET list, POST create)
    // ---------------------------------------------------------------
    private static void handleTransactions(HttpExchange ex) throws IOException {
        String method = ex.getRequestMethod();
        if (method.equalsIgnoreCase("OPTIONS")) { allowCorsAndMethod(ex, "OPTIONS"); return; }

        if (method.equalsIgnoreCase("GET")) {
            if (!allowCorsAndMethod(ex, "GET")) return;
            listTransactions(ex);
        } else if (method.equalsIgnoreCase("POST")) {
            if (!allowCorsAndMethod(ex, "POST")) return;
            createTransaction(ex);
        } else {
            sendJson(ex, 405, "{" + JsonUtil.str("error", "Method not allowed") + "}");
        }
    }

    private static void listTransactions(HttpExchange ex) throws IOException {
        String query = ex.getRequestURI().getQuery();
        String type = "all";
        if (query != null) {
            for (String param : query.split("&")) {
                String[] kv = param.split("=");
                if (kv.length == 2 && kv[0].equals("type")) type = kv[1];
            }
        }

        try (Connection conn = Db.getConnection()) {
            String sql = "SELECT t.id, t.merchant, t.description, t.amount, t.txn_type, t.txn_date, " +
                    "c.name as category_name, c.icon as category_icon, c.color as category_color " +
                    "FROM transactions t LEFT JOIN categories c ON t.category_id = c.id ";
            if (!type.equals("all")) sql += "WHERE t.txn_type = ? ";
            sql += "ORDER BY t.txn_date DESC";

            List<String> rows = new ArrayList<>();
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                if (!type.equals("all")) ps.setString(1, type);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        rows.add("{" +
                                JsonUtil.num("id", rs.getLong("id")) + "," +
                                JsonUtil.str("merchant", rs.getString("merchant")) + "," +
                                JsonUtil.str("description", rs.getString("description")) + "," +
                                JsonUtil.num("amount", rs.getDouble("amount")) + "," +
                                JsonUtil.str("type", rs.getString("txn_type")) + "," +
                                JsonUtil.str("date", rs.getString("txn_date")) + "," +
                                JsonUtil.str("categoryName", rs.getString("category_name") == null ? "Uncategorized" : rs.getString("category_name")) + "," +
                                JsonUtil.str("categoryIcon", rs.getString("category_icon") == null ? "category" : rs.getString("category_icon")) + "," +
                                JsonUtil.str("categoryColor", rs.getString("category_color") == null ? "secondary" : rs.getString("category_color")) +
                                "}");
                    }
                }
            }
            sendJson(ex, 200, "[" + String.join(",", rows) + "]");
        } catch (Exception e) {
            sendJson(ex, 500, "{" + JsonUtil.str("error", e.getMessage()) + "}");
        }
    }

    private static void createTransaction(HttpExchange ex) throws IOException {
        try {
            String body = new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            Map<String, String> data = JsonUtil.parseFlatObject(body);

            String merchant = data.getOrDefault("merchant", "Unknown");
            String description = data.getOrDefault("description", "");
            String categoryIdStr = data.get("categoryId");
            double amount = Double.parseDouble(data.getOrDefault("amount", "0"));
            String type = data.getOrDefault("type", "expense");
            String date = data.getOrDefault("date", "");
            if (date.isEmpty()) {
                date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
            }

            try (Connection conn = Db.getConnection()) {
                String sql = "INSERT INTO transactions (merchant, description, category_id, amount, txn_type, txn_date) " +
                        "VALUES (?, ?, ?, ?, ?, ?)";
                try (PreparedStatement ps = conn.prepareStatement(sql)) {
                    ps.setString(1, merchant);
                    ps.setString(2, description);
                    if (categoryIdStr != null && !categoryIdStr.isEmpty()) {
                        ps.setInt(3, Integer.parseInt(categoryIdStr));
                    } else {
                        ps.setNull(3, java.sql.Types.INTEGER);
                    }
                    ps.setDouble(4, amount);
                    ps.setString(5, type);
                    ps.setString(6, date);
                    ps.executeUpdate();
                }
            }
            sendJson(ex, 201, "{" + JsonUtil.str("status", "ok") + "}");
        } catch (Exception e) {
            sendJson(ex, 400, "{" + JsonUtil.str("error", e.getMessage()) + "}");
        }
    }

    // ---------------------------------------------------------------
    // /api/categories
    // ---------------------------------------------------------------
    private static void handleCategories(HttpExchange ex) throws IOException {
        if (!allowCorsAndMethod(ex, "GET")) return;
        try (Connection conn = Db.getConnection()) {
            List<String> rows = new ArrayList<>();
            try (Statement st = conn.createStatement();
                 ResultSet rs = st.executeQuery("SELECT * FROM categories ORDER BY name")) {
                while (rs.next()) {
                    rows.add("{" +
                            JsonUtil.num("id", rs.getLong("id")) + "," +
                            JsonUtil.str("name", rs.getString("name")) + "," +
                            JsonUtil.str("icon", rs.getString("icon")) + "," +
                            JsonUtil.str("color", rs.getString("color")) + "," +
                            JsonUtil.num("monthlyLimit", rs.getDouble("monthly_limit")) +
                            "}");
                }
            }
            sendJson(ex, 200, "[" + String.join(",", rows) + "]");
        } catch (Exception e) {
            sendJson(ex, 500, "{" + JsonUtil.str("error", e.getMessage()) + "}");
        }
    }

    // ---------------------------------------------------------------
    // helpers
    // ---------------------------------------------------------------

    /** Adds CORS headers; handles OPTIONS preflight and wrong-method requests. Returns false if the caller should stop. */
    private static boolean allowCorsAndMethod(HttpExchange ex, String expectedMethod) throws IOException {
        ex.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        ex.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        ex.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        if (ex.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            ex.sendResponseHeaders(204, -1);
            return false;
        }
        return true;
    }

    private static void sendJson(HttpExchange ex, int statusCode, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        ex.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = ex.getResponseBody()) {
            os.write(bytes);
        }
    }
}
