export type JobHandler = () => Promise<void>;

export interface ISchedulerService {
  scheduleRecurring(name: string, cronExpression: string, handler: JobHandler): void;
  scheduleInterval(name: string, intervalMs: number, handler: JobHandler): void;
  start(): void;
  stop(): void;
}
