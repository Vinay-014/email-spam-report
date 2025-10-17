# Email Spam Report

Email Spam Report is a front-end application that enables users to submit and review reports of spam emails. The UI emphasizes clarity and fast feedback for investigators and users who want to flag suspicious messages. It is intentionally modular and easy to extend or integrate with backend services or APIs for persistence, analytics, or automation.

## Key features

- Responsive React + TypeScript UI
- Fast development powered by Vite
- Tailwind CSS for utility-first styling
- shadcn-ui primitives for consistent UI components
- Easily pluggable data layer (API or local persistence)
- Lightweight and optimized for rapid iteration

## Tech stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn-ui

## Getting started

### Clone and run

1. Clone the repository
   ```bash
   git clone https://github.com/Vinay-014/email-spam-report.git
   cd email-spam-report
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Build for production
   ```bash
   npm run build
   ```

5. Preview production build
   ```bash
   npm run preview
   ```

Adjust the package manager commands (yarn / pnpm) if you prefer an alternative.

## Scripts

Common scripts found in package.json (may vary):

- npm run dev — Start the dev server
- npm run build — Build production assets
- npm run preview — Preview production build locally
- npm run lint — Run linting (if configured)
- npm run test — Run tests (if configured)

## Configuration

- Tailwind is typically configured via tailwind.config.cjs.
- Vite configuration lives in vite.config.ts.
- If the app integrates with a backend API, supply API endpoints and credentials via environment variables (e.g., `.env.local`). Example:
  ```
  VITE_API_BASE_URL=https://api.example.com
  ```

Document any required environment variables and secrets clearly in a dedicated `.env.example`.

## Acknowledgements

Built with the Vite + React + TypeScript ecosystem and UI primitives from shadcn-ui. Tailwind CSS provides the styling foundation.
