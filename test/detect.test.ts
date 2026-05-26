import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { detect } from "../src/detect.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const load = (name: string): unknown => JSON.parse(readFileSync(`${here}/../fixtures/${name}`, "utf8"));

describe("detect — version-field signals (high confidence)", () => {
  it("identifies agent-cards-spec by agent_card_version", () => {
    const r = detect(load("agent-card.json"));
    expect(r.protocol).toBe("agent-cards-spec");
    expect(r.version).toBe("0.1");
    expect(r.confidence).toBe("high");
  });

  it("identifies mcp-tool-card-spec by tool_card_version", () => {
    const r = detect({ tool_card_version: "0.1", tool: {}, schema: {}, safety: {}, audit: {} });
    expect(r.protocol).toBe("mcp-tool-card-spec");
    expect(r.version).toBe("0.1");
    expect(r.confidence).toBe("high");
  });

  it("identifies prompt-provenance-spec by provenance_version", () => {
    const r = detect({ provenance_version: "0.1", prompt: {}, lineage: {}, authorship: {}, approval: {} });
    expect(r.protocol).toBe("prompt-provenance-spec");
    expect(r.version).toBe("0.1");
    expect(r.confidence).toBe("high");
  });

  it("identifies evidence-bundle-spec by evidence_bundle_version", () => {
    const r = detect({ evidence_bundle_version: "0.1", bundle: {}, items: [] });
    expect(r.protocol).toBe("evidence-bundle-spec");
    expect(r.version).toBe("0.1");
    expect(r.confidence).toBe("high");
  });
});

describe("detect — envelope/shape signals", () => {
  it("identifies otel-genai-otlp by resourceSpans envelope", () => {
    const r = detect(load("otlp-spans.json"));
    expect(r.protocol).toBe("otel-genai-otlp");
    expect(r.confidence).toBe("high");
  });

  it("identifies mcp-tools-list by tools[] with named entries", () => {
    const r = detect(load("tools-list.json"));
    expect(r.protocol).toBe("mcp-tools-list");
    expect(r.confidence).toBe("medium");
  });

  it("does NOT identify mcp-tools-list when tools[] entries lack `name`", () => {
    const r = detect({ tools: [{ description: "no name" }] });
    expect(r.protocol).not.toBe("mcp-tools-list");
  });
});

describe("detect — shape-only fallbacks (low confidence)", () => {
  it("identifies agent-cards-spec by shape when version is missing", () => {
    const r = detect({ agent: {}, capabilities: {}, refusal_taxonomy: [] });
    expect(r.protocol).toBe("agent-cards-spec");
    expect(r.confidence).toBe("low");
    expect(r.version).toBeUndefined();
  });

  it("identifies mcp-tool-card-spec by shape when version is missing", () => {
    const r = detect({ tool: {}, safety: {}, audit: {} });
    expect(r.protocol).toBe("mcp-tool-card-spec");
    expect(r.confidence).toBe("low");
  });

  it("identifies prompt-provenance-spec by shape when version is missing", () => {
    const r = detect({ prompt: {}, lineage: {}, authorship: {} });
    expect(r.protocol).toBe("prompt-provenance-spec");
    expect(r.confidence).toBe("low");
  });

  it("identifies evidence-bundle-spec by shape when version is missing", () => {
    const r = detect({ bundle: {}, items: [] });
    expect(r.protocol).toBe("evidence-bundle-spec");
    expect(r.confidence).toBe("low");
  });
});

describe("detect — unknowns", () => {
  it("returns unknown for an empty object", () => {
    const r = detect({});
    expect(r.protocol).toBe("unknown");
    expect(r.confidence).toBe("low");
  });

  it("returns unknown for non-object inputs", () => {
    expect(detect(null).protocol).toBe("unknown");
    expect(detect(42).protocol).toBe("unknown");
    expect(detect("string").protocol).toBe("unknown");
    expect(detect([1, 2, 3]).protocol).toBe("unknown");
  });

  it("returns unknown for an arbitrary JSON object without our discriminators", () => {
    const r = detect({ foo: "bar", baz: 1 });
    expect(r.protocol).toBe("unknown");
  });
});

describe("detect — resolution order", () => {
  it("prefers explicit version over shape signals when both are present", () => {
    const r = detect({ agent_card_version: "0.1", bundle: {}, items: [] });
    expect(r.protocol).toBe("agent-cards-spec");
    expect(r.confidence).toBe("high");
  });

  it("returns the version verbatim when supplied as a string", () => {
    const r = detect({ tool_card_version: "0.2-beta" });
    expect(r.version).toBe("0.2-beta");
  });

  it("ignores non-string version fields", () => {
    const r = detect({ agent_card_version: 42 });
    expect(r.protocol).not.toBe("agent-cards-spec");
  });
});
