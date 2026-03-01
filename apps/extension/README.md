# Toolhaus Browser Extension

## Development

1. **Build the extension:**
   ```bash
   npm run build
   ```

2. **Load in Chrome:** Go to `chrome://extensions`, enable "Developer mode", click "Load unpacked", and select the **`dist`** folder (not the extension root):
   ```
   apps/extension/dist/
   ```

   Loading from the root folder will fail with "Service worker registration failed" because the source manifest points to TypeScript files. Always load from `dist/` after building.

3. **Rebuild after changes:** Run `npm run build` again, then click the refresh icon on the extension card in `chrome://extensions`.

## Packaging for Chrome Web Store

```bash
npm run package
```

This creates `toolhaus-extension.zip` in the extension folder.
