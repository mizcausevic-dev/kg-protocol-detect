#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

import { detect } from "./detect.js";

interface Args {
  input?: string;
  format: "json" | "summary";
  help: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { format: "summary", help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") args.help = true;
    else if (a === "--json") args.format = "json";
    else if (a === "--summary") args.format = "summary";
    else if (!a.startsWith("-")) args.input = a;
    else throw new Error(`Unknown option: ${a}`);
  }
  return args;
}

const HELP = `kg-protocol-detect — sniff which Kinetic Gain Suite spec a JSON file represents

Usage:
  kg-protocol-detect <file.json> [--json | --summary]

Detects:
  - agent-cards-spec
  - mcp-tool-card-spec
  - prompt-provenance-spec
  - evidence-bundle-spec
  - otel-genai-otlp        (the OTLP/JSON envelope shape with resourceSpans[])
  - mcp-tools-list         (the MCP tools/list result shape)
  - unknown

Exit codes:
  0 — detection emitted
  2 — usage / I/O error`;

export function run(argv: string[]): number {
  let args: Args;
  try {
    args = parseArgs(argv);
  } catch (e) {
    process.stderr.write(`${(e as Error).message}\n`);
    return 2;
  }
  if (args.help || !args.input) {
    process.stdout.write(`${HELP}\n`);
    return args.help ? 0 : 2;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(readFileSync(args.input, "utf8"));
  } catch (e) {
    process.stderr.write(`error reading input: ${(e as Error).message}\n`);
    return 2;
  }

  const result = detect(payload);
  if (args.format === "json") {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    const v = result.version ? ` (v${result.version})` : "";
    process.stdout.write(`${result.protocol}${v} — ${result.confidence} confidence — ${result.reason}\n`);
  }
  return 0;
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  try {
    process.exit(run(process.argv.slice(2)));
  } catch (e) {
    process.stderr.write(`fatal: ${(e as Error).message}\n`);
    process.exit(2);
  }
}
