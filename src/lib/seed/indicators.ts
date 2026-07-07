/**
 * Demo monitoring indicators. Cadences and dateLastChecked values are set so
 * that two indicators (IND-003, IND-005) are overdue relative to their
 * cadence as of early July 2026 — the Management Center surfaces these.
 * Trends are deliberately mixed, including one contradictory and one
 * weakening reading, so monitoring reflects reality rather than momentum.
 */

import type { MonitoringIndicator } from "../types";

export const seedIndicators: MonitoringIndicator[] = [
  {
    id: "IND-001",
    name: "Long-term residency issuance and renewal composition",
    territoryId: "TER-001",
    driverId: "DRV-002",
    signalId: "SIG-003",
    indicatorType: "policy",
    description:
      "Tracks golden-visa and long-term residency issuance volumes, the family share of new issuance, and — once data exists — renewal rates at first expiry. Renewal behaviour is the single best test of whether paperwork permanence is becoming behavioural permanence.",
    currentStatus:
      "Issuance continues to grow with families taking a rising share of new grants; two emirates have signalled simplified renewal processes. No public renewal-rate series yet — the key datapoint remains unavailable.",
    evidence:
      "Official policy portal data (SRC-001) through Q2 2026; newspaper reporting on renewal-process changes (SRC-004) in May 2026.",
    dateLastChecked: "2026-06-18",
    trend: "strengthening",
    cadence: "quarterly",
    confidence: "high",
    notes:
      "Watch for the first published renewal cohort (earliest 10-year visas renew from 2029; 5-year categories sooner). If renewal data is withheld, treat opacity itself as a signal.",
    createdAt: "2026-02-22T10:00:00.000Z",
    updatedAt: "2026-06-18T09:30:00.000Z",
  },
  {
    id: "IND-002",
    name: "State capital allocations to culture, wellness and lifestyle infrastructure",
    territoryId: null,
    driverId: "DRV-002",
    signalId: "SIG-004",
    indicatorType: "investment",
    description:
      "Tracks budget announcements, sovereign-fund commitments and commissioning-calendar depth for cultural seasons, wellness assets and lifestyle infrastructure in Saudi Arabia and the UAE. Tests whether DRV-002's mechanism — state demand de-risking lifestyle sectors — persists through budget cycles.",
    currentStatus:
      "Cultural commissioning calendars for 2026–27 published at comparable or larger scale than the prior cycle; two new wellness-infrastructure commitments announced in H1 2026. No retrenchment signals despite softer oil prices in Q1.",
    evidence:
      "Programming calendars (SRC-014) June 2026; newspaper budget coverage (SRC-004); producer interview corroboration on commissioning depth (SRC-008).",
    dateLastChecked: "2026-06-28",
    trend: "strengthening",
    cadence: "monthly",
    confidence: "medium",
    notes:
      "The stress test arrives with the first multi-quarter oil-revenue squeeze. Distinguish announced from disbursed: calendars are commitments, not cash.",
    createdAt: "2026-02-25T11:15:00.000Z",
    updatedAt: "2026-06-28T10:05:00.000Z",
  },
  {
    id: "IND-003",
    name: "Transit ridership persistence through summer months",
    territoryId: "TER-001",
    driverId: null,
    signalId: "SIG-010",
    indicatorType: "behaviour",
    description:
      "Tracks Riyadh Metro and Dubai transit ridership with a specific focus on June–September retention: whether transit habits formed in mild months survive the heat, which is the difference between novelty adoption and structural behaviour change.",
    currentStatus:
      "At last check (early April), ridership was holding at winter levels with academic work confirming routine commuter adoption. The critical summer window is now open and unobserved — this indicator is overdue precisely when it matters most.",
    evidence:
      "Academic ridership study (SRC-010) covering data to February 2026; search-trend interest in station-adjacent housing (SRC-015) stable through March.",
    dateLastChecked: "2026-04-02",
    trend: "stable",
    cadence: "monthly",
    confidence: "medium",
    notes:
      "OVERDUE — monthly cadence, last checked 2026-04-02. Priority recheck: obtain June ridership before the July review. Summer retention above ~80% of spring levels would justify moving SIG-010's structural claims from probable to established.",
    createdAt: "2026-01-30T09:45:00.000Z",
    updatedAt: "2026-04-02T14:20:00.000Z",
  },
  {
    id: "IND-004",
    name: "Regional authorship share in cultural and commercial output",
    territoryId: "TER-001",
    driverId: null,
    signalId: "SIG-001",
    indicatorType: "cultural",
    description:
      "Composite watch on the regional-identity movement: count of active Gulf heritage-contemporary labels and stockists, share of major Gulf brand campaigns fronted by regional creators versus global celebrities, and Gulf-dialect share of top podcast charts. Measures whether contemporary regional authorship keeps gaining ground (CLU-001).",
    currentStatus:
      "All three components moved up over the last two checks: new label launches and stockists in spring 2026, continued regional-creator casting in Ramadan and summer campaigns, dialect shows holding chart dominance.",
    evidence:
      "Creator panel observation (SRC-006) and culture-press coverage (SRC-005) through May 2026; platform listening data (SRC-007) Q1 2026.",
    dateLastChecked: "2026-05-30",
    trend: "strengthening",
    cadence: "biannual",
    confidence: "medium",
    notes:
      "Guard against measuring visibility instead of economics: a label count is weaker evidence than sell-through or repeat purchase. Seek retail sales data as a fourth component.",
    createdAt: "2026-03-01T10:30:00.000Z",
    updatedAt: "2026-05-30T11:00:00.000Z",
  },
  {
    id: "IND-005",
    name: "Human-verification demand in automated services",
    territoryId: null,
    driverId: "DRV-001",
    signalId: "SIG-006",
    indicatorType: "contradiction",
    description:
      "Tracks the CON-001 tension directly: branch-appointment and human-escalation volumes at Gulf banks, complaint categories referencing automated decisions, and any regulator moves on explainability or recourse rights. Rising automation alongside rising verification demand keeps the contradiction live; either side collapsing resolves it.",
    currentStatus:
      "Mixed readings at last check: one bank reported falling escalations after deploying an explainable-decision interface, while survey verbatims and complaint reporting elsewhere continued to rise. The two sides of the contradiction are both strengthening — hence the contradictory trend flag.",
    evidence:
      "Investment-bank sector note (SRC-013) March 2026; youth survey wave (SRC-011) April 2026; desk synthesis memo (SRC-016).",
    dateLastChecked: "2026-06-05",
    trend: "contradictory",
    cadence: "weekly",
    confidence: "low",
    notes:
      "OVERDUE — weekly cadence, last checked 2026-06-05. The gap covers a month in which one regulator was expected to publish automated-decision recourse guidance; check before the next driver review of DRV-001.",
    createdAt: "2026-03-28T09:00:00.000Z",
    updatedAt: "2026-06-05T15:40:00.000Z",
  },
  {
    id: "IND-006",
    name: "Wellness-residence premium in resale transactions",
    territoryId: "TER-001",
    driverId: null,
    signalId: "SIG-011",
    indicatorType: "consumer",
    description:
      "Tests SIG-011's developer-claimed premiums against the only data that matters: resale. Tracks resale price gaps between wellness-branded and comparable unbranded units, days-on-market, and whether search interest converts into transaction volume.",
    currentStatus:
      "Early resale evidence is unflattering: the small number of wellness-branded units resold in Q2 2026 achieved premiums well below launch-marketing claims, and days-on-market matched unbranded comparables. Launch-phase interest is not yet holding value — trend marked weakening.",
    evidence:
      "Search-trend interest plateauing since April (SRC-015); resale observations compiled in desk memo from portal listings, June 2026 (SRC-016).",
    dateLastChecked: "2026-06-25",
    trend: "weakening",
    cadence: "quarterly",
    confidence: "low",
    notes:
      "Small sample — a handful of resales cannot yet kill the thesis. But if the premium is still absent after two more quarters, SIG-011 should be re-scored and the AI-drafted framing revised. This indicator exists to keep an attractive narrative honest.",
    createdAt: "2026-05-25T10:15:00.000Z",
    updatedAt: "2026-06-25T09:50:00.000Z",
  },
];
