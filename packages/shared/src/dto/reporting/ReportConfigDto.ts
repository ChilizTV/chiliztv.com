export interface ReportConfigDto {
    quorumPct: number;
    floorCount: number;
    minPresenceSec: number;
    banFirstHours: number;
    banSecondHours: number;
    bypassSeverityThreshold: number;
    /** ISO 8601 — present on admin reads, omitted on the public cached read. */
    updatedAt?: string;
}
