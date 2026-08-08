"use client";

import { Fragment, useMemo, type ReactNode } from "react";

/**
 * Minimal, dependency-free Markdown renderer for chat bubbles.
 *
 * The LLM answers in Markdown (Qwen does so by default), so rendering the raw
 * string leaked literal `**` / `###` to the user. This covers exactly the subset
 * the system prompt allows — bold, italic, inline code, one level of bullet or
 * numbered list — and degrades everything else (headings, tables, links, rules,
 * fences) to clean text instead of leaving syntax on screen.
 *
 * Deliberately not react-markdown: the bubble is 400px wide and needs a *smaller*
 * feature set than a full parser, not a bigger one. No HTML is ever produced from
 * model output, so there is no dangerouslySetInnerHTML / sanitizer surface.
 *
 * Streaming-safe: markers still being typed (`**bold` before its closer, or a
 * lone trailing `*` from a `**` split across two SSE chunks) render as if already
 * closed, so no marker ever flashes mid-stream.
 */

type Block =
  | { kind: "p"; lines: string[] }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] };

const HEADING = /^\s{0,3}#{1,6}\s+(.*)$/;
const BULLET = /^\s*[-*•+]\s+(.*)$/;
const ORDERED = /^\s*\d+[.)]\s+(.*)$/;
const QUOTE = /^\s*>\s?(.*)$/;
/** `---`, `***`, `___` — three or more of the same marker, nothing else. */
const RULE = /^\s*([-*_])(?:\s*\1){2,}\s*$/;
/** A markdown table's `|---|:--:|` separator row — noise once pipes are stripped. */
const TABLE_SEP = /^\s*\|?[\s:|-]*\|[\s:|-]*$/;
/** `| cell | cell |` — the prompt forbids tables, but flatten stragglers to
 *  readable text rather than leaving pipe art in a 400px bubble. */
const TABLE_ROW = /^\s*\|(.+)\|\s*$/;

function parseBlocks(src: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push({ kind: "p", lines: para });
      para = [];
    }
  };
  /** Append to the open list of `kind`, or start a new one. */
  const pushItem = (kind: "ul" | "ol", item: string) => {
    flushPara();
    const last = blocks[blocks.length - 1];
    // `last.kind !== "p"` is what narrows away the paragraph variant; comparing
    // against the `kind` parameter alone would not (it is itself a union).
    if (last && last.kind !== "p" && last.kind === kind) last.items.push(item);
    else blocks.push({ kind, items: [item] });
  };

  for (const raw of src.split("\n")) {
    const line = raw.trimEnd();

    if (!line.trim()) {
      flushPara();
      continue;
    }
    // Fences, rules and table separators carry no content — drop them entirely.
    if (RULE.test(line) || line.trim().startsWith("```")) {
      flushPara();
      continue;
    }
    if (TABLE_SEP.test(line) && line.includes("|")) {
      flushPara();
      continue;
    }

    const row = TABLE_ROW.exec(line);
    if (row) {
      const cells = row[1]
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean);
      if (cells.length) para.push(cells.join(" · "));
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      // A bubble is too narrow for real heading levels — emit one bold line.
      flushPara();
      const text = heading[1].replace(/[*_#]/g, "").trim();
      if (text) blocks.push({ kind: "p", lines: [`**${text}**`] });
      continue;
    }

    const quote = QUOTE.exec(line);
    if (quote) {
      para.push(quote[1]);
      continue;
    }

    const bullet = BULLET.exec(line);
    if (bullet) {
      pushItem("ul", bullet[1]);
      continue;
    }

    const ordered = ORDERED.exec(line);
    if (ordered) {
      pushItem("ol", ordered[1]);
      continue;
    }

    para.push(line);
  }

  flushPara();
  return blocks;
}

/** Inline markers, scanned left to right. Unclosed markers consume the rest of
 *  the string (mid-stream tolerance) rather than rendering their syntax. */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let buf = "";
  let key = 0;
  let i = 0;

  const flush = () => {
    if (buf) {
      nodes.push(buf);
      buf = "";
    }
  };

  while (i < text.length) {
    const ch = text[i];
    const pair = text.slice(i, i + 2);

    // A run of marker chars at the very end of the buffer is a half-typed token,
    // not content — swallow it so an opening `**` never flashes while the text it
    // wraps is still streaming. Must cover the whole run, not just one char:
    // "gợi ý **" would otherwise leave a single asterisk on screen.
    if (ch === "*" || ch === "`" || ch === "_") {
      let end = i;
      while (end < text.length && "*`_".includes(text[end])) end++;
      if (end === text.length) break;
    }

    // [label](url) -> label. The system prompt forbids links; if one slips
    // through, the label alone still reads correctly.
    if (ch === "[") {
      const m = /^\[([^\]]*)\]\([^)]*\)/.exec(text.slice(i));
      if (m) {
        buf += m[1];
        i += m[0].length;
        continue;
      }
    }

    if (pair === "**" || pair === "__") {
      const close = text.indexOf(pair, i + 2);
      const inner = close === -1 ? text.slice(i + 2) : text.slice(i + 2, close);
      if (inner.trim()) {
        flush();
        nodes.push(
          <strong key={key++} className="font-semibold text-stone-900">
            {renderInline(inner)}
          </strong>,
        );
        i = close === -1 ? text.length : close + 2;
        continue;
      }
    }

    if (ch === "`") {
      const close = text.indexOf("`", i + 1);
      const inner = close === -1 ? text.slice(i + 1) : text.slice(i + 1, close);
      if (inner.trim()) {
        flush();
        nodes.push(
          <code
            key={key++}
            className="rounded bg-stone-100 px-1 py-0.5 text-[0.9em] text-stone-700"
          >
            {inner}
          </code>,
        );
        i = close === -1 ? text.length : close + 1;
        continue;
      }
    }

    // Only `*` for italic — `_` appears inside SKUs and slugs, so treating it as
    // emphasis would mangle real product data.
    if (ch === "*") {
      const close = text.indexOf("*", i + 1);
      const inner = close === -1 ? text.slice(i + 1) : text.slice(i + 1, close);
      if (inner.trim() && !/^\s/.test(inner)) {
        flush();
        nodes.push(<em key={key++}>{renderInline(inner)}</em>);
        i = close === -1 ? text.length : close + 1;
        continue;
      }
    }

    buf += ch;
    i++;
  }

  flush();
  return nodes;
}

function Lines({ lines }: Readonly<{ lines: string[] }>) {
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {renderInline(line)}
        </Fragment>
      ))}
    </>
  );
}

/** Renders one assistant answer. Safe to call on every streamed token. */
export function MarkdownLite({ text }: Readonly<{ text: string }>) {
  const blocks = useMemo(() => parseBlocks(text), [text]);

  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        if (block.kind === "p") {
          return (
            <p key={i}>
              <Lines lines={block.lines} />
            </p>
          );
        }
        const items = block.items.map((item, j) => (
          <li key={j}>{renderInline(item)}</li>
        ));
        return block.kind === "ul" ? (
          <ul key={i} className="list-disc space-y-1 pl-4 marker:text-stone-400">
            {items}
          </ul>
        ) : (
          <ol key={i} className="list-decimal space-y-1 pl-4 marker:text-stone-400">
            {items}
          </ol>
        );
      })}
    </div>
  );
}
