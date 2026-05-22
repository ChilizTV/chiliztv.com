/**
 * Snapshot of the post-deploy wiring problems detected on a freshly-created
 * PariMatch proxy. Each entry corresponds to a setter or grantRole call
 * that should have been made by the deployer.
 *
 * The indexer never auto-corrects — it just records, so an ops dashboard
 * (or a future cron) can drive the remediation.
 */
export type WiringStep =
    | 'setUSDCToken'
    | 'setFeeRecipient'
    | 'grantRole.SWAP_ROUTER_ROLE'
    | 'grantRole.RESOLVER_ROLE';

export interface WiringAlert {
    readonly matchAddress: string;
    readonly missingSteps: ReadonlyArray<WiringStep>;
    readonly detectedAt: Date;
    readonly resolvedAt: Date | null;
}
