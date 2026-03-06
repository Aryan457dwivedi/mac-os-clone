# macOS Sonoma Desktop Simulator

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open in browser
# → http://localhost:5173
```

## Requirements
- Node.js 16+ (check: `node -v`)
- npm 7+ (check: `npm -v`)

## Build for production
```bash
npm run build
npm run preview
```

## Project structure
```
macos-sonoma/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx          ← React entry point
    └── MacOSSonoma.jsx   ← Main component
```

## Common issues

**Blank screen?**
- Open browser DevTools (F12) → Console tab → check for errors
- Make sure you ran `npm install` first

**"Module not found" error?**
- Run `npm install` again

**Port already in use?**
- Vite will auto-pick the next port (5174, 5175, etc.)
- Or run: `npm run dev -- --port 3000`
