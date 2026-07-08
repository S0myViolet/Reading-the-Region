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
      "We track how many golden visas and long-term residencies are issued, what share goes to families, and — once data exists — how many are renewed at first expiry. Renewal is the best single test of whether people who can stay actually do stay.",
    currentStatus:
      "Since the last check, issuance kept growing and families took a larger share of new grants. Two emirates signalled simpler renewal processes. No renewal-rate series has been published yet, so the key number is still missing.",
    evidence:
      "Official policy portal data through Q2 2026 (SRC-001) shows the issuance growth and rising family share directly; May 2026 newspaper reporting (SRC-004) corroborates the renewal-process changes.",
    dateLastChecked: "2026-06-18",
    trend: "strengthening",
    cadence: "quarterly",
    confidence: "high",
    notes:
      "Watch for the first published renewal cohort (earliest 10-year visas renew from 2029; 5-year categories sooner). If renewal data is withheld, treat that opacity itself as a signal.",
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
      "We track government budgets, sovereign-fund commitments and commissioning calendars for culture, wellness and lifestyle projects in Saudi Arabia and the UAE. This tests whether state spending keeps de-risking these sectors (DRV-002) through budget cycles.",
    currentStatus:
      "Since the last check, the 2026–27 cultural calendars were published at the same or larger scale than the previous cycle. Two new wellness-infrastructure commitments were announced in the first half of 2026. Softer oil prices in Q1 produced no sign of pull-back.",
    evidence:
      "Published programming calendars (SRC-014, June 2026) show the commissioning scale directly; newspaper budget coverage (SRC-004) confirms the funding behind it, and a producer interview (SRC-008) corroborates that the commissioning depth is real, not just announced.",
    dateLastChecked: "2026-06-28",
    trend: "strengthening",
    cadence: "monthly",
    confidence: "medium",
    notes:
      "The real stress test comes with the first multi-quarter oil-revenue squeeze. Distinguish announced from disbursed: calendars are commitments, not cash.",
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
      "We track Riyadh Metro and Dubai transit ridership through June–September. If riding habits formed in mild months survive the summer heat, transit has become a real daily routine rather than a novelty.",
    currentStatus:
      "At the last check in early April, ridership was still at winter levels, and an academic study confirmed routine commuter use. The critical summer window has since opened unobserved, so this indicator is overdue exactly when it matters most.",
    evidence:
      "An academic ridership study (SRC-010) with data to February 2026 shows commuting has become routine; stable search interest in station-adjacent housing through March (SRC-015) suggests people are organising where they live around transit.",
    dateLastChecked: "2026-04-02",
    trend: "stable",
    cadence: "monthly",
    confidence: "medium",
    notes:
      "OVERDUE — monthly cadence, last checked 2026-04-02. Priority recheck: obtain June ridership before the July review. If summer ridership holds above roughly 80% of spring levels, SIG-010's structural claims can move from probable to established.",
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
      "We track three things: how many Gulf heritage-contemporary labels are active and stocked, what share of major Gulf campaigns is fronted by regional creators rather than global celebrities, and the Gulf-dialect share of top podcast charts. Together they show whether regional creative voices keep gaining ground (CLU-001).",
    currentStatus:
      "All three measures rose over the last two checks. New labels launched and found stockists in spring 2026, Ramadan and summer campaigns kept casting regional creators, and dialect shows held their dominance of the podcast charts.",
    evidence:
      "Creator panel observation (SRC-006) and culture-press coverage (SRC-005) through May 2026 document the label launches and campaign casting; platform listening data for Q1 2026 (SRC-007) confirms the dialect share of the charts.",
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
      "We track whether bank customers keep demanding human contact as services automate: branch-appointment and human-escalation volumes at Gulf banks, complaints about automated decisions, and any regulator moves on explainability or appeal rights. If automation and verification demand both keep rising, the tension (CON-001) stays live; if either side collapses, it resolves.",
    currentStatus:
      "The last check produced mixed readings. One bank reported fewer escalations after launching an interface that explains its decisions. Elsewhere, survey comments and complaint reports kept rising. Both sides of the tension strengthened at once, which is why the trend is flagged contradictory.",
    evidence:
      "An investment-bank sector note (SRC-013, March 2026) documents the falling escalations at one bank; the April 2026 youth survey wave (SRC-011) and the desk synthesis memo (SRC-016) show verification demand still rising elsewhere.",
    dateLastChecked: "2026-06-05",
    trend: "contradictory",
    cadence: "weekly",
    confidence: "low",
    notes:
      "OVERDUE — weekly cadence, last checked 2026-06-05. The gap covers a month in which one regulator was expected to publish guidance on appealing automated decisions; check before the next review of DRV-001.",
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
      "We test whether wellness-branded homes really command the premiums developers claim (SIG-011), using the only data that settles it: resale. We track resale price gaps against comparable unbranded units, days on market, and whether search interest turns into actual sales.",
    currentStatus:
      "Early resale evidence is unflattering. The few wellness-branded units resold in Q2 2026 achieved premiums well below the launch-marketing claims, and they took as long to sell as unbranded comparables. Launch interest is not holding value, so the trend is marked weakening.",
    evidence:
      "Search interest has plateaued since April (SRC-015), which suggests demand is cooling; resale observations compiled from portal listings in June 2026 (SRC-016) show the gap between claimed and achieved premiums directly.",
    dateLastChecked: "2026-06-25",
    trend: "weakening",
    cadence: "quarterly",
    confidence: "low",
    notes:
      "Small sample — a handful of resales cannot yet kill the thesis. But if the premium is still absent after two more quarters, SIG-011 should be re-scored and its AI-drafted framing revised. This indicator exists to keep an attractive narrative honest.",
    createdAt: "2026-05-25T10:15:00.000Z",
    updatedAt: "2026-06-25T09:50:00.000Z",
  },
];
