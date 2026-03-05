# Contributing to CouchDB Rules Engine

Thank you for your interest in contributing! This guide explains how to get started.

## Development Setup

### Prerequisites

- **Node.js** (LTS version recommended)
- **Docker** and **Docker Compose**
- **Git**

### Getting Started

```bash
# Clone the repository
git clone https://github.com/<owner>/couch-rules-engine.git
cd couch-rules-engine

# Install dependencies
npm install

# Start CouchDB via Docker
docker-compose up -d

# Run the test suite
npm test
```

### Environment Variables

Copy `.env.example` to `.env` and adjust values as needed:

```bash
cp .env.example .env
```

## Development Workflow

1. **Create a branch** from `master` for your change.
2. **Make your changes** following the code style and patterns below.
3. **Write or update tests** for your changes.
4. **Run the full test suite** and ensure all tests pass.
5. **Submit a pull request** with a clear description of the change.

## Code Style

- **Vanilla JavaScript only** — no frameworks (React, Vue, Angular, etc.)
- **Pure CSS** with CSS custom properties for theming in the web interface
- **No unnecessary dependencies** — prefer built-in Node.js capabilities
- **ESLint** and **Prettier** are configured — run `npm run lint` before committing

### Validation Rule Pattern

Each validator follows this structure:

```javascript
// validators/ruleName.js
exports.ruleName = function (doc) {
  if (invalidCondition) {
    throw { forbidden: 'Human-readable error message' };
  }
  return true;
};
```

Use the rule generator to scaffold new rules:

```bash
npm run create-rule -- --name myRule --field fieldName --type range --min 0 --max 100
```

## Adding a New Validation Rule

1. Create the validator file: `validators/newRule.js`
2. Export the validation function following the pattern above
3. Create a test file: `test/unit/validators/newRule.test.js`
4. Run `npm test` to verify everything works
5. Load into CouchDB: `npm run load <db> <user> <password>`

## Testing

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Validator tests only
npm run test:validators

# Integration tests (requires running CouchDB)
npm run test:integration

# Watch mode
npm run test:watch
```

## Commit Messages

Use clear, descriptive commit messages:

- `feat: add income threshold validator`
- `fix: correct household size boundary check`
- `docs: update CONTRIBUTING guide`
- `test: add edge case tests for numberOfDependents`

## Pull Requests

- Reference any related issues in the PR description
- Ensure all CI checks pass
- Keep PRs focused — one feature or fix per PR
- Update documentation if your change affects user-facing behavior

## Reporting Issues

- Use GitHub Issues to report bugs or request features
- Include steps to reproduce for bug reports
- Check existing issues before creating a new one

## License

By contributing, you agree that your contributions will be licensed under the project's ISC License.
