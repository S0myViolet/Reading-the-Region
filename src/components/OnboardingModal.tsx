"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ONBOARDING_SCREENS } from "@/lib/copy";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { IntelligencePipeline } from "./IntelligencePipeline";
import { pipelineCounts } from "@/lib/derived";

/**
 * First-run onboarding: five short screens plus a finishing screen. Appears
 * once; can be replayed from Settings or the Methodology page.
 */
export function OnboardingModal() {
  const hydrated = useHydrated();
  const store = useIntelligenceStore();
  const complete = useIntelligenceStore((s) => s.onboardingComplete);
  const finish = useIntelligenceStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const router = useRouter();

  if (!hydrated || complete) return null;

  const totalSteps = ONBOARDING_SCREENS.length + 1;
  const isFinal = step === ONBOARDING_SCREENS.length;
  const screen = ONBOARDING_SCREENS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="card w-full max-w-xl">
        <div className="border-b border-line px-6 py-4">
          <p className="overline-label">
            Reading the Region · Getting started · {step + 1} of {totalSteps}
          </p>
          <div className="mt-2 flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={`h-[3px] flex-1 rounded-[1px] ${i <= step ? "bg-accent" : "bg-surface-muted"}`}
              />
            ))}
          </div>
        </div>

        <div className="px-6 py-5">
          {isFinal ? (
            <>
              <h2 className="font-display text-[22px] text-ink">You are ready to begin</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                The workspace is seeded with a demonstration dataset — observations, signals,
                cluster candidates, patterns, contradictions, driver hypotheses, one future
                territory, scenarios, implications and monitoring indicators — so every layer of
                the method is visible from the start.
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                The recommended starting point is the Scan Inbox: review raw observations and
                promote only those that suggest a future possibility.
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display text-[22px] text-ink">{screen.title}</h2>
              {step === 1 ? (
                <div className="mt-3">
                  <IntelligencePipeline compact counts={pipelineCounts(store)} />
                </div>
              ) : null}
              <div className="mt-3 space-y-2">
                {screen.body.map((p) => (
                  <p key={p} className="text-[13px] leading-relaxed text-ink-soft">
                    {p}
                  </p>
                ))}
              </div>
              {screen.emphasis ? (
                <p className="mt-3 border-l-2 border-l-accent bg-accent-soft/50 px-3 py-2 text-[13px] font-medium text-accent-ink">
                  {screen.emphasis}
                </p>
              ) : null}
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line px-6 py-3">
          <button
            onClick={() => finish()}
            className="text-[11.5px] text-ink-faint hover:text-ink"
          >
            Skip introduction
          </button>
          <div className="flex gap-2">
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="border border-line bg-surface px-3 py-1.5 text-[12.5px] text-ink-soft rounded-[2px] hover:border-line-strong"
              >
                Back
              </button>
            ) : null}
            {isFinal ? (
              <>
                <button
                  onClick={() => {
                    finish();
                    router.push("/");
                  }}
                  className="border border-line bg-surface px-3 py-1.5 text-[12.5px] text-ink-soft rounded-[2px] hover:border-line-strong"
                >
                  View Intelligence Overview
                </button>
                <button
                  onClick={() => {
                    finish();
                    router.push("/inbox");
                  }}
                  className="border border-accent bg-accent px-3 py-1.5 text-[12.5px] font-medium text-white rounded-[2px] hover:bg-accent-ink"
                >
                  Start in Scan Inbox
                </button>
              </>
            ) : (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="border border-accent bg-accent px-3 py-1.5 text-[12.5px] font-medium text-white rounded-[2px] hover:bg-accent-ink"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
