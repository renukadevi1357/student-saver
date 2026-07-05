package com.studentsaver;

import java.util.HashMap;
import java.util.Map;

/**
 * Minimal hand-rolled JSON helpers. This app is intentionally dependency-free
 * (no Gson/Jackson) so it compiles with nothing but the JDK + the JDBC driver.
 * It only needs to handle flat objects, which is all this app sends/receives.
 */
public class JsonUtil {

    public static String esc(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < 0x20) sb.append(String.format("\\u%04x", (int) c));
                    else sb.append(c);
            }
        }
        return sb.toString();
    }

    public static String str(String key, String value) {
        return "\"" + esc(key) + "\":\"" + esc(value) + "\"";
    }

    public static String num(String key, double value) {
        return "\"" + esc(key) + "\":" + value;
    }

    public static String num(String key, long value) {
        return "\"" + esc(key) + "\":" + value;
    }

    public static String raw(String key, String rawJson) {
        return "\"" + esc(key) + "\":" + rawJson;
    }

    /** Very small flat-JSON-object parser: {"a":"b","c":1.5} -> Map. Good enough for our POST bodies. */
    public static Map<String, String> parseFlatObject(String body) {
        Map<String, String> map = new HashMap<>();
        if (body == null) return map;
        String s = body.trim();
        if (s.startsWith("{")) s = s.substring(1);
        if (s.endsWith("}")) s = s.substring(0, s.length() - 1);

        int i = 0;
        int n = s.length();
        while (i < n) {
            while (i < n && (s.charAt(i) == ',' || Character.isWhitespace(s.charAt(i)))) i++;
            if (i >= n) break;
            // key
            if (s.charAt(i) != '"') break;
            int keyStart = ++i;
            StringBuilder key = new StringBuilder();
            while (i < n && s.charAt(i) != '"') {
                if (s.charAt(i) == '\\' && i + 1 < n) { key.append(s.charAt(i + 1)); i += 2; }
                else { key.append(s.charAt(i)); i++; }
            }
            i++; // closing quote
            while (i < n && (s.charAt(i) == ':' || Character.isWhitespace(s.charAt(i)))) i++;
            // value
            StringBuilder val = new StringBuilder();
            if (i < n && s.charAt(i) == '"') {
                i++;
                while (i < n && s.charAt(i) != '"') {
                    if (s.charAt(i) == '\\' && i + 1 < n) { val.append(s.charAt(i + 1)); i += 2; }
                    else { val.append(s.charAt(i)); i++; }
                }
                i++; // closing quote
            } else {
                while (i < n && s.charAt(i) != ',' && s.charAt(i) != '}') { val.append(s.charAt(i)); i++; }
            }
            map.put(key.toString(), val.toString().trim());
        }
        return map;
    }
}
