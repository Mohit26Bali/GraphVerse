# GraphVerse

An interactive platform for exploring mathematical functions through visualization, animation, and experimentation — 22 modules spanning coordinate geometry through multivariable calculus, each with an **Explore**, **Practice**, and **Sandbox** tab, plus a general-purpose graphing Sandbox that accepts arbitrary functions, implicit equations, and vertical lines.

## What this is

Every module follows the same three-tab shape:

- **Explore** — slider/animation-driven, always live-recomputed, built to make a single idea ("what does the gradient mean," "why does a Taylor polynomial converge near its center") visually obvious rather than just stated.
- **Practice** — a target to match or a question to answer, with tolerance-based checking, not multiple choice.
- **Sandbox** — free-form: type your own expression and see it plotted with the same math the Explore tab uses.

An AI "Explain this" panel (backed by Groq, `openai/gpt-oss-120b`) is available on every Explore tab — manual-trigger only, summarizing the exact state you're looking at.

The look is a dark "plotter" theme: charcoal paper, off-white ink, and five pen colours (yellow, cyan, green, magenta, orange) that colour every curve. Space Grotesk and JetBrains Mono are bundled at build time, so the site makes no third-party requests. The landing page keeps a looping background video with a pause button; visitors who ask for reduced motion get a still image instead.

## Tech stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui on `@base-ui/react` primitives |
| Math | MathJS (parsing, evaluation, symbolic differentiation) |
| Rendering | D3 (`d3-scale`, `d3-zoom`, `d3-shape`) for the SVG graph engine; raw Canvas/`ImageData` for the Mandelbrot/Julia fractal renderer and the multivariable contour maps |
| Equations | KaTeX |
| Animation | GSAP (tweened transitions) + a custom `requestAnimationFrame` sweep hook (continuous/looping motion) |
| State | Zustand |
| AI | Groq API, called only from a server route — never client-side |

## Architecture

The codebase is split by responsibility, not by module:

```text
graph-engine/      SVG rendering, D3 scales/zoom — no math logic
math-engine/       expression parsing/evaluation/analysis — no rendering
modules/           thin per-topic Explore/Practice/Sandbox composition
app/               routing only
animation-engine/  the two animation primitives (GSAP tween, RAF sweep)
components/        shared UI (shadcn primitives, ExplainPanel, ModuleHeader)
```

`graph-engine` components never import math logic directly; `math-engine` never imports React or touches the DOM. A module's job is composing the two, plus its own state.

## The 22 modules

**Foundations** — Coordinate Plane, Linear Functions, Quadratic Functions
**Algebra** — Polynomial Functions, Function Transformations, Piecewise Functions
**Trigonometry** — Trigonometric Functions, Parametric Curves, Polar Functions
**Analysis** — Exponential Functions, Logarithms, Function Composition, Inverse Functions, Limits, Derivatives, Integrals
**Advanced** — Sequences & Series, Taylor Series, Fourier Series, Differential Equations, Chaos & Fractals, Multivariable Calculus

## Notable technical details

- **General Sandbox** classifies typed input (`parseEquation`) into a plain function, a vertical line, or an implicit equation, and routes each to the right renderer — including a marching-squares implicit-curve plotter and automatic intersection-finding between whatever's plotted.
- **Multivariable Calculus** renders `f(x,y)` as a banded contour heatmap on canvas (the same escape-time-render pattern as the fractal module, generalized), with partial derivatives shown as literal tangent lines on 2D slice graphs, a directional-derivative arrow you rotate with a slider, and an animated gradient-descent walk.
- **Derivatives Practice** includes two applied problem types beyond tangent-slope estimation: a related-rates sliding-ladder problem and a fence-optimization problem, both solved by dragging a slider toward the true answer rather than typing a number.
- The maths is checked against closed forms and brute force (derivatives against finite differences, Riemann sums and Fourier series against exact values, Taylor coefficients, limits, ODE solutions, intersections and so on). That test suite is kept out of this repository.

