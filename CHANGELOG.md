# Changelog

## v0.1.0 — 2026-05-27

- Initial release: detect which protocol a JSON document represents.
- 6 protocols + `unknown`: `agent-cards-spec`, `mcp-tool-card-spec`, `prompt-provenance-spec`, `evidence-bundle-spec`, `otel-genai-otlp`, `mcp-tools-list`.
- Resolution order: explicit version fields (`*_version`) take priority (high confidence), then OTLP envelope, then tools/list shape (medium), then shape-only signals for Suite docs missing a version (low), then `unknown`.
- Library API: `detect(input)` → `DetectResult` with `protocol`, `version`, `confidence`, `reason`.
- CLI: `kg-protocol-detect <file.json> [--json | --summary]`.
- Designed as a routing primitive in front of any governance pipeline that branches by document type. Composes with all 5 spec/corpus pairs.
- Node 20/22 CI (lint, typecheck, coverage, build, demo, `npm audit`), AGPL-3.0-or-later, Dependabot.
