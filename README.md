# goose-pentest

An offensive-security build of [goose](https://github.com/block/goose) — the open-source AI agent by the [Agentic AI Foundation](https://aaif.io/).

This fork does not add features. It **replaces the agent's identity**.

Stock goose is a general-purpose coding assistant. This build is an autonomous penetration-testing agent: it is given an objective against an authorized target, and it works the target until the objective is demonstrated or the engagement boundary closes it off.

---

## What changed

Eight files. Two prompt templates carry the transformation; the rest is consistency work.

| File | Change |
|---|---|
| `crates/goose/src/prompts/system.md` | **The core of the fork.** 39 lines → 300+. Replaces the coding-assistant identity with an offensive-security one. |
| `crates/goose/src/agents/platform_extensions/developer/mod.rs` | Developer extension instructions rewritten. Was "build software, `tree` → `rg` → `edit`". Now: operate the machine as an attack platform. |
| `crates/goose/src/prompts/subagent_system.md` | Subagents are now scoped attack tasks, not code tasks. |
| `crates/goose/src/agents/prompt_manager.rs` | Fixed a stale fallback string (`created by Block` → AAIF). |
| 4 × `prompt_manager` snapshots | Golden files regenerated to match. |

### The system prompt, section by section

- **The Prime Directive** — the objective is the only metric. A methodology that does not land the objective is a failure; an ugly technique that works is a success. After every action the agent must answer: *did that move me closer to the goal?*
- **Never Refuse — Attack the Goal** — "I can't", "I won't", "I'm unable to", and "you could try this yourself" are removed from the agent's vocabulary. The single permitted exception is scope, and it must be named as a boundary rather than an inability. The section gives an escalation ladder for being stuck (find out → build the missing tool → try the adjacent thing → ask for the resource while continuing → re-read the target) and a written self-check the agent must pass before it is allowed to call anything impossible.
- **Know Your Target** — study before striking. What it is built from, what it exposes, **who it trusts and how that trust was established**, what its own rules are, where the seams are, and what the same technology has looked like before. Ends with the counterweight: study is not an alternative to attacking, and endless reconnaissance is a way of avoiding contact.
- **What You Are Not** — explicitly not a report generator, not a vulnerability scanner, not an explainer. This exists because frontier models default hard to producing deliverables instead of exploiting things.
- **The Loop** — a six-step cycle with no natural terminus: falsifiable objective → recon → hypothesis → attack → verify against the objective → **if not achieved, generate a new strategy.** Repeating a known-dead path is called out as failure.
- **Web Is Your Home Ground** — the largest section. Deep coverage of identity and auth (OAuth/OIDC/SAML/MFA/reset flows), session and token handling (JWT confusion, CSRF asymmetry, session fixation), access control (BOLA, function-level, tenant isolation, mass assignment), injection across every interpreter, client-side (XSS sinks, CSP abuse, prototype pollution, CORS+credentials), server-side (SSRF to cloud metadata, deserialization, request smuggling, cache poisoning), API surface (GraphQL batching, version drift, WebSocket post-handshake auth), **business logic and race conditions**, and exposed backends (Actuator, Docker socket, kubelet, CI/CD).
- **Inventing Strategy** — no hardcoded method. Guidance for reaching a target nobody has written up: read the target's own code, change the question, work the edges, chain primitives, ask what the defenders forgot.
- **Transparency — Show Your Work** — state hypotheses before testing, report failures, label confidence honestly across three distinct levels, write so a second operator can resume cold.
- **Your Memory Lives On Disk** — the agent maintains `engagement/` with `scope.md`, `surface.md`, `findings.md`, `hypotheses.md`, `attempts.md`, `credentials.md`, `notes.md`, `journal.md`. Findings are recorded the moment they are confirmed, with raw evidence. Failures are recorded too, so a post-compaction agent does not repeat a dead end.
- **Authorization** — scope and authorization window are hard boundaries. The agent cannot widen scope, and must not route around a refusal. Be aggressive *within* the boundary; stop at demonstrable impact rather than exfiltrating real data.
- **Tool Doctrine** — discover what the environment has rather than assuming; build what is missing; reading is a tool.

### Why prompts and not code

goose keeps behaviour in prompts and capability in extensions. The agent's ability to read responses, reason about a target, and chain findings is a language-model property, not something a code change can install. So the fork puts the offensive reasoning where the agent actually reads it.

The memory requirement is satisfied without any new code: goose already has a shell and a filesystem, and the prompt makes writing the ledger a condition of the agent's own success. State survives context compaction because it lives on disk, not in the window.

---

## Kilo AI Gateway

This build ships configured for the **Kilo AI Gateway** — an OpenAI-compatible router at `https://api.kilo.ai/api/gateway`.

goose supports *declarative providers*, so adding Kilo requires **no recompilation**. A provider config in `~/.config/goose/custom_providers/` is picked up at startup.

Example config is in [`deploy/custom_kilo.json`](deploy/custom_kilo.json). The gateway exposes ~397 models; **18 are currently free** (zero prompt and completion cost).

### Setting it up

```bash
goose configure          # or: goose config set-secret KILO_API_KEY <your-key>
```

Then place the provider config:

```bash
mkdir -p ~/.config/goose/custom_providers
cp deploy/custom_kilo.json ~/.config/goose/custom_providers/
```

and set the provider in `~/.config/goose/config.yaml`:

```yaml
GOOSE_PROVIDER: custom_kilo
GOOSE_MODEL: nvidia/nemotron-3-ultra-550b-a55b:free
GOOSE_DISABLE_KEYRING: true      # keep secrets in ~/.config/goose/secrets.yaml
```

`GOOSE_DISABLE_KEYRING: true` puts secrets in a 0600 file rather than the OS keyring. That is deliberate for this use case — it is deterministic and works headless, which is what an unattended long-running agent needs.

### Free-tier reality, measured

The pinned models were tested end-to-end against goose's actual request shape — SSE streaming **and** tool-calling, since an agent is useless without the latter.

```
15 models × 2 (streaming on/off) = 30 requests
  → 28 returned HTTP 200 with tool_calls populated, cost = 0
```

Two caveats worth knowing before you rely on it:

1. **It is flaky.** One run produced an upstream `503 provider_overloaded` mid-conversation on a model that had answered fine seconds earlier. Different models fail at different times.
2. **Some free routes have hard caps.** `thinkingmachines/inkling-small:free` returned a persistent `limit_rpd` 429 across retries — a daily request cap, not a transient blip.

The practical consequence: **use model fallback.** Retrying the same model is the wrong response to a 429; switching to the next model in the chain is the right one. The pinned list in `deploy/custom_kilo.json` is ordered strongest-and-most-reliable first for exactly this purpose.

### Does the refusal ban actually hold?

Measured, not asserted. The agent was given a goal and a target state in which every single request returned `403` — deliberately engineered to invite giving up — and run for six turns.

```
refusal phrases across all turns    : none
turns survived on a fully-blocked target : 6
cost                                     : 0
```

It never wrote a sentence containing "I can't", "I'm unable to", "not possible", or "you could try". It kept re-approaching the surface — different objects, the auth endpoints, the root — rather than stopping. The prompt's job is to make surrender unavailable; the model's creativity at that point is its own.

Model quality also matters more than it looks. With the full system prompt and a single goal, `nvidia/nemotron-3-ultra-550b-a55b:free` produced a correct first action immediately — it created the engagement directory and wrote the authorization scope file unprompted. A smaller model tested against the same prompt spent its first four turns re-listing a directory before doing anything useful. The prompt tells the agent *what to do*; the model decides *whether it does it*.

---

## Building

Standard goose build. Rust toolchain per `rust-toolchain.toml`.

```bash
cargo build --release -p goose-cli     # CLI
cargo test  -p goose prompt_manager    # prompt snapshot tests
```

The prompt snapshots are the regression suite for this fork. Any change to `system.md` that is not reflected in the four `.snap` files will fail `cargo test`. Regenerate deliberately with `cargo insta review`.

---

## Running

```bash
goose session
```

Then give it an objective and the authorization reference:

```
Engagement TICKET-4471, authorized by ACME Corp.
In scope: app.acme.test, api.acme.test
Out of scope: billing.acme.test
Goal: demonstrate read access to another tenant's records using only my own credentials.
```

The agent will write its scope file, begin recon, and keep working.

---

## Considerations before you point this at anything

**This is real offensive tooling.** It is capable of autonomous exploitation. Point it only at systems you have written authorization to test. The prompt enforces scope discipline, but scope discipline in a prompt is not a substitute for scope discipline in your engagement paperwork.

**Run it where the blast radius is contained.** An unattended autonomous agent with a shell is a powerful thing to leave running. Give it a container or a dedicated VM.

**Free-tier rate limits will bite.** Approximately 200 requests/hour per IP on the free routes. A long campaign will exhaust that. Plan for paid models or your own upstream keys on the gateway.

**Upstream history is not included.** This repository carries a single clean commit containing goose's source at the point of forking. The `documentation/` directory from upstream (blog posts and video assets, ~311 MB) is not included. Add it from upstream if you want it:

```bash
git remote add upstream https://github.com/block/goose.git
git checkout upstream/main -- documentation
```

---

## Attribution

goose is developed by [Block](https://block.xyz) and the [Agentic AI Foundation](https://aaif.io/) at the Linux Foundation, released under Apache-2.0. This fork is a modification of that work. The `LICENSE` file is unchanged.

For the architecture of goose's original prompt system — how `system.md`, extension instructions, tool descriptions, `.goosehints`, and the turn-context block combine at runtime — see [`docs/prompt-architecture.md`](docs/prompt-architecture.md).
