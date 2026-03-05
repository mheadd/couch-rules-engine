# AGENTS.md — CouchDB Rules Engine

## Hard Constraints

- **No frontend frameworks.** The web interface uses vanilla JavaScript, plain HTML, and pure CSS. Do not introduce React, Vue, Angular, or any UI framework.
- **No unnecessary dependencies.** Prefer built-in Node.js capabilities. Every new `npm install` needs a strong justification.
- **CouchDB validation functions must be ES5.** They run inside CouchDB's SpiderMonkey runtime—no `let`/`const`, no arrow functions, no destructuring, no template literals, no Promises. Backend Node.js code uses CommonJS (`require`/`module.exports`), not ES modules.
- **Validation errors use `throw({forbidden: "message"})`.** This is the CouchDB contract. Do not change this pattern.

## Required Workflow

- **Run `npm test` before considering any task complete.** All 65+ unit tests must pass.
- **Run `npm run lint` to check for linting issues.** ESLint is configured in `eslint.config.js`.
- **Every new validator gets a corresponding test file** in `test/unit/validators/`. Use `npm run create-rule` to scaffold both.
- **Check `ROADMAP.md` before starting feature work** to understand current phase priorities.

## Tools and Commands

| Task                    | Command                                                              |
| ----------------------- | -------------------------------------------------------------------- |
| Run all tests           | `npm test`                                                           |
| Run unit tests only     | `npm run test:unit`                                                  |
| Lint                    | `npm run lint`                                                       |
| Format                  | `npm run format`                                                     |
| Scaffold a new rule     | `npm run create-rule -- --name <name> --field <field> --type <type>` |
| Load rules into CouchDB | `npm run load <db> <user> <password>`                                |
| Start dev environment   | `docker-compose up -d`                                               |

## Non-Obvious Things

- **CouchDB reports only the first validation failure.** If multiple rules fail, the client sees only one error. Design rules and error messages knowing this.
- **Validation functions execute in unspecified order.** Do not depend on one rule running before another.
- **Validation functions cannot access external modules.** Each `validate_doc_update` function must be entirely self-contained.
- **The web interface talks directly to CouchDB's REST API.** There is no backend middleware. `web/js/utils/couchdb-client.js` wraps `fetch` calls with Basic Auth.
- **`index.js` auto-discovers validators.** You do not need to manually register new validators—just add a file to `validators/` that exports a function matching its filename.

## What Not to Do

- Do not add build tools, bundlers, or transpilers to the web interface.
- Do not commit credentials. Use environment variables (see `.env.example`).
- Do not duplicate documentation that already exists in `README.md`, `ARCHITECTURE.md`, `ROADMAP.md`, or `CONTRIBUTING.md`.
- Do not implement features outside the current roadmap phase without flagging it.
