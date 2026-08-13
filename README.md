# License Portal — Prototype

Clickable prototype for a ThingsBoard licensing portal.

## Stack

- **React 18** + **TypeScript**
- **Vite** (dev server / build)
- **Tailwind CSS v4**
- **React Router** for navigation
- Mock data (no backend yet) — see `src/data/`

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## Structure

```
src/
  components/   reusable UI (StatCard, StatusBadge)
  layouts/      AppLayout — sidebar + header shell
  pages/        Dashboard, Licenses, Customers, Settings
  data/         types + mock data
  App.tsx       routes
  main.tsx      entry point
```

## Next steps (not done yet)

- Replace mock data with a real API / backend
- Auth & roles
- License create/edit flows
- Persist settings
