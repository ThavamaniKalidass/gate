# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Supabase setup

This project now supports storing gate passes in Supabase through the Netlify function.

1. Create a Supabase project.
2. Run the schema in `supabase-schema.sql` using the Supabase SQL editor or a Postgres client.
3. Configure Netlify environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
4. For local development, copy `.env.sample` to `.env` and fill in your Supabase credentials.

### Local setup scripts

- `scripts/setup-supabase.sh` — Bash script to apply the schema with `psql` and print Netlify env var commands.
- `scripts/setup-supabase.ps1` — PowerShell equivalent for Windows.

Example:

```bash
export SUPABASE_DB_URL="postgres://user:password@host:5432/database"
./scripts/setup-supabase.sh
```

Then deploy or run Netlify locally with:

```bash
npx netlify-cli@latest dev
```

## Production-ready setup

1. Create a Supabase project.
2. Run `supabase-schema.sql` in the Supabase SQL editor to create tables and policies.
3. In Supabase Auth, invite admin users or let them sign in with magic links. Record their `id` (UID).
4. Add admin users to the database (replace <UID> with the user's id):

```sql
insert into public.admins (user_id) values ('<UID>');
```

5. Configure Netlify environment variables:

- `VITE_SUPABASE_URL` — your Supabase project URL (for the frontend)
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon public key (for the frontend)
- `SUPABASE_URL` — same as `VITE_SUPABASE_URL` (for Netlify functions)
- `SUPABASE_SERVICE_KEY` — Supabase service role key (store securely in Netlify)

6. Deploy to Netlify. The app uses Supabase Realtime + RLS so authenticated admin users will see synchronized data and full activity logs.

Security notes:
- Do NOT expose the service role key in the frontend. Only set it in Netlify function environment variables.
- Use Supabase Row Level Security (RLS) to limit DB access to admin users (the provided schema enables RLS and example policies).

