/** Hot-reloadable moderation thresholds (singleton row `report_config`). */
export interface ReportConfig {
    quorumPct: number;
    floorCount: number;
    minPresenceSec: number;
    banFirstHours: number;
    banSecondHours: number;
    bypassSeverityThreshold: number;
}
