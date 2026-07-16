# Start Here — Beginner Guide

## 1. Extract the ZIP

Extract the project to a normal folder. Do not run it directly inside the ZIP.

## 2. Open in VS Code

Open the extracted `InventoryPro-Full-Frontend` folder in VS Code.

## 3. Install packages

Open the VS Code terminal and run:

```bash
npm install
```

## 4. Start the app

```bash
npm run dev
```

Open the link shown in the terminal, normally `http://localhost:5173/`.

## 5. First things to test

1. Add a product.
2. Record a stock movement.
3. Create an order and confirm the stock decreases.
4. Switch between light and dark mode.
5. Press `Ctrl + K` to open the command palette.
6. Open Settings and export a complete backup.

## 6. Where the important code lives

- `src/App.jsx` — central application state and page connection.
- `src/data/defaultData.js` — demo records.
- `src/pages/` — every main module.
- `src/components/` — reusable sidebar, topbar, modal and UI components.
- `src/App.css` — complete modern design system and responsive styling.
- `src/hooks/usePersistentState.js` — saves data to LocalStorage.

## 7. Reset the demo

Open **Settings → Data & backup → Reset demo data**.
