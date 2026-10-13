# RentFlow Security Policy

## Reporting Security Issues

We take the security of RentFlow seriously. If you discover a vulnerability or security flaw, please do **NOT** open a public issue.

Instead, please send an encrypted or direct disclosure report to:
`security@rentflow.internal` (or directly reach out to the project repository maintainers).

Please include:
- A description of the vulnerability.
- Steps to reproduce or a proof of concept.
- The potential impact and affected components (`frontend/`, `backend/`, `ai/`).

## Secrets & Credentials Policy

1. **Zero Secret Policy in Git**: Under no circumstances should real secrets, private keys, database passwords, or production API tokens be committed to this repository.
2. **Environment Files**: All `.env` files are ignored by `.gitignore`. Only `.env.example` templates with mock or dummy variables may be committed.
3. **Frontend Isolation**: Frontend client code must NEVER contain backend secrets or database credentials. Any variable exposed via `VITE_*` is considered publicly accessible.
4. **AI Data Boundary**: The AI service does not have direct access to the operational database. Sensitive tenant identification documents and financial secrets must never be forwarded to third-party AI providers.
