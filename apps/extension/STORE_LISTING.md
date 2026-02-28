# Chrome Web Store Listing

## Short Description (132 chars max)

Developer tools in your browser. Right-click any text to run JSON formatter, Base64, JWT decoder, timestamp converter, and more. Privacy-first.

## Detailed Description

Toolhaus brings 25+ developer utility tools directly into your browser. Right-click any selected text to instantly run a tool—no copy-paste needed.

**Context Menu Actions:**
- Decode as Base64
- Convert Timestamp
- Format as JSON
- Count LLM Tokens
- Decode JWT
- Convert Color
- Hash (SHA-256)

**Popup Quick Tools:**
- JSON Formatter (format, minify, validate)
- Base64 Encode/Decode
- Unix Timestamp Converter
- JWT Decoder
- Hash Generator (SHA-256)

**Privacy-first:** All processing happens locally in your browser. No data is sent to servers.

**Pro users** can unlock all 25 tools in the popup and sync their preferences across devices. Connect your Toolhaus account to enable Pro features.

## Screenshots

Create the following screenshots for store submission:
- 1280x800 or 640x400: Popup showing tool picker and JSON formatter
- 1280x800 or 640x400: Context menu with Toolhaus submenu
- 1280x800 or 640x400: Multiple mini tools (Base64, JWT, etc.)

## Packaging

```bash
cd apps/extension
pnpm build
cd dist && zip -r ../toolhaus-extension.zip . && cd ..
```

Upload `toolhaus-extension.zip` to the Chrome Web Store Developer Dashboard.

## Firefox (AMO)

The extension uses `webextension-polyfill` for cross-browser compatibility. The same build works in Firefox 109+ (Manifest V3 support).

**Submission to addons.mozilla.org:**
1. Build the extension (same as Chrome)
2. Upload the `dist/` folder or zip to AMO
3. Firefox will use `browser_specific_settings.gecko` from manifest
4. Test on Firefox 109+ before submission
