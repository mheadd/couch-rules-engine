# Copilot Instructions — CouchDB Rules Engine

## Constraints

- Vanilla JavaScript only — no frontend frameworks, no bundlers, no transpilers.
- CouchDB validation functions must be ES5 (no `let`/`const`, no arrow functions). They use `throw({forbidden: "message"})`.
- Backend code uses CommonJS (`require`/`module.exports`), not ES modules.
- Minimize dependencies. Prefer built-in Node.js capabilities.
- Do not commit credentials. Use environment variables.

## Workflow

- Run `npm test` to verify changes. Run `npm run lint` to check style.
- Use `npm run create-rule` to scaffold new validators with matching tests.
- Check `ROADMAP.md` for current priorities before starting feature work.
- Refer to `ARCHITECTURE.md` for system design context.
