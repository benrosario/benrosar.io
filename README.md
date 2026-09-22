# Ben Rosario — portfolio

A personal portfolio using React, TypeScript, Tailwind CSS v4, and App Router APIs.
Cloudflare Workers runs the site through vinext; the original Next.js commands
remain available for comparison and type checking.

## Local development

Use Node.js 22.18+ and install locked dependencies with `npm ci`.

```bash
npm run dev:vinext
```

Open http://localhost:3001. For the original Next.js server, use `npm run dev`
and http://localhost:3000.

## Portfolio implementation

This portfolio uses Next.js App Router, React, TypeScript, and Tailwind CSS v4
with custom design tokens. The homepage and project case studies render on the
server; the theme picker and optional authenticated demo are client components. No database or
CMS is required for the current content.

### Content

- `app/page.tsx`: introduction, About copy, contact section.
- `lib/content.ts`: public profile and project registry. Add an entry here to
  create a homepage project card and a generated `/projects/[slug]` case study.
- `app/globals.css`: responsive design, keyboard focus, reduced-motion behavior.
- `app/opengraph-image.tsx`, `app/sitemap.ts`, `app/robots.ts`: sharing and search.

The introduction and About copy reflect Ben’s Cognitive Science studies at UC
Berkeley. The project story includes his motivation, the bot’s scope, and student
feedback about non-English use. The site includes verified résumé figures,
Summer 2027 internship interests, leadership experience, and source-linked
regression evidence. It does not claim a measured retrieval-accuracy benchmark.
Contact links include email, GitHub, LinkedIn, and Résumé. Their URLs live in
`lib/content.ts`. Replace `public/resume.pdf` to update the résumé without changing
its link. The supplied public PDF is preserved unchanged, including the email
address it contains. The same public email is linked on the site.

### Google-authenticated live demo

The homepage always shows the project overview and evidence. It adds a real chat
when both runtime variables are configured:

- `SIERRA_API_URL`: the deployed FastAPI base URL, without `/demo/chat`.
- `SIERRA_GOOGLE_CLIENT_ID`: the public OAuth **Web application** client ID.

`GET /api/demo/config` returns only the public client ID, with `no-store`; it
returns `null` when the demo is unconfigured. A build-time client bundle never
contains the API URL or any server credential. For Next.js, use `.env.local` or
runtime environment variables. For Workers, use runtime variables in the source
Wrangler config (or Wrangler secrets). The Google client ID is public, not a
secret. Do not put the bot token, Google client secret, or OpenAI key in this site.

