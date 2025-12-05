
# 📦 How to Build the Lalaine Installer (.exe)

Follow these steps to generate a shareable `.exe` file for Windows.

## 1. Install Build Tools
Run this command in your terminal to install Electron and the builder:

```bash
npm install --save-dev electron electron-builder
```

## 2. Update `package.json`
You need to tell the build system how to package the app. Open your `package.json` file and make the following changes:

1.  **Add `main`**: Point to the new `main.js` file.
2.  **Add `dist` script**: A command to build the web app and then package it.
3.  **Add `build` config**: Settings for the installer (Icon, Name, etc).

Your `package.json` should look similar to this (merge these parts in):

```json
{
  "name": "lalaine",
  "version": "1.0.0",
  "main": "main.js",  <-- IMPORTANT: Add this line
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "dist": "vite build --base=./ && electron-builder"  <-- IMPORTANT: Add this line
  },
  "build": {
    "appId": "com.lalaine.productivity",
    "productName": "Lalaine",
    "files": [
      "dist/**/*",
      "main.js",
      "package.json"
    ],
    "directories": {
      "output": "release"
    },
    "win": {
      "target": "nsis",
      "icon": "public/favicon.ico" 
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

> **Note on Icons:** If you don't have a `public/favicon.ico`, the build might warn you, but it will still work (using a default icon).

## 3. Build the EXE
Run the following command:

```bash
npm run dist
```

## 4. Find Your File
Once the process finishes (it may take a minute), look for a new folder named `release` in your project directory.

Inside `release`, you will find:
- **`Lalaine Setup 1.0.0.exe`** (This is the file you share!)
- `win-unpacked/` (A folder version you can run locally to test without installing)

---

## Troubleshooting

**"White Screen" when opening the exe?**
This usually happens because the app is looking for files at `/` (root of drive) instead of `./` (relative to the app).
- Ensure your `package.json` build script says: `"vite build --base=./"`
- Ensure `index.html` links use `./` (e.g., `href="./manifest.json"`).

**API Key Issues?**
Since this is a client-side app, your API Key for Gemini is loaded from `.env` during the build.
- Ensure your `.env` file exists and has `API_KEY=...` before running `npm run dist`.
- The key will be baked into the application.
