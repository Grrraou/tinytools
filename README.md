# TinyTools

A single-page collection of small, focused tools: converters, encoders, text utilities, time and date, finance, and reference. No sign-up, no tracking. Everything runs in your browser where possible.

**Try it online:** [tinytools.rootsolve.org](https://tinytools.rootsolve.org)

---

## Build

From the project root:

```bash
npm run generate-manifest
cd frontend && npm install && npm run build
cd ../backend && npm install
node server.js
```

App runs at **http://localhost:3000**.

**Static deploy (e.g. Apache):** After the steps above, serve the contents of `frontend/dist/` (it already contains the built app and a copy of `tools/`). No Node process needed.

**Docker (Node):**

```bash
docker compose up -d --build
```

**Docker (Apache):**

```bash
docker compose -f docker-compose.apache.yml up -d --build
```

Use a `.env` file to set `PORT` and `CONTAINER_NAME` if other services use the default port.

---

## Tools

Each tool has a direct URL under `/tools/<id>/`. Below: short description and example use for every tool.

### Text

- **Common regex** — Reference of common regex patterns (email, URL, date, phone, hashtag, etc.). Search and open any pattern in Regex Tester with valid/invalid sample lines.  
  *Use case: Find a ready-made pattern for emails or URLs and open it in the tester with sample data.*

- **Extract from text** — Extract emails, phones, URLs, dates or custom regex from text. One button per type; handles many formats.  
  *Use case: Paste a long log or document and pull out all email addresses or links in one click.*

- **Regex Builder** — Paste a substring and get a best-effort regex that matches it. Character classes, grouped repeats, escaped specials. Browser-only.  
  *Use case: You have a sample like "user_123" and want a pattern that matches similar strings.*

- **Unicode Search** — Search Unicode characters by name or code point.  
  *Use case: Find the character for "right arrow" or look up U+20AC (€).*

- **Word heat map** — Build a visual heat map or tag cloud from text. Words sized and colored by frequency.  
  *Use case: See which terms appear most in an article or paste.*

- **Case converter** — Convert between camelCase, snake_case, kebab-case, PascalCase, UPPER_SNAKE, Title Case, and more.  
  *Use case: Turn API response keys from snake_case to camelCase for your frontend.*

- **JSON Path & XPath Tester** — Test JSONPath on JSON and XPath on XML. Enter data and expression; see matches instantly. Sample data and examples included.  
  *Use case: Debug a JSONPath like `$.items[*].id` on real API JSON, or try XPath on an XML config.*

- **Regex Tester** — Test regex patterns live: pattern, flags, test string. See highlights, match count, capture groups, validation errors. Explanation and regex syntax docs.  
  *Use case: Write and debug a regex before putting it in code; check capture groups.*

- **Diff checker** — Text A vs Text B: visual diff to quickly find differences between two texts.  
  *Use case: Compare two configs or log outputs to see what changed.*

- **Sort list** — Paste a list, choose separator (comma, semicolon, newline, etc.) and trim. Sort ASC/DESC, find missing numbers, remove duplicates, reverse, shuffle, change separator.  
  *Use case: Sort a comma-separated list of IDs, or find gaps in a sequence.*

### Encoding

- **Base converter** — Convert numbers between binary, decimal, hex, octal and any custom base (2–36).  
  *Use case: Convert a hex color to decimal, or debug bit flags in binary.*

- **Base64 Encode / Decode** — Encode or decode text and files to/from Base64.  
  *Use case: Encode a small file for embedding, or decode a Base64 token.*

- **HTML Encode / Decode** — Encode or decode HTML entities.  
  *Use case: Escape `<` and `>` for safe display in HTML, or decode `&amp;` back to `&`.*

- **URL Encode / Decode** — Percent-encode for URLs (query or path) or decode percent-encoded text.  
  *Use case: Encode a query value for a link, or decode a received query string.*

### Cryptography

- **Text data masking** — Mask emails, phones, URLs in text (e.g. j***@gmail.com). Reversible masking with a secret key. Runs locally; safe for sharing with AI or support.  
  *Use case: Redact PII in a log before sending it to a colleague or pasting into a chatbot.*

- **Hash encode / decode** — Hash (MD5, SHA-1, SHA-256, SHA-384, SHA-512), HMAC with key, and AES encrypt/decrypt. Use keys from the global key manager or enter your own. All in the browser.  
  *Use case: Generate a SHA-256 checksum of a string, or verify an HMAC signature.*

### Web & APIs

- **JSON formatter** — Format or minify JSON with indent. Search and navigate inside the formatted output.  
  *Use case: Pretty-print an API response to read it, or minify before sending.*

- **JSON / XML / Array converter** — Convert between JSON, XML, PHP array, JavaScript, Python dict, YAML, .env, URL params and other formats. Accepts JSON formatter output via "Send to converter".  
  *Use case: Turn a PHP config array into JSON, or export API JSON as XML.*

- **HTTP status codes** — List and search all HTTP return codes with an explanation for each.  
  *Use case: Look up what 429 or 503 means and when to use it.*

- **Port number lookup** — Look up port numbers: e.g. 443 → HTTPS, with description and common usage.  
  *Use case: Check which service usually runs on port 5432 or 27017.*

### CSS & Design

- **Color converter** — Convert between Hex, RGB, HSL, HSV/HSB, CMYK, and CSS named colors. Color picker and auto-detect from text. Optional alpha.  
  *Use case: Get the HSL equivalent of a hex color for CSS, or pick a color and copy in several formats.*

- **CSS units converter** — Convert between px, rem, em, %, vw, vh, pt and more. Set base font-size and viewport. Live text preview.  
  *Use case: Convert a design’s 16px to rem with a 16px root, or see how 2rem looks.*

### Units & Numbers

- **Byte converter** — Convert between bytes, KB, MB, GB, KiB, MiB, bits, octets. Explanations for decimal vs binary (MB vs MiB).  
  *Use case: Convert 1 GiB to MB, or understand the difference between MB and MiB.*

- **Distance converter** — Convert between metric, imperial and astronomical distances (mm, km, miles, light-years, parsecs, etc.) with explanations.  
  *Use case: Convert miles to km for a trip, or 1 AU to km.*

- **Temperature converter** — Convert between Celsius, Fahrenheit, Kelvin and Rankine. Explanations for each scale.  
  *Use case: Convert 98.6°F to Celsius, or 0°C to Kelvin.*

- **Angle converter** — Convert between degrees, radians, gradians, arc minutes, arc seconds and turns. Visual representation of the angle.  
  *Use case: Convert 90° to radians for math or CSS, or see the angle on a circle.*

- **Speed converter** — Convert between m/s, km/h, mph, knots, ft/s, Mach and more (metric, imperial, nautical). Explanations included.  
  *Use case: Convert 60 mph to m/s, or wind speed from knots to km/h.*

- **Percentage calculator** — x% of y, what percent x is of y, percentage increase/decrease, difference, reverse. Examples per card.  
  *Use case: "What is 20% of 80?" or "80 is what percent of 200?"*

- **Average / median / mode calculator** — Compute mean, median, and mode from a list of numbers. Paste comma- or newline-separated values; see count, sum, min, max.  
  *Use case: Get the average of a list of grades, or the median of response times.*

### Finance

- **Finance calculator** — Inflation impact, compound & simple interest, loan payment, Rule of 72, future/present value, and more. Browser-only.  
  *Use case: See how much today’s 1000€ is worth after 5 years at 2% inflation, or compute monthly loan payment.*

### Time & Date

- **Time converter** — Convert timestamps (Unix, ISO) and view the same moment in any time zone. Date picker and URL params.  
  *Use case: Convert 1707350400 to a readable date, or see "now" in Tokyo.*

- **Cron parser** — Input a cron expression; see next 5 run times in local time. Common cron presets and URL param for expression.  
  *Use case: Check when "0 9 * * 1-5" actually runs next.*

- **Date comparator** — Compare two dates with date pickers. See difference in days, weeks, months, years. URL params for sharing.  
  *Use case: How many days between two deadlines, or between today and a release date.*

- **Countdown** — Time until a date: countdown in seconds, minutes, hours, days, weeks. Updates in real time.  
  *Use case: "How long until New Year?" or until a project deadline.*

### Reference

- **Keyboard shortcuts** — OS keyboard shortcuts for Windows, Mac, and Linux with search.  
  *Use case: Look up "copy" or "switch window" shortcut on another OS.*

- **Shell one-liner** — Build shell one-liners for common commands: CMD, PowerShell, Bash, Mac. Variables and flags per command; descriptions and search.  
  *Use case: Get the exact curl or ssh command with your host and key path filled in.*

### External

- **Chaos proxy (Latency Poison)** — Proxy that injects configurable latency (and optional failures) into HTTP traffic to test how your app behaves under delay or chaos. By RootSolve; link opens the external site and docs.  
  *Use case: Point your app at the proxy and add delay to simulate slow networks or test timeouts.*
