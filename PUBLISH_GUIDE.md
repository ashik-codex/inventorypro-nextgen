# Publish InventoryPro with GitHub Pages

## Recommended repository name

`inventorypro-nextgen`

Your final website link will normally look like:

`https://ashik-codex.github.io/inventorypro-nextgen/`

## One-time setup

1. Create a new **public** GitHub repository named `inventorypro-nextgen`.
2. Do not add another README, `.gitignore`, or license while creating it, because this project already contains those files.
3. Open this project folder in VS Code.
4. Open **Terminal → New Terminal**.
5. Run the commands below one by one.

```bash
git init
git add .
git commit -m "Publish InventoryPro NextGen"
git branch -M main
git remote add origin https://github.com/ashik-codex/inventorypro-nextgen.git
git push -u origin main
```

## Enable GitHub Pages

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Open the **Actions** tab and wait for `Deploy InventoryPro to GitHub Pages` to show a green check.
5. Return to **Settings → Pages** to open the published site.

## Future updates

After changing the code, run:

```bash
git add .
git commit -m "Update InventoryPro"
git push
```

Every push to `main` automatically rebuilds and republishes the site.

## Local development

```bash
npm install
npm run dev
```
