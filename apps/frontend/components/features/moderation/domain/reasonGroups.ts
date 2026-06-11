import {
  REPORT_REASON_CODES,
  REASON_SEVERITY,
  type ReportReasonCode,
} from '@chiliztv/shared';

export const REASON_LABELS: Record<ReportReasonCode, string> = {
  spam: 'Spam',
  harassment: 'Harassment',
  hate_speech: 'Hate speech',
  violence: 'Violence',
  sexual_content: 'Sexual content',
  child_safety: 'Child safety',
  illegal_content: 'Illegal content',
  scam: 'Scam / fraud',
  off_topic: 'Off topic',
  other: 'Other',
};

/** Short, plain-language helper per reason — no jargon. */
export const REASON_HINTS: Record<ReportReasonCode, string> = {
  child_safety: 'Content endangering a minor',
  illegal_content: 'Illegal goods, services or acts',
  violence: 'Threats or graphic violence',
  hate_speech: 'Attacks on a protected group',
  sexual_content: 'Explicit or non-consensual sexual content',
  harassment: 'Targeted abuse or bullying',
  scam: 'Fraud, phishing or impersonation',
  spam: 'Repetitive or unsolicited content',
  off_topic: 'Not relevant to this room',
  other: 'Something else',
};

export type ReasonGroupTone = 'severe' | 'mid' | 'low';

export interface ReasonGroupDef {
  id: string;
  title: string;
  caption: string;
  tone: ReasonGroupTone;
  codes: ReportReasonCode[];
}

/** Severity ≥ 4 triggers the DSA fast-path (immediate action possible). */
export function isSevere(code: ReportReasonCode): boolean {
  return REASON_SEVERITY[code] >= 4;
}

function codesWhere(pred: (severity: number) => boolean): ReportReasonCode[] {
  return REPORT_REASON_CODES
    .filter((c) => pred(REASON_SEVERITY[c]))
    .sort((a, b) => REASON_SEVERITY[b] - REASON_SEVERITY[a]);
}

/**
 * Groups are DERIVED from the shared severity taxonomy so a future severity
 * change re-sorts the dialog automatically — never hardcode memberships.
 */
export const REASON_GROUPS: ReasonGroupDef[] = [
  {
    id: 'safety',
    title: 'Illegal & safety',
    caption: 'Actioned on sight',
    tone: 'severe',
    codes: codesWhere((s) => s >= 4),
  },
  {
    id: 'behaviour',
    title: 'Behaviour',
    caption: 'Community review',
    tone: 'mid',
    codes: codesWhere((s) => s >= 2 && s <= 3),
  },
  {
    id: 'other',
    title: 'Other',
    caption: 'Lowest priority',
    tone: 'low',
    codes: codesWhere((s) => s === 1),
  },
];

export function groupForReason(code: ReportReasonCode): ReasonGroupDef | undefined {
  return REASON_GROUPS.find((g) => g.codes.includes(code));
}
