package com.studentsaver;

import java.io.File;
import java.nio.file.Files;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Very small JDBC helper. Uses SQLite (file-based, zero external server
 * needed) so the whole app runs with just the JDK + one driver jar.
 *
 * Swap DB_URL for a MySQL url (e.g. jdbc:mysql://localhost:3306/studentsaver)
 * and load the mysql driver jar instead if you'd rather use a real MySQL server.
 * The SQL in schema.sql is plain/basic and works on both with trivial edits.
 */
public class Db {

    private static final String DB_FILE = "studentsaver.db";
    private static final String DB_URL = "jdbc:sqlite:" + DB_FILE;

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(DB_URL);
    }

    /** Creates the schema + seed data the first time the app is run. */
    public static void initIfNeeded() {
        boolean freshDb = !new File(DB_FILE).exists();
        if (!freshDb) {
            return; // database already exists - nothing to do
        }

        System.out.println("No database found - creating " + DB_FILE + " from schema.sql ...");

        try (Connection conn = getConnection()) {
            List<String> statements = splitSqlStatements(readSchemaFile());

            // Run every statement inside one transaction: if anything fails,
            // roll back instead of leaving a half-created schema on disk.
            conn.setAutoCommit(false);
            try {
                for (String sql : statements) {
                    // IMPORTANT: create a brand-new Statement for each SQL command
                    // and close it immediately. Reusing one Statement object across
                    // multiple execute() calls is what caused:
                    //   "java.sql.SQLException: The prepared statement has been finalized"
                    // SQLite JDBC re-prepares a native handle on every execute(); if the
                    // GC finalizes an old handle while the loop still holds the wrapper,
                    // the next call on that same Statement blows up. A fresh Statement
                    // per call sidesteps the whole issue.
                    try (Statement st = conn.createStatement()) {
                        st.execute(sql);
                    }
                }
                conn.commit();
                System.out.println("Database initialized with seed data.");
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        } catch (Exception e) {
            System.err.println("Failed to initialize database: " + e.getMessage());
            // Don't leave a corrupt/partial db file lying around on failure.
            new File(DB_FILE).delete();
            throw new RuntimeException(e);
        }
    }

    private static String readSchemaFile() throws Exception {
        return new String(Files.readAllBytes(new File("schema.sql").toPath()));
    }

    /**
     * Splits schema.sql on ';' into individual statements, skipping blank
     * lines and '--' comment-only lines. Naive but fine for our basic schema
     * (no semicolons appear inside string literals here).
     */
    private static List<String> splitSqlStatements(String rawSql) {
        // Remove comment text before splitting on semicolons so comments like
        // "-- SQLite syntax; works on MySQL..." don't become SQL statements.
        StringBuilder cleaned = new StringBuilder();
        for (String line : rawSql.replace("\r\n", "\n").split("\n")) {
            int commentIndex = line.indexOf("--");
            String sqlLine = commentIndex >= 0 ? line.substring(0, commentIndex) : line;
            cleaned.append(sqlLine).append("\n");
        }

        List<String> result = new ArrayList<>();
        for (String piece : cleaned.toString().split(";")) {
            String trimmed = piece.trim();
            if (!trimmed.isEmpty()) {
                result.add(trimmed);
            }
        }
        return result;
    }
}
