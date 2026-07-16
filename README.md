# InventoryPro — Full Frontend Inventory Management System

InventoryPro is a modern, responsive inventory operations dashboard built with React, Vite, Recharts and Lucide icons. It is designed as a strong beginner portfolio project: the interface behaves like a real business application while keeping data local in the browser, so no backend setup is required.

## Included modules

- **Dashboard:** live KPIs, sales trend chart, category distribution, low-stock monitoring, recent orders, high-value products and activity overview.
- **Products:** add, edit, delete, duplicate, detail view, table/grid modes, search, category and stock filters, sorting, selection, bulk delete, pagination and CSV export.
- **Categories:** add, edit, delete, duplicate, active/inactive states, live product and unit counts, search, filters and table/grid modes.
- **Inventory:** live stock health, warehouse locations, stock-in, stock-out, returns, adjustments, movement history, reorder suggestions and CSV export.
- **Orders:** order creation, automatic stock allocation, customer value updates, payment and status tracking, table/Kanban modes, invoice view, print and CSV export.
- **Suppliers:** full vendor records, rating, lead time, balances, product coverage, contact links, filters and CSV export.
- **Customers:** customer records, loyalty tiers, lifetime value, order counts, contact links, filters and CSV export.
- **Reports:** revenue, inventory value, margin, fulfillment rate, sales trend, stock health, category value, supplier performance, CSV export and print layout.
- **Activity:** searchable audit timeline for workspace actions.
- **Settings:** company/profile preferences, currency, tax, notifications, dark mode, compact density, complete JSON backup/import and demo reset.

## Modern experience

- Responsive sidebar and mobile navigation
- Light and dark themes
- Command palette with `Ctrl + K` / `Cmd + K`
- Dynamic low-stock and pending-order notifications
- Toast feedback and confirmation dialogs
- LocalStorage persistence
- Complete workspace JSON backup and restore
- Lazy-loaded pages and production build
- Relative Vite asset paths for easy static deployment

## Run the project

```bash
npm install
npm run dev
```

Open the URL shown by Vite, normally:

```text
http://localhost:5173/
```

## Quality checks

```bash
npm run lint
npm run build
```

## Deploy

### Vercel

1. Push the project to GitHub.
2. Import the repository in Vercel.
3. Framework preset: **Vite**.
4. Build command: `npm run build`.
5. Output directory: `dist`.

### GitHub Pages

The project uses `base: "./"`, so the built files use relative paths. Run `npm run build` and deploy the `dist` folder through your preferred GitHub Pages workflow.

## Important limitation

This is the frontend-only beginner version. Data is saved in the current browser using LocalStorage. A future full-stack upgrade can add Node.js, Express, MongoDB/PostgreSQL, authentication, role permissions and real cloud deployment.
