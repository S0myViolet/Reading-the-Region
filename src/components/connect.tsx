"use client";

/**
 * Shared building blocks for the Advanced Connect section — Cluster Maps,
 * Patterns, and Contradictions. Every Connect page must answer five
 * questions quickly: what is this, what supports it, why it matters, what
 * could weaken it, and what to check next. These blocks carry that structure
 * so the three route families answer them the same way.
 */

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { STAGE_LABELS } from "@/lib/pipeline";
import type { TrailStep } from "./EvidenceTrail";

// ---------------------------------------------------------------------------
// At a glance — the answer to "what is this?" in one quiet grid
// ---------------------------------------------------------------------------

export function AtAGlance({
  items,
}: {
  items: Array<{ label: string; value: ReactNode }>;
}) {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
      {items.map((it) => (
        <div key={it.label}>
          <dt className="text-[11px] text-ink-faint">{it.label}</dt>
          <dd className="mt-0.5 text-[13px] leading-snug text-ink">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// ---------------------------------------------------------------------------
// Labelled prose block — Plain meaning, What connects the signals, Next step…
// ---------------------------------------------------------------------------

export function ConnectBlock({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="text-[13px] font-medium text-ink">{heading}</h3>
      <div className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-soft">
        {children}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Validation checklist — requirement · current · threshold · result · why
// ---------------------------------------------------------------------------

export interface CheckRowData {
  requirement: string;
  current: string;
  threshold: string;
  passed: boolean;
  /** Why the requirement exists — what it protects the analysis from. */
  explanation: string;
}

export function ValidationCheckRows({ checks }: { checks: CheckRowData[] }) {
  return (
    <ul className="divide-y divide-line">
      {checks.map((c) => (
        <li key={c.requirement} className="py-3 first:pt-0 last:pb-0">
          <div className="flex items-baseline justify-between gap-6">
            <p className="text-[12.5px] font-medium text-ink">{c.requirement}</p>
            <span
              className={`shrink-0 text-[11.5px] ${
                c.passed ? "text-accent-ink" : "text-caution"
              }`}
            >
              {c.passed ? "Pass" : "Not yet"}
            </span>
          </div>
          <p className="mt-0.5 font-mono text-[11px] text-ink-faint">
            Current: {c.current} · Threshold: {c.threshold}
          </p>
          <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-ink-soft">
            {c.explanation}
          </p>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Score with explanation — never a bare number
// ---------------------------------------------------------------------------

export function ScoreExplanationRow({
  label,
  score,
  explanation,
}: {
  label: string;
  score: number;
  explanation: string;
}) {
  return (
    <div className="py-2.5 first:pt-0 last:pb-0">
      <p className="text-[12.5px] text-ink">
        <span className="font-medium">{label}:</span>{" "}
        <span className="font-mono text-[12px]">{score}/5</span>
      </p>
      <p className="mt-0.5 max-w-xl text-[12px] leading-relaxed text-ink-soft">
        {explanation}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Structured tension — one side vs the other, then why it matters
// ---------------------------------------------------------------------------

export function TensionBlock({
  name,
  href,
  typeLabel,
  sideA,
  sideB,
  rows,
}: {
  name: string;
  href?: string;
  typeLabel?: string;
  sideA: { claim: string; support?: string };
  sideB: { claim: string; support?: string };
  /** Labelled follow-ons: Why this matters, What to watch, Effect on this pattern… */
  rows: Array<{ label: string; text: string }>;
}) {
  return (
    <section className="border-l-2 border-tension/50 pl-4">
      {typeLabel ? <p className="text-[11px] text-tension">{typeLabel}</p> : null}
      <h3 className="font-display mt-0.5 text-[15px] text-ink">
        {href ? (
          <Link href={href} className="hover:text-accent-ink">
            {name}
          </Link>
        ) : (
          name
        )}
      </h3>
      <div className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-[11px] text-ink-faint">One side</p>
          <p className="text-[13px] leading-snug text-ink">{sideA.claim}</p>
          {sideA.support ? (
            <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
              {sideA.support}
            </p>
          ) : null}
        </div>
        <div>
          <p className="mb-1 text-[11px] text-ink-faint">The other side</p>
          <p className="text-[13px] leading-snug text-ink">{sideB.claim}</p>
          {sideB.support ? (
            <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
              {sideB.support}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {rows.map((r) => (
          <p key={r.label} className="text-[12px] leading-relaxed text-ink-soft">
            <span className="text-ink-faint">{r.label} — </span>
            {r.text}
          </p>
        ))}
      </div>
      {href ? (
        <p className="mt-2.5">
          <Link
            href={href}
            className="text-[12px] text-ink-soft underline decoration-line-strong underline-offset-2 hover:text-ink"
          >
            Open contradiction
          </Link>
        </p>
      ) : null}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Relationship trail — top links by default, full trail on request
// ---------------------------------------------------------------------------

export interface TrailGroup {
  label: string;
  steps: TrailStep[];
  /** Show only this many by default; the rest sit behind the expand control. */
  previewCount?: number;
}

export function RelationshipTrail({ groups }: { groups: TrailGroup[] }) {
  const [expanded, setExpanded] = useState(false);
  const nonEmpty = groups.filter((g) => g.steps.length > 0);
  if (nonEmpty.length === 0) return null;
  const hidden = nonEmpty.reduce(
    (acc, g) => acc + Math.max(0, g.steps.length - (g.previewCount ?? g.steps.length)),
    0,
  );
  return (
    <div className="space-y-4">
      {nonEmpty.map((g) => {
        const visible = expanded ? g.steps : g.steps.slice(0, g.previewCount ?? g.steps.length);
        return (
          <section key={g.label}>
            <p className="mb-1.5 text-[11px] text-ink-faint">{g.label}</p>
            <ol className="space-y-1.5 border-l border-line pl-4">
              {visible.map((step, i) => (
                <li
                  key={`${step.stage}-${step.title}-${i}`}
                  className="text-[12px] leading-snug"
                >
                  <span className="mr-2 text-[10.5px] text-ink-faint">
                    {STAGE_LABELS[step.stage]}
                  </span>
                  {step.href ? (
                    <Link
                      href={step.href}
                      className="text-ink-soft underline-offset-2 hover:text-accent-ink hover:underline"
                    >
                      {step.title}
                    </Link>
                  ) : (
                    <span className="text-ink-soft">{step.title}</span>
                  )}
                </li>
              ))}
            </ol>
          </section>
        );
      })}
      {hidden > 0 && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-[12px] text-ink-soft underline decoration-line-strong underline-offset-2 hover:text-ink"
        >
          Show full relationship trail ({hidden} more)
        </button>
      ) : null}
      {expanded && hidden > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-[12px] text-ink-soft underline decoration-line-strong underline-offset-2 hover:text-ink"
        >
          Show top links only
        </button>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Incomplete analysis — what is missing, why it matters, what to do next
// ---------------------------------------------------------------------------

export function IncompleteNote({
  missing,
  whyItMatters,
  nextStep,
}: {
  missing: string;
  whyItMatters: string;
  nextStep: string;
}) {
  return (
    <div className="max-w-xl space-y-2">
      <p className="text-[13px] text-ink">{missing}</p>
      <p className="text-[12px] leading-relaxed text-ink-soft">
        <span className="text-ink-faint">Why it matters — </span>
        {whyItMatters}
      </p>
      <p className="text-[12px] leading-relaxed text-ink-soft">
        <span className="text-ink-faint">Next step — </span>
        {nextStep}
      </p>
    </div>
  );
}
