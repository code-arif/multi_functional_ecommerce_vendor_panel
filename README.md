# Vendor Panel — Multi-Vendor E-Commerce Marketplace

Vendor-facing SPA for managing shop products, orders, inventory, wallet, and settings.

Built with Vue 3 + Vite + Tailwind CSS + Pinia + Vue Router.

## Development

```bash
npm install
npm run dev     # Runs on port 3003
npm run build   # Production build
```

## Architecture

This panel is part of a monorepo alongside:
- `admin_panel/` — Super Admin SPA (port 3001)
- `customer_storefront/` — Customer-facing SPA (port 3000)
- `backend/` — Laravel API (port 8000)
