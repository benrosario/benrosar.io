# Ben Rosario — portfolio

My personal website at **[benrosar.io](https://benrosar.io)**, featuring my projects,
background, and résumé. I’m studying Cognitive Science at UC Berkeley and seeking
Summer 2027 internships in software engineering and applied AI.

[View the site](https://benrosar.io) · [Résumé](https://benrosar.io/resume.pdf) ·
[LinkedIn](https://www.linkedin.com/in/ben-rosario) · [Email](mailto:hello@benrosar.io)

## What I built

I built this portfolio to make my work easy to explore, from the problem behind
each project to the implementation decisions and a working demo.

- **Project case studies** with technical decisions, usage context, and links to
  source code and regression tests.
- **An interactive Sierra Class Helper demo** with Google sign-in, conversation
  history, Markdown responses, and clear feedback for usage limits and failures.
- **A responsive interface** with theme switching, keyboard focus styles, and
  reduced-motion support.
- **Sharing and discovery features** including project-specific social previews,
  a sitemap, and search metadata.

The featured project, [Sierra Class Helper](https://github.com/benrosario/sierra-class-helper),
is a Discord course-finding assistant adopted by 40+ Sierra College students,
searching approximately 2,000 course records. This repository contains the
portfolio and web demo integration; the linked repository contains the Python
backend and retrieval pipeline.

## Engineering choices

**Server-rendered content, interactive components where needed.** The homepage
and case studies render on the server. Theme switching and the chat demo run in
client components. Project content lives in a typed registry, so adding a project
creates both its homepage card and case study route without a CMS.

**A bounded live demo.** The browser sends a Google ID token through the site's
API proxy to the Sierra backend, which verifies identity and enforces three
lifetime attempts per account. The proxy validates request size and conversation
history, refuses redirects, and returns controlled error messages. Tokens stay
in browser memory, and requests are never automatically retried because a failed
attempt may still consume quota. Bot credentials and model API keys are not part
of the website.

**Production runtime coverage.** The site uses React, TypeScript, Tailwind CSS v4,
and Next.js App Router APIs, deployed to Cloudflare Workers through vinext.
The original Next.js commands remain available for comparison and type checking.
The CI workflow exercises production pages and API routes in both runtimes using
a local mock backend, without paid model calls.

## Run locally

Use Node.js 22.18+.

```bash
npm ci
npm run dev:vinext
```

Open [localhost:3001](http://localhost:3001). To use the original Next.js server,
run `npm run dev` and open [localhost:3000](http://localhost:3000).

### Optional live demo

The project overview is available without the live demo. Chat requires two
runtime settings:

| Variable | Purpose |
| --- | --- |
| `SIERRA_API_URL` | Sierra FastAPI base URL, without `/demo/chat` |
| `SIERRA_GOOGLE_CLIENT_ID` | Public Google OAuth Web application client ID |

For Next.js, copy `.env.example` to `.env.local` and set both values. For Workers,
use runtime variables in `wrangler.jsonc` or Wrangler secrets. The checked-in
Wrangler configuration points to the production integration; use your own API
and client ID when deploying a separate copy.

Register the website's exact origin under Google's Authorized JavaScript origins
and configure the same client ID on the Sierra backend. Add development origins
separately. The backend needs persistent storage for its quota database. See the
[backend demo setup and API contract](https://github.com/benrosario/sierra-class-helper/blob/f62d7a40f602718a5ab380ebe03c057f84d27ceb/DEMO.md).

The client ID is public. Keep Google client secrets, bot tokens, and model API
keys out of this repository. Local `.env*` and `.dev.vars*` files are ignored,
except for `.env.example`.

## Checks and tests

```bash
npm run lint
npm test
npm run build
npm run test:integration
npm run check:vinext
npm run build:vinext
npm run test:integration:vinext
```

The [CI workflow](.github/workflows/ci.yml) runs these checks on pull requests and
pushes to `main`. Tests cover page availability, project routes, sharing metadata,
chat validation, token forwarding, quota states, and upstream failures. Integration
tests start local servers and a mock API; they do not call the live backend.
Google sign-in and visual layout still need manual browser checks.

## Cloudflare preview and deployment

The deployment uses two Workers:

- `wrangler.jsonc`: the portfolio, static assets, image optimization, and a
  `RESPONSE_STORE` service binding.
- `wrangler.response-store.jsonc`: an internal cache service backed by R2 and a
  SQLite Durable Object.

Development uses vinext's default cache. To preview the production cache path
locally, build and start both Workers:

```bash
npm run check:cloudflare
npm run build:vinext
npm run start:vinext
```

The preview normally runs at [localhost:8787](http://localhost:8787) with simulated
storage and no Cloudflare login. Local state lives in `.wrangler/`.
`check:cloudflare` is a configuration dry run; it does not provision resources.
Edit the source configuration files, not the generated `dist/server/wrangler.json`.

To override the demo settings for this preview:

```bash
npm run start:vinext -- --var SIERRA_API_URL:https://your-api-host --var SIERRA_GOOGLE_CLIENT_ID:your-client.apps.googleusercontent.com
```

For deployment, authenticate Wrangler to the configured Cloudflare account and
provision the R2 bucket named in the cache configuration. Deploy the cache service
before the portfolio:

```bash
npm run deploy:response-store
npm run deploy:vinext
```

The portfolio configuration uses `benrosar.io` as its custom domain. The application
command builds and deploys the site; redeploy the separate cache Worker when its
package or configuration changes. Both Workers have logs enabled and sample 1%
of traces. After deployment, check the pages, résumé, social previews, theme picker,
and sign-in flow in a browser.

## Updating content

| File | What to update |
| --- | --- |
| `app/page.tsx` | Introduction, About copy, and contact section |
| `lib/content.ts` | Profile links, project details, and case study content |
| `app/globals.css` | Layout, themes, and responsive styles |
| `public/resume.pdf` | Downloadable résumé |
| `app/opengraph-image.tsx` | Main social preview |
| `app/projects/[slug]/opengraph-image.tsx` | Project social previews |
