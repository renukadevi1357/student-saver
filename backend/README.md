# Student Saver / Financial Clarity

## Full project structure
```
student-saver/
  DESIGN.md                       <- original design tokens/spec
  frontend/
    index.html                    <- markup only, links style.css + script.js
    style.css                     <- custom CSS (fonts, scrollbar, grid, skeleton)
    script.js                     <- all JS: fetch() calls, form handling, rendering
    tailwind.config.js            <- Tailwind theme (colors/fonts) from DESIGN.md
  backend/
    schema.sql                    <- SQL: tables + seed data
    lib/                          <- put sqlite-jdbc-x.x.x.jar here (you add this)
    src/com/studentsaver/
      Main.java                   <- HTTP server + all REST routes
      Db.java                     <- JDBC connection + auto schema init
      JsonUtil.java                <- tiny JSON build/parse helpers (no external libs)
    README.md                     <- this file
```

Plain Java (no Spring/Maven required) + JDBC + SQLite. One small dependency:
the SQLite JDBC driver jar (Java has no built-in database driver — every
JDBC project needs one driver jar for whichever database it talks to).

## 1. Get the driver jar
Download once (needs internet on your machine, not required for anything else):
https://github.com/xerial/sqlite-jdbc/releases
→ grab e.g. `sqlite-jdbc-3.46.0.0.jar` and put it in `backend/lib/`.

## 3. Compile
From the `backend/` folder:
```bash
javac -d out src/com/studentsaver/*.java
```

## 4. Run
Still from `backend/` (so it can find `schema.sql` and create `studentsaver.db` here):
```bash
java -cp "out:lib/sqlite-jdbc-3.46.0.0.jar" com.studentsaver.Main
```
On Windows use `;` instead of `:` in the classpath:
```bash
java -cp "out;lib/sqlite-jdbc-3.46.0.0.jar" com.studentsaver.Main
```

First run auto-creates `studentsaver.db` from `schema.sql` with seed data
matching the design mock. Delete the `.db` file any time to reset.

You should see:
```
Student Saver backend running on http://localhost:8080
```

## 5. Open the frontend
Open `frontend/index.html` directly in your browser (double-click it, or
`File > Open`). It calls the API at `http://localhost:8080` — change the
`API_BASE` constant near the top of the `<script>` tag if you run the
backend elsewhere.

## API reference

| Method | Path                          | Notes |
|--------|-------------------------------|-------|
| GET    | `/api/dashboard`              | Totals, category breakdown, budget goal |
| GET    | `/api/transactions?type=all\|expense\|income` | List transactions |
| POST   | `/api/transactions`           | Body: `{"merchant","description","categoryId","amount","type","date"}` (date optional, defaults to now) |
| GET    | `/api/categories`             | List categories (for the "Add Expense" form) |

## Swapping in MySQL instead of SQLite
1. Get `mysql-connector-j-x.x.x.jar` and put it in `lib/`.
2. In `Db.java`, change:
   ```java
   private static final String DB_URL = "jdbc:mysql://localhost:3306/studentsaver?user=root&password=yourpass";
   ```
3. Run `schema.sql` once yourself via the `mysql` CLI (swap `AUTOINCREMENT`
   for `AUTO_INCREMENT` — the only SQLite-specific keyword used).
4. Remove/adjust the auto-init logic in `Db.initIfNeeded()` since you're
   managing the schema yourself now.

## Why no frameworks?
Kept deliberately dependency-light (just JDK's built-in `HttpServer` +
JDBC + one driver jar) so the whole thing is easy to read end-to-end and
runs anywhere with just a JDK installed — no Maven/Gradle build required.
