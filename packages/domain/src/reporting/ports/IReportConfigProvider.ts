import type { ReportConfig } from '../value-objects/ReportConfig';

export interface IReportConfigProvider {
    /** Cached read (Redis TTL ~30s); cache is invalidated on config update. */
    get(): Promise<ReportConfig>;
}
