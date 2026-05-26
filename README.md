# kg-protocol-detect

Tiny utility that **sniffs which protocol a JSON document represents** — agent-cards-spec, mcp-tool-card-spec, prompt-provenance-spec, evidence-bundle-spec, OTel GenAI OTLP envelope, or MCP `tools/list`.

Returns `{ protocol, version, confidence, reason }`. Use it as the routing primitive in front of any governance pipeline.

> Status: v0.1.0 — Node 20/22 supported, library + CLI.

## Detection rules

| Signal | Protocol | Confidence |
|---|---|---|
| `agent_card_version: "…"` | `agent-cards-spec` | high |
| `tool_card_version: "…"` | `mcp-tool-card-spec` | high |
| `provenance_version: "…"` | `prompt-provenance-spec` | high |
| `evidence_bundle_version: "…"` | `evidence-bundle-spec` | high |
| `resourceSpans[]` envelope | `otel-genai-otlp` | high |
| `tools[]` array with `name` on each | `mcp-tools-list` | medium |
| `agent + capabilities + refusal_taxonomy` shape (no version) | `agent-cards-spec` | low |
| `tool + safety + audit` shape (no version) | `mcp-tool-card-spec` | low |
| `prompt + lineage + authorship` shape (no version) | `prompt-provenance-spec` | low |
| `bundle + items[]` shape (no version) | `evidence-bundle-spec` | low |
| nothing matched | `unknown` | low |

Version fields take priority over shape signals — an explicit `agent_card_version` always wins over `bundle + items` even when both are present.

## CLI

```
npx kg-protocol-detect <file.json> [--json | --summary]
```

```
$ kg-protocol-detect agent-card.json
agent-cards-spec (v0.1) — high confidence — agent_card_version field present
```

```
$ kg-protocol-detect agent-card.json --json
{ "protocol": "agent-cards-spec", "version": "0.1", "confidence": "high", "reason": "agent_card_version field present" }
```

## Library

```ts
import { detect } from "kg-protocol-detect";

const result = detect(JSON.parse(text));
switch (result.protocol) {
  case "agent-cards-spec":      return runAgentCardValidator(text);
  case "mcp-tool-card-spec":    return runToolCardValidator(text);
  case "prompt-provenance-spec":return runProvenanceValidator(text);
  case "evidence-bundle-spec":  return runEvidenceValidator(text);
  case "otel-genai-otlp":       return runOtelValidator(text);
  case "mcp-tools-list":        return runToolsListValidator(text);
  default:                      throw new Error("unknown protocol");
}
```

## Composes with

The five validator / corpus pairs detect routes to:

- [`agent-cards-spec`](https://github.com/mizcausevic-dev/agent-cards-spec) + [`agent-card-test-vectors`](https://github.com/mizcausevic-dev/agent-card-test-vectors)
- [`mcp-tool-card-spec`](https://github.com/mizcausevic-dev/mcp-tool-card-spec) + [`mcp-tool-card-test-vectors`](https://github.com/mizcausevic-dev/mcp-tool-card-test-vectors)
- [`prompt-provenance-spec`](https://github.com/mizcausevic-dev/prompt-provenance-spec) + [`prompt-provenance-test-vectors`](https://github.com/mizcausevic-dev/prompt-provenance-test-vectors)
- [`evidence-bundle-spec`](https://github.com/mizcausevic-dev/evidence-bundle-spec) + [`evidence-bundle-test-vectors`](https://github.com/mizcausevic-dev/evidence-bundle-test-vectors)
- [`otel-genai-validator`](https://github.com/mizcausevic-dev/otel-genai-validator) + [`otel-genai-test-vectors`](https://github.com/mizcausevic-dev/otel-genai-test-vectors)

## Develop

```
npm install
npm run lint && npm run typecheck && npm run coverage && npm run build
npm run demo
```

## License

[AGPL-3.0-or-later](LICENSE)
