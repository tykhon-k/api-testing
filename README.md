# api-testing

[![CI](https://github.com/tykhon-k/api-testing/actions/workflows/ci.yml/badge.svg)](https://github.com/tykhon-k/api-testing/actions/workflows/ci.yml)

API test automation across three stacks - **Playwright API (TypeScript)**, **REST Assured (Java)**, and **Postman/newman** - all exercising one deterministic local API so the suite is reproducible and green in CI.

The point: the same contract, verified from the three toolchains teams actually use, with auth, CRUD, status-code, and schema/contract checks.

## System under test

`api/server.mjs` is a zero-dependency in-memory **Bookstore API** (auth + CRUD over `/books`). It resets its fixtures on `POST /reset`, so every test starts from a known state. No external services, nothing to flake.

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/auth` | `{username, password}` → `{token}` |
| GET | `/books` | list (seeded with 2) |
| GET | `/books/:id` | one, or 404 |
| POST | `/books` | **Bearer token**; validates payload (400 on bad input) |
| PUT | `/books/:id` | **Bearer token** |
| DELETE | `/books/:id` | **Bearer token** |

## Stacks

| Stack | Location | Covers |
| --- | --- | --- |
| Playwright API (TypeScript) | `tests-ts/` + `src/schemas.ts` | auth, CRUD, status codes, contract check on every book |
| REST Assured (Java) | `rest-assured/` | auth, list, authorized create, 401 without token |
| Postman / newman | `postman/` | auth → capture token → list → create (authorized + rejected) |

## Run it

```bash
npm install
npm run api            # start the API on :3000 (leave running)

# in another shell:
npm test               # Playwright API tests (TypeScript)
npm run postman        # Postman collection via newman
```

```bash
# Java stack (needs JDK 17 + Maven)
cd rest-assured && mvn test     # honours API_BASE_URL, defaults to localhost:3000
```

Lint / types:

```bash
npm run lint
npm run typecheck
```

## CI

GitHub Actions boots the API once and runs all three stacks against it (plus ESLint and `tsc --noEmit`), so a contract break shows up the same way in TypeScript, Java, and Postman. The Playwright HTML report is uploaded as an artifact.