Google setup requires the website's exact origin (`https://benrosar.io`) under
Authorized JavaScript origins. Add a development origin separately if testing
locally. Use the same client ID on the Sierra API, deploy its updated commit, and
keep its quota database on persistent storage. See the upstream
[demo setup and API contract](https://github.com/benrosario/sierra-class-helper/blob/f62d7a40f602718a5ab380ebe03c057f84d27ceb/DEMO.md).

The Google script loads only when a visitor chooses to load sign-in. The callback
keeps the ID token in memory. The browser sends it in the Authorization header to
`POST /api/chat`; that proxy forwards it unchanged to `POST /demo/chat` over HTTPS.
Google signature/expiry/audience verification and quota enforcement happen on the
Sierra API. No cookies, caller-chosen identities, bot secrets, or raw upstream
errors are forwarded. Browser-to-API CORS is unnecessary for this proxy flow;
configure upstream allowed origins if also enabling direct browser calls.

There are three lifetime attempts per Google account. The UI sends one request at
a time, never automatically retries, displays returned `messages_remaining`,
disables sending at zero, and requires sign-in again on 401. Global daily capacity
and authentication burst limits have separate messages. An admitted failure may
consume a slot; the UI reports an uncertain allowance instead of promising a
retry is free. Resetting a conversation does not reset quota. Signing out removes
the local token and transcript, without changing Google's account session.

Requests are capped at 64 KiB and 2,000 message characters. History is trimmed to
10 messages, 8,000 characters per entry, and 12,000 total. Only user/assistant
roles are forwarded. Assistant replies render Markdown with lists, emphasis,
links, tables, and code; user messages remain plain text. Raw HTML and embedded
images are disabled, and only HTTP(S) links are clickable. The API proxy refuses
redirects and unsafe non-HTTPS upstream URLs (loopback HTTP is allowed for local
testing). The chat reminds visitors to verify course advice with Sierra College.

The production API URL and public client ID are configured in `wrangler.jsonc`.
Keep the API's Google client ID in sync when changing this configuration. A real
Google sign-in is needed to verify the complete flow; automated tests use a local
fixture service and no paid calls.

### Validation

Use Node.js 22.18+ (native TypeScript stripping is used by the test runner).

```bash
npm run lint
npm test
npm run build
```

### Cloudflare configuration and local preview

The site uses two separately deployed Workers:

- `wrangler.jsonc`: the portfolio, assets, Images binding, and a
  `RESPONSE_STORE` service binding.
- `wrangler.response-store.jsonc`: the cache service, its R2 bucket
  `benrosar-io-response-store-cache-bodies`, and SQLite Durable Object.

The Worker names and service entrypoint are aligned. Production output is
written to `dist/server/wrangler.json`; edit the source configs, not that output.

`vinext dev` uses the framework's default development cache because the Response
Store adapter requires the generated production entrypoint in this beta.
For the actual Workers cache path, build and start both Workers together:

```bash
npm run check:vinext
npm run check:cloudflare
npm run build:vinext
npm run start:vinext
```

The preview runs locally (normally http://localhost:8787), including simulated R2
and Durable Object storage. No Cloudflare login is required. Local storage lives
in the ignored `.wrangler/` directory. `check:cloudflare` is a configuration dry
run; it does not validate an account or provision resources.

For a local Workers preview with the live integration, pass both settings:

```bash
npm run start:vinext -- --var SIERRA_API_URL:https://your-api-host --var SIERRA_GOOGLE_CLIENT_ID:your-client.apps.googleusercontent.com
```

Local `.dev.vars*` files are ignored as well as `.env*` files. The configuration
endpoint reads the settings at request time; no public build-time environment
variable is needed.

### Deployment

The portfolio is deployed to Cloudflare Workers. `wrangler.jsonc` configures
`benrosar.io` as its custom domain and keeps the alternate
https://benrosar-io.benrosario30.workers.dev address available. Cloudflare manages
the custom domain's DNS and HTTPS certificate.

The private cache Worker uses the provisioned R2 bucket
`benrosar-io-response-store-cache-bodies` and a SQLite Durable Object. Both
Workers have logs enabled and sample 1% of traces for troubleshooting.

With Wrangler authenticated to the configured account, deploy in this order:

```bash
npm run deploy:response-store
npm run deploy:vinext
```

The cache service must exist before the portfolio can use it. The application
command builds and deploys the portfolio; it does not deploy the separate cache
Worker. Redeploy that Worker when its package/config changes. Experimental cache
prewarming is optional via `npm run deploy:vinext:warm` and requires an existing
portfolio deployment, so it cannot be used for the first deployment.

After publishing, verify HTTPS, page routes, the social image, résumé, theme
picker, project overview, email link, and project-specific social preview.
The cache Worker stays internal.

## Continuous integration

`.github/workflows/ci.yml` runs on pull requests and pushes to `main`. It installs
locked dependencies with Node.js 22, runs lint and unit tests, builds the site
(including TypeScript checks), then tests the production pages and chat routes in both Next.js and Cloudflare.
The integration suite starts and stops a separate Next.js server on port 3101
and a local mock course API. The vinext suite starts both Workers on port 3102
with isolated temporary storage and the same mock API. It never needs model keys
or calls the live backend.

```bash
npm run build
npm run test:integration
npm run check:vinext
npm run build:vinext
npm run test:integration:vinext
```

Coverage focuses on page availability, project routing, sharing metadata, chat
validation, token forwarding, lifetime and daily quota states, follow-up context,
rate limits, and safe handling of upstream errors.
It does not automate browser clicks or visual layout; those still need browser
checks. Avoid adding tests just to assert every paragraph or CSS class.

The workflow becomes active after these files are committed and pushed to GitHub.
No remote workflow run or branch-protection rule has been configured yet. Once
active, require the `Lint, tests, and production build` check on `main`. The next
hosting step is preview deployments for pull requests and production deployment
only after successful checks; that provider-specific connection is still pending.
