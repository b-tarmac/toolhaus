/**
 * 200–400 word About sections for each tool page.
 * Used by ToolSeoContent for SEO and user education.
 */

export const TOOL_ABOUT_CONTENT: Record<string, string> = {
  "json-formatter": `The JSON Formatter & Validator is a browser-based tool that helps developers format, validate, and minify JSON data. All processing happens entirely in your browser—no data is ever sent to our servers, so you can safely work with sensitive API responses and configuration files.

Common use cases include debugging API responses, preparing configuration files for deployment, validating JSON before committing to version control, and exploring nested data structures. The tool supports multiple indentation styles: 2-space, 4-space, and tab. A tree view lets you expand and collapse nested objects and arrays for easier navigation. Invalid JSON is highlighted with precise line and column numbers, making it easy to fix syntax errors. The minifier removes all unnecessary whitespace to reduce file size for production.

Whether you're working with a few lines or large API payloads, this tool keeps your workflow fast and private. It integrates with the nuqs URL state system—your formatted JSON can be shared via link. Pair it with our JSON to TypeScript generator for type definitions, or the OpenAPI validator for API specs. No sign-up required; everything runs client-side.`,

  "base64-tool": `Base64 encoding converts binary data into ASCII text, making it safe for transmission in contexts that only support text—such as JSON, email, and URLs. This tool supports both standard Base64 and the URL-safe variant (Base64URL), which replaces + and / with - and _ for use in URLs and filenames.

Use it to encode API keys for Authorization headers, embed images in data URLs, decode Base64-encoded payloads from APIs, or prepare binary data for storage in text-based formats. File upload is supported: drag and drop or select a file to encode it to Base64. The tool handles both text and binary input. Free users can process files up to 5MB; Pro users get 50MB. All encoding and decoding runs locally in your browser. Your data never leaves your device, which is essential when working with sensitive credentials or proprietary content. Related tools include the URL encoder for percent-encoding and the JWT decoder for inspecting base64url-encoded token payloads.`,

  "uuid-generator": `The UUID / ULID / NanoID Generator produces unique identifiers for use in databases, distributed systems, and applications. UUID v4 uses cryptographically secure random numbers and is widely supported. ULID is time-sortable and compact at 26 characters. NanoID is even shorter (21 characters) and URL-safe.

Choose the format that fits your needs: UUID for maximum compatibility, ULID when sortability matters, or NanoID when brevity is key. Bulk generation is supported—generate dozens or thousands of IDs at once. Pro users can generate up to 10,000 IDs per batch.

All generation happens in your browser using cryptographically secure random sources. No server round-trips, no rate limits. Ideal for seeding databases, generating API keys, or creating unique resource identifiers.`,

  "timestamp-converter": `The Unix Timestamp Converter converts between Unix timestamps (seconds or milliseconds since 1970-01-01 UTC) and human-readable dates. Enter a timestamp to see the corresponding date in your chosen timezone, or pick a date and get its timestamp.

Supports all standard timezones via the Intl API. The tool automatically detects whether you've entered a 10-digit (seconds) or 13-digit (milliseconds) timestamp. A live clock shows the current Unix time, updating every second.

Useful for debugging APIs that return timestamps, converting log timestamps to readable dates, scheduling cron jobs, or understanding JWT expiration claims. All conversions run locally—no server calls.`,

  "url-tool": `The URL Encoder / Decoder / Parser helps you work with URLs safely. Encode special characters for use in query parameters, path segments, or headers. Decode percent-encoded strings back to their original form. Parse URLs to extract scheme, host, path, and query parameters. Pro users can edit query parameters in a table view and see the updated URL in real time.

Essential for building APIs, debugging redirects, or preparing strings for URL inclusion. The tool follows RFC 3986 encoding rules. When encoding, spaces become %20 (or + in query strings), and non-ASCII characters are UTF-8 encoded. Related tools include the Base64 encoder for binary data and the HTML entity tool for entity encoding. All processing is client-side—your URLs, including those with sensitive tokens, never leave your browser.`,

  "hash-generator": `The Hash Generator produces MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes from text or files. Use SHA-256 or SHA-512 for passwords and signatures; MD5 and SHA-1 remain useful for checksums and non-cryptographic integrity checks.

Drag and drop a file or paste text. Hashes update in real time. Free tier supports files up to 5MB; Pro supports 50MB. All hashing uses the Web Crypto API and runs entirely in your browser—your data is never uploaded.

Common uses: verifying file integrity, generating checksums, creating cache keys, and preparing password hashes for comparison.`,

  "text-diff": `The Text Diff tool compares two text strings visually. Choose split view (side-by-side) or unified view (git-style diff). Syntax highlighting supports JSON and common languages. Changes are highlighted with clear add/remove indicators.

Paste config files, code snippets, API responses, or any text. The diff algorithm runs locally—your content never leaves your device. Useful for code reviews, comparing API versions, debugging config changes, or verifying data transformations.

Stats show the number of additions, deletions, and unchanged lines. Switch between views to suit your workflow.`,

  "regex-tester": `The Regex Tester lets you test regular expressions against sample text. Toggle flags (global, case-insensitive, multiline, etc.) with checkboxes. Matches are highlighted inline; capturing groups are colour-coded. A built-in cheatsheet shows common patterns, anchors, and quantifiers.

The pattern library includes ready-to-use regexes for email, URLs, phone numbers, and more. Test your patterns in real time as you type. All processing runs in your browser—no server calls, no rate limits.

Essential for developers writing validation logic, search features, or text parsers. Debug complex patterns before adding them to your code.`,

  "cron-builder": `The Cron Expression Builder helps you create and validate cron expressions. Uses the standard 5-field format (minute, hour, day of month, month, day of week). Compatible with Linux cron, GitHub Actions, and most schedulers.

See a human-readable description of your expression (e.g. "Every day at 3:00 AM") and the next 5 execution times. Natural language input lets you type phrases like "every 15 minutes" or "weekdays at 9am" and get a valid cron expression.

All computation runs locally. No server dependency. Perfect for configuring backups, cleanup jobs, or scheduled API calls.`,

  "color-converter": `The Color Converter converts between HEX, RGB, HSL, OKLCH, and P3 color formats. OKLCH is a perceptually uniform space that makes palette creation easier; modern CSS supports it natively. The WCAG contrast checker shows pass/fail for AA and AAA (normal and large text). Edit any field and all others update in real time.

Essential for accessible design—ensure sufficient contrast between text and background. Use for design systems, theme builders, or debugging color values. P3 (display-p3) support helps when targeting wide-gamut displays. Pair with the CSS Gradient Generator for creating gradient backgrounds. All conversions run locally using the culori library; no external APIs or server calls.`,

  "llm-token-counter": `The LLM Token Counter estimates token counts for GPT-5, GPT-4.1, Claude 4, Gemini 2.5, and other models. Uses the same tokenisation as OpenAI (tiktoken) via js-tiktoken, so counts match the API for GPT models. Claude and Gemini counts are approximate but useful for budgeting.

Tokenisation runs in a Web Worker using WASM—your text never leaves your device. No API calls. Compare multiple models in a table to see how the same text tokenises differently. Stay within context windows and plan your prompts.

Essential for prompt engineers, API integrators, and anyone optimising LLM usage.`,

  "ai-cost-calculator": `The AI Model Cost Calculator estimates costs for GPT-4, Claude, Gemini, and other models. Pricing is sourced from official provider documentation. Enter input/output token counts to get per-request, daily, and monthly estimates.

A budget reverse calculator lets you set a monthly budget and see how many requests you can afford. Input and output tokens are priced separately—most providers charge more for output. Useful for project planning, cost optimisation, and vendor comparison.

Pricing data is stored locally and updated regularly. Verify against provider pricing pages for production decisions.`,

  "case-converter": `The Case Converter transforms text between 11 formats: Sentence case, lower case, UPPER CASE, Capital Case, aLtErNaTiNg, camelCase, PascalCase, snake_case, kebab-case, and more. All formats update live as you type.

Paste variable names, JSON keys, environment variables, or any text. Ideal for refactoring code, converting API responses, or preparing strings for different contexts. Handles multi-line input—convert entire paragraphs or code snippets.

Runs entirely in your browser. No server round-trips.`,

  "env-validator": `The .env File Validator checks your environment files for common issues. Detects duplicate keys, invalid KEY=value format, and deviations from UPPER_SNAKE_CASE convention. Flags potentially sensitive values that might be exposed.

Validation runs entirely in your browser. Sensitive values are masked in the UI. Your secrets never leave your device. Supports quoted values, escaped characters, and multi-line env vars. Use before deploying or sharing .env.example files.

Essential for DevOps, backend developers, and anyone managing environment configuration.`,

  "openapi-validator": `The OpenAPI / JSON Schema Validator validates OpenAPI 3.0/3.1 and JSON Schema documents. Paste JSON or YAML. Resolves internal $ref references. Errors are listed with paths—click to understand what needs fixing.

Use for API specs, CI/CD validation, and documentation pipelines. Ensure your OpenAPI documents are valid before generating clients or publishing docs. Standalone JSON Schema validation is also supported (Draft-04 through 2020-12).

All validation runs locally. No data is sent to external services.`,

  "data-format-converter": `The YAML ↔ JSON ↔ TOML Converter converts between the three formats in real time. Edit in any pane and the others update. Handles complex structures including multi-document YAML. Preserves data types across conversions.

Use for config files, CI/CD (GitHub Actions, GitLab CI), Docker Compose, and API specs. TOML has some type constraints that may affect round-trip conversion, but the tool handles common cases. Essential for developers working across ecosystems.

All conversion runs in your browser. No server dependency.`,

  "csv-json-converter": `The CSV ↔ JSON Converter converts between CSV and JSON. Auto-detects delimiter (comma, semicolon, tab, pipe). Table view with sortable columns. Edit values and see the JSON/CSV update. Output can be array of objects or array of arrays.

Handles quoted fields, escaped commas, and multi-line values. Use for data wrangling, API integration, or migrating between formats. Paste from Excel, Google Sheets, or any CSV export.

All processing is client-side. Your data stays private.`,

  "jwt-decoder": `The JWT Decoder inspects JSON Web Tokens without verification. Paste a token to see the header (algorithm, type) and payload (claims). The exp claim is parsed into an expiry badge—valid, expired, or expiring soon.

JWTs are base64url-encoded, not encrypted. The payload is readable by design. This tool decodes locally—no server calls. Use for debugging auth flows, understanding token structure, or troubleshooting expired tokens.

Never paste tokens containing sensitive data you wouldn't want visible. For signature verification, use your auth provider's tools.`,

  "html-entity-tool": `The HTML Entity Encoder / Decoder converts between text and HTML entities. Encode <, >, &, and quotes to prevent XSS and parsing errors. Decode entities back to characters. Supports named entities (&amp;) and numeric (&#169;).

A searchable reference table includes arrows, symbols, and accented letters. Click to insert. Use when displaying user content in HTML, building email templates, or working with legacy systems that require entities.

All processing runs in your browser. No external services.`,

  "lorem-ipsum-generator": `The Lorem Ipsum Generator produces placeholder text. Classic mode uses the traditional Latin passage. Developer mode generates code-like structure—variable names, function calls, JSON keys—for mocking UI with realistic dev content.

Specify words, sentences, or paragraphs. Use for design mockups, testing layouts, or filling databases. Lorem Ipsum avoids distraction from meaning and copyright issues with real content. Developer mode is ideal for component libraries and documentation.

Generation runs locally. No API calls.`,

  "number-base-converter": `The Number Base Converter converts between binary, octal, decimal, and hexadecimal. Edit any field and the others update instantly. Handles negative numbers and large values. Invalid characters are highlighted.

Use for hex color codes, bit flags, file permissions (octal), or debugging numeric values. Essential for low-level programming, systems work, and understanding binary representations. Shows which bases have valid values when input is ambiguous.

All conversion runs in your browser.`,

  "json-to-typescript": `The JSON → TypeScript Interface Generator creates TypeScript interfaces from JSON. Recursively generates interfaces for nested objects. Configure the root interface name. Toggle optional fields to add ? to every property.

Use for API response types, config schemas, or any JSON structure. The tool infers types from your data—arrays with mixed types may produce unions. Copy the generated code into your project. Saves time when integrating with APIs or defining data models.

All generation runs locally. No server calls.`,

  "markdown-preview": `The Markdown Preview renders Markdown as HTML in real time. Supports headers, bold, italic, code, code blocks, lists, blockquotes, links, images, and tables. GitHub Flavored Markdown extensions included. Output is sanitised with DOMPurify—scripts and dangerous attributes are stripped.

Use for README previews, documentation, or any Markdown content. See how it will render on GitHub, npm, or docs sites before committing. Safe for user-generated content previews.

Rendering runs entirely in your browser.`,

  "css-gradient-generator": `The CSS Gradient Generator creates linear, radial, and conic gradients. Add colour stops, drag to reorder, adjust positions and angles. Live preview updates as you edit. Export as standard CSS, Tailwind arbitrary values, or SVG.

Use for backgrounds, hero sections, or design systems. The Color Converter tool pairs well for picking stop colours. Copy the generated code directly into your project. No design software required.

All generation runs locally. No external APIs.`,

  "string-utilities": `The String Utilities tool offers word count, character count, reverse, slugify, sort lines, remove duplicates, trim, and more. Switch between operations via tabs. All run instantly on paste. Handles multi-line text—sort lines and remove duplicates work line-by-line.

Slugify converts text to lowercase, replaces spaces with hyphens, and removes special characters for URLs and filenames. Word count is useful for copy limits and readability metrics. Essential for content editors, developers, and anyone processing text.

All operations run in your browser. No data is sent to servers.`,
};
