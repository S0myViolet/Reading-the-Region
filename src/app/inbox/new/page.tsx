"use client";

/**
 * Capture a new observation into the Scan Inbox. Saving does not promote:
 * every new observation lands as "unreviewed" and is triaged on its detail
 * page against the 9-item promotion checklist.
 *
 * The form is a single calm flow — field groups separated by whitespace
 * under quiet headings, one primary Save action at the end.
 */

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { useViewMode } from "@/components/ViewMode";
import {
  CheckboxList,
  Field,
  Select,
  TextArea,
  TextInput,
} from "@/components/form";
import { nextId, useHydrated, useIntelligenceStore } from "@/lib/store";
import type {
  PromotionChecklist,
  Region,
  Sector,
  SourceType,
} from "@/lib/types";
import {
  PROMOTION_CRITERIA,
  PROMOTION_MIN_CRITERIA,
  SECTOR_LABELS,
  SOURCE_TYPE_LABELS,
} from "@/lib/types";
import {
  EMPTY_CHECKLIST,
  REGION_OPTIONS,
  btnPrimary,
  btnSecondary,
} from "../observation-ui";

const SOURCE_TYPE_OPTIONS = Object.keys(SOURCE_TYPE_LABELS) as SourceType[];
const SECTOR_OPTIONS = (Object.keys(SECTOR_LABELS) as Sector[]).map((s) => ({
  value: s,
  label: SECTOR_LABELS[s],
}));

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function NewObservationHeader() {
  return (
    <PageHeader
      title="Add observation"
      description="Capture raw material before judging it. Saving an observation does not create a signal — it enters the inbox as unreviewed and must pass the promotion checklist in triage."
    />
  );
}