## Security

- **Typed expressions** go through an allowlist before they reach mathjs: plain characters only, only listed scalar functions, no ranges, brackets, quotes or property access, at most 200 characters per box and 10 functions in the Sandbox. mathjs can otherwise be told to build huge lists and freeze the tab.
- **`/api/explain`** accepts same-origin JSON only, caps the body at 4 KB, accepts only the app's own module names, limits each visitor to 6 requests a minute (and the whole site to 60), times out the provider after 20 seconds, never forwards provider error text, and caps the answer length. The student's state is sent to the model as data, not as instructions.
- Security headers and a Content-Security-Policy are set in `next.config.ts` (`default-src 'self'`, no framing, no powered-by header, HSTS in production).
- `npm audit` reports no known vulnerabilities.

## Environment

Copy `.env.example` to `.env.local`. Everything is optional.

| Variable | Default | Used by | Notes |
| --- | --- | --- | --- |
| `GROQ_API_KEY` | none | `app/api/explain/route.ts` | Server-side only. Without it every module works and "Explain this" says it is not set up. |
| `GROQ_MODEL` | `openai/gpt-oss-120b` | explain route | Any Groq chat model. |
| `EXPLAIN_RATE_PER_MIN` | `6` | explain route | Requests per visitor per minute. |
| `EXPLAIN_GLOBAL_PER_MIN` | `60` | explain route | Requests for the whole site per minute. |
| `TRUSTED_PROXY_HOPS` | `0` | explain route | Number of reverse proxies in front of the app (Render, Vercel and nginx count as 1). Leave 0 if the app is reached directly. |
| `ALLOWED_ORIGIN` | none | explain route | Extra origin allowed to call the route. |
| `NEXT_PUBLIC_SITE_URL` | none | `app/layout.tsx` | Public URL for share images when not on Vercel (which sets `VERCEL_URL`). |

No database, no accounts, no other secrets.

## Limitations

- The rate limiter lives in memory, so each server instance counts separately and a restart resets it. A multi-instance deployment needs a shared store such as Redis.
- Typed expressions are limited to the listed functions (`sin`, `sqrt`, `log`, `abs`, `floor` and similar); matrices, units, sums over ranges and user-defined functions are deliberately not available. A number next to a bracket needs `*` (`2*(x+1)`, not `x(x+1)`).
- Graphs sample at a fixed resolution, so very sharp features (thin spikes, fast oscillation far from the origin) can be missed or drawn jagged. Numerical differential-equation curves stop where the solution heads to infinity or a gap.
- Each graph has a short label but no text description of the curve itself, so screen-reader users get the controls and readouts, not the picture.
- Explanations come from a language model and can be wrong; they are meant as a prompt for thinking, not an answer key.
- The Practice tabs are not saved: scores reset on reload.

## Possible improvements

- Shared (Redis) rate limiting and a spend cap for the AI route.
- Text descriptions of each graph for screen-reader users.
- Saving Practice progress and sharing a Sandbox as a link.
- A symbolic engine for exact derivatives and integrals instead of numerical checks where the module allows.
- Adaptive sampling so sharp features are resolved automatically.

## Running locally

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm start   # production build
npx tsc --noEmit              # typecheck
npm run lint                  # eslint
```

## Deployment

Zero-config on [Vercel](https://vercel.com/new) — connect the repo, add `GROQ_API_KEY` as an environment variable if you want the AI explain feature, deploy. Every route is static except `/api/explain`, which needs a server runtime (any Vercel plan provides this by default).

For any other Node host: `npm run build && npm start`, with the same `GROQ_API_KEY` env var set, and `TRUSTED_PROXY_HOPS=1` when a proxy sits in front (Render does) so the per-visitor limit sees real addresses. Set `NEXT_PUBLIC_SITE_URL` to your real domain so social-share previews resolve correctly.