/** Quiet form group: heading, optional hint, fields — separated by whitespace, no box. */
function FormSection({
  heading,
  hint,
  children,
}: {
  heading: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-[15px] font-medium text-ink">{heading}</h2>
      {hint ? <p className="mt-0.5 text-[12px] text-ink-faint">{hint}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export default function NewObservationPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const viewMode = useViewMode();
  const observations = useIntelligenceStore((s) => s.observations);
  const sources = useIntelligenceStore((s) => s.sources);
  const addObservation = useIntelligenceStore((s) => s.addObservation);
  const addSource = useIntelligenceStore((s) => s.addSource);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [existingSourceId, setExistingSourceId] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("news_publication");
  const [dateObserved, setDateObserved] = useState(todayIso);
  const [eventDate, setEventDate] = useState("");
  const [region, setRegion] = useState<Region>("MENA-wide");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [subsector, setSubsector] = useState("");
  const [actorInvolved, setActorInvolved] = useState("");
  const [initialNotes, setInitialNotes] = useState("");
  const [potentialFutureRelevance, setPotentialFutureRelevance] = useState("");
  const [checklist, setChecklist] = useState<PromotionChecklist>(EMPTY_CHECKLIST);
  const [criteriaOpen, setCriteriaOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  if (!hydrated) {
    return (
      <>
        <Breadcrumbs
          items={[{ label: "Scan Inbox", href: "/inbox" }, { label: "New observation" }]}
        />
        <NewObservationHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const existingSource =
    sources.find((s) => s.id === existingSourceId) ?? null;
  const criteriaMet = PROMOTION_CRITERIA.filter((c) => checklist[c.key]).length;

  function handleSave() {
    const errs: string[] = [];
    if (!title.trim()) errs.push("Title is required.");
    if (!description.trim()) errs.push("Description is required.");
    if (!existingSource && !sourceName.trim())
      errs.push(
        "Source name is required — every observation records where it came from.",
      );
    if (!dateObserved) errs.push("Date observed is required.");
    if (!country.trim()) errs.push("Country is required.");
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    const now = new Date().toISOString();

    let sourceId: string | null;
    let obsSourceName: string;
    let obsSourceUrl: string | null;
    let obsSourceType: SourceType;

    if (existingSource) {
      sourceId = existingSource.id;
      obsSourceName = existingSource.name;
      obsSourceUrl = existingSource.url;
      obsSourceType = existingSource.sourceType;
    } else {
      sourceId = nextId("SRC", sources);
      obsSourceName = sourceName.trim();
      obsSourceUrl = sourceUrl.trim() ? sourceUrl.trim() : null;
      obsSourceType = sourceType;
      addSource({
        id: sourceId,
        name: obsSourceName,
        url: obsSourceUrl,
        sourceType: obsSourceType,
        credibility: 3,
        biasTags: [],
        roles: ["discovery"],
        dateAdded: now.slice(0, 10),
        notes: "Added during observation capture. Review credibility, bias tags, and roles before using for validation.",
        isDemo: false,
      });
    }

    const obsId = nextId("OBS", observations);
    addObservation({
      id: obsId,
      title: title.trim(),
      description: description.trim(),
      sourceId,
      sourceName: obsSourceName,
      sourceUrl: obsSourceUrl,
      sourceType: obsSourceType,
      dateObserved,
      eventDate: eventDate ? eventDate : null,
      region,
      country: country.trim(),
      city: city.trim() ? city.trim() : null,
      sectors,
      subsector: subsector.trim() ? subsector.trim() : null,
      actorInvolved: actorInvolved.trim() ? actorInvolved.trim() : null,
      initialNotes: initialNotes.trim(),
      potentialFutureRelevance: potentialFutureRelevance.trim(),
      status: "unreviewed",
      triageRationale: null,
      checklist,
      promotedSignalId: null,
      createdAt: now,
      updatedAt: now,
    });
    router.push(`/inbox/${obsId}`);
  }

  return (
    <>
      <Breadcrumbs
        items={[{ label: "Scan Inbox", href: "/inbox" }, { label: "New observation" }]}
      />
      <NewObservationHeader />

      <div className="max-w-3xl">
        <FormSection heading="What you observed">
          <Field label="Title" required>
            <TextInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="One line naming the observed event or behaviour"
            />
          </Field>
          <Field
            label="Description"
            required
            hint="Factual account of what was seen. Interpretation comes later, in the signal's zooming analysis."
          >
            <TextArea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <Field label="Initial notes">
            <TextArea
              value={initialNotes}
              onChange={(e) => setInitialNotes(e.target.value)}
            />
          </Field>
          <Field
            label="Potential future relevance"
            hint="Why might this matter later? A hunch is acceptable at capture."
          >
            <TextArea
              value={potentialFutureRelevance}
              onChange={(e) => setPotentialFutureRelevance(e.target.value)}
            />
          </Field>
        </FormSection>

        <FormSection heading="Where it came from">
          <Field
            label="Existing source"
            hint="Pick a registered source, or leave as “— new source —” to record one from scratch."
          >
            <Select
              value={existingSourceId}
              onChange={(e) => setExistingSourceId(e.target.value)}
            >
              <option value="">— new source —</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · C{s.credibility} · {SOURCE_TYPE_LABELS[s.sourceType]}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Source name" required={!existingSource}>
              <TextInput
                value={existingSource ? existingSource.name : sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                disabled={!!existingSource}
                placeholder="Publication, dataset, person, or place"
              />
            </Field>
            <Field label="Source URL" hint="Optional.">
              <TextInput
                value={existingSource ? existingSource.url ?? "" : sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                disabled={!!existingSource}
                placeholder="https://…"
              />
            </Field>
            <Field label="Source type">
              <Select
                value={existingSource ? existingSource.sourceType : sourceType}
                onChange={(e) => setSourceType(e.target.value as SourceType)}
                disabled={!!existingSource}
              >
                {SOURCE_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {SOURCE_TYPE_LABELS[t]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          {!existingSource ? (
            <p className="text-[11.5px] leading-relaxed text-ink-faint">
              A new source record is created with default medium credibility (C3)
              and a discovery role. Assess its credibility and bias tags in the
              source library before using it for validation.
            </p>
          ) : null}
        </FormSection>

        <FormSection heading="Where and what it touches">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date observed" required>
              <TextInput
                type="date"
                value={dateObserved}
                onChange={(e) => setDateObserved(e.target.value)}
              />
            </Field>
            <Field label="Event date" hint="When the event itself happened, if different.">
              <TextInput
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </Field>
            <Field label="Region">
              <Select value={region} onChange={(e) => setRegion(e.target.value as Region)}>
                {REGION_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Country" required>
              <TextInput
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. United Arab Emirates"
              />
            </Field>
            <Field label="City">
              <TextInput
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Optional"
              />
            </Field>
            <Field label="Actor involved">
              <TextInput
                value={actorInvolved}
                onChange={(e) => setActorInvolved(e.target.value)}
                placeholder="Who is acting — institution, brand, community…"
              />
            </Field>
          </div>
          <Field label="Sectors">
            <CheckboxList<Sector>
              options={SECTOR_OPTIONS}
              selected={sectors}
              onChange={setSectors}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Subsector">
              <TextInput
                value={subsector}
                onChange={(e) => setSubsector(e.target.value)}
                placeholder="Optional"
              />
            </Field>
          </div>
        </FormSection>

        <section className="mt-10">
          <div className="flex items-baseline justify-between gap-4">
            {viewMode === "simple" ? (
              <button
                type="button"
                onClick={() => setCriteriaOpen((o) => !o)}
                className="text-left text-[15px] font-medium text-ink hover:text-accent-ink"
                aria-expanded={criteriaOpen}
              >
                {criteriaOpen ? "▾" : "▸"} Optional: first-pass promotion criteria
              </button>
            ) : (
              <h2 className="text-[15px] font-medium text-ink">Promotion checklist</h2>
            )}
            <span
              className={`shrink-0 text-[12px] ${
                criteriaMet >= PROMOTION_MIN_CRITERIA
                  ? "text-accent-ink"
                  : "text-ink-faint"
              }`}
            >
              {criteriaMet}/{PROMOTION_CRITERIA.length} criteria
            </span>
          </div>
          {viewMode === "simple" && !criteriaOpen ? (
            <p className="mt-2 text-[12px] leading-relaxed text-ink-faint">
              You can save without touching this — the observation lands as
              unreviewed and is triaged on its detail page. Open the checklist to
              record a first pass on the {PROMOTION_CRITERIA.length} promotion
              criteria now.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              <CheckboxList<keyof PromotionChecklist>
                options={PROMOTION_CRITERIA.map((c) => ({
                  value: c.key,
                  label: c.label,
                }))}
                selected={PROMOTION_CRITERIA.filter((c) => checklist[c.key]).map(
                  (c) => c.key,
                )}
                onChange={(next) =>
                  setChecklist(
                    PROMOTION_CRITERIA.reduce(
                      (acc, c) => ({ ...acc, [c.key]: next.includes(c.key) }),
                      { ...EMPTY_CHECKLIST },
                    ),
                  )
                }
              />
              <p className="text-[11.5px] leading-relaxed text-ink-faint">
                Promotion to a signal requires at least {PROMOTION_MIN_CRITERIA} of{" "}
                {PROMOTION_CRITERIA.length} criteria. Ticking criteria here does not
                promote anything — the observation is saved as unreviewed and can only
                be promoted from its triage panel.
              </p>
            </div>
          )}
        </section>

        {errors.length > 0 ? (
          <div className="mt-10 border-l-2 border-tension pl-4">
            <p className="text-[13px] font-medium text-tension">Cannot save yet</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12.5px] text-ink-soft">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-10 flex items-center gap-4 pb-4">
          <button type="button" onClick={handleSave} className={btnPrimary}>
            Save observation
          </button>
          <Link href="/inbox" className={btnSecondary}>
            Cancel
          </Link>
          <p className="text-[11.5px] text-ink-faint">
            Saved observations enter the inbox as unreviewed.
          </p>
        </div>
      </div>
    </>
  );
}
