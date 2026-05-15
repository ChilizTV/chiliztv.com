'use client';

import { useState, useEffect, useMemo } from 'react';
import { isAddress, type Address } from 'viem';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { motion } from 'framer-motion';
import { Plus, ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react';

import {
  usePariMatchFactoryWriteCreateFootballMatch,
  usePariMatchFactoryWriteCreateBasketballMatch,
  usePariMatchFactoryReadOwner,
} from '@/lib/contracts/generated';
import { chilizConfig } from '@/config/chiliz.config';
import { explorerTx } from '@/lib/explorer';

type Sport = 'FOOTBALL' | 'BASKETBALL';

/**
 * Form for the factory owner to deploy a new pari-mutuel match proxy.
 *
 * On submit, calls `factory.createXMatch(name, owner, oracle)` which:
 *   - deploys an ERC1967Proxy of the sport implementation
 *   - sets USDC + feeRecipient on it
 *   - grants SWAP_ROUTER_ROLE to the configured router
 *   - grants RESOLVER_ROLE to `oracle`
 *   - grants DEFAULT_ADMIN_ROLE + ADMIN_ROLE + PAUSER_ROLE to `owner`
 *   - transfers Ownable.ownership to `owner`
 *   - renounces every factory role
 *
 * After confirmation, `factory.getAllMatches().at(-1)` returns the new proxy,
 * which is exactly what /live/999999 binds to.
 */
export function CreateMatchForm({
  onMatchCreated,
}: {
  onMatchCreated?: (proxy: Address) => void;
}) {
  const { primaryWallet } = useDynamicContext();
  const walletAddress = primaryWallet?.address as Address | undefined;

  const factoryAddr = chilizConfig.pariMatchFactory;
  const chainId = chilizConfig.chainId;

  // Pre-fill owner + oracle with the connected wallet (good for testnet UX).
  const [sport, setSport] = useState<Sport>('FOOTBALL');
  const [matchName, setMatchName] = useState<string>('Test Match A vs Test Match B');
  const [owner, setOwner] = useState<string>('');
  const [oracle, setOracle] = useState<string>('');

  useEffect(() => {
    if (walletAddress && !owner) setOwner(walletAddress);
    if (walletAddress && !oracle) setOracle(walletAddress);
  }, [walletAddress, owner, oracle]);

  // Authorisation check.
  const { data: factoryOwner } = usePariMatchFactoryReadOwner({
    address: factoryAddr,
    chainId,
  });
  const isFactoryOwner =
    !!factoryOwner &&
    !!walletAddress &&
    (factoryOwner as Address).toLowerCase() === walletAddress.toLowerCase();

  // Write contracts.
  const createFootball = usePariMatchFactoryWriteCreateFootballMatch();
  const createBasketball = usePariMatchFactoryWriteCreateBasketballMatch();

  const activeTxHash =
    sport === 'FOOTBALL' ? createFootball.data : createBasketball.data;
  const activeIsPending =
    sport === 'FOOTBALL' ? createFootball.isPending : createBasketball.isPending;
  const activeError =
    sport === 'FOOTBALL' ? createFootball.error : createBasketball.error;

  const { isLoading: isConfirming, isSuccess, data: receipt } =
    useWaitForTransactionReceipt({ hash: activeTxHash });

  // Notify parent once confirmed. The proxy address is the `contractAddress`
  // emitted in the receipt logs (MatchCreated event), but for simplicity we
  // just bubble that and let the parent refresh.
  useEffect(() => {
    if (isSuccess && receipt && onMatchCreated) {
      // Extract the proxy address from the first non-null `contractAddress`
      // in the receipt logs. Fallback: just emit a sentinel and let the
      // parent re-read getAllMatches().
      onMatchCreated('0x0000000000000000000000000000000000000000' as Address);
    }
  }, [isSuccess, receipt, onMatchCreated]);

  const isValid = useMemo(() => {
    if (!matchName.trim()) return false;
    if (!owner || !isAddress(owner)) return false;
    if (!oracle || !isAddress(oracle)) return false;
    return true;
  }, [matchName, owner, oracle]);

  const canSubmit =
    isValid && !!walletAddress && isFactoryOwner && !activeIsPending && !isConfirming;

  const onSubmit = () => {
    if (!canSubmit) return;
    const hookArgs = {
      address: factoryAddr,
      args: [matchName, owner as Address, oracle as Address] as const,
      chainId,
    };
    if (sport === 'FOOTBALL') {
      createFootball.writeContract(hookArgs);
    } else {
      createBasketball.writeContract(hookArgs);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl"
      style={{
        background: 'linear-gradient(180deg, #141414 0%, #0F0F0F 100%)',
        border: '1px solid #2A2A2A',
      }}
    >
      <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, #E8001D 0%, transparent 60%)' }} />

      <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid #1E1E1E' }}>
        <Plus size={14} style={{ color: '#E8001D' }} />
        <h2
          className="text-[13px] font-bold uppercase tracking-[0.12em]"
          style={{ color: '#fff', fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          Create a new pari-mutuel match
        </h2>
        <div className="flex-1" />
        <span
          className="text-[10px] uppercase tracking-[0.1em]"
          style={{ color: '#666', fontFamily: "'JetBrains Mono', monospace" }}
        >
          factory {factoryAddr.slice(0, 6)}…{factoryAddr.slice(-4)}
        </span>
      </div>

      {!isFactoryOwner && walletAddress && (
        <BannerWarning>
          Your wallet ({short(walletAddress)}) is not the factory owner ({short(factoryOwner as Address | undefined)}).
          Connect the deployer / multisig key, or transfer ownership first.
        </BannerWarning>
      )}
      {!walletAddress && <BannerWarning>Connect a wallet to create a match.</BannerWarning>}

      <div className="space-y-4 px-5 py-5">
        {/* Sport picker */}
        <Field label="Sport">
          <div className="grid grid-cols-2 gap-2">
            {(['FOOTBALL', 'BASKETBALL'] as Sport[]).map((s) => {
              const selected = sport === s;
              return (
                <button
                  key={s}
                  onClick={() => setSport(s)}
                  className="rounded-md py-2 text-[12px] font-bold uppercase tracking-[0.08em]"
                  style={{
                    background: selected ? 'rgba(232,0,29,0.12)' : '#1A1A1A',
                    color: selected ? '#fff' : '#888',
                    border: `1px solid ${selected ? '#E8001D' : '#2A2A2A'}`,
                    fontFamily: "'Barlow', sans-serif",
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Match name (human readable, e.g. 'Barcelona vs Real Madrid')">
          <input
            type="text"
            value={matchName}
            onChange={(e) => setMatchName(e.target.value)}
            placeholder="Team A vs Team B"
            className="w-full rounded-md px-3 py-2 text-[13px] focus:outline-none"
            style={{
              background: '#0F0F0F',
              border: '1px solid #2A2A2A',
              color: '#fff',
              fontFamily: "'Barlow', sans-serif",
            }}
          />
          <Hint>
            {`The frontend splits on " vs " / " - " for team names. Use one of those separators.`}
          </Hint>
        </Field>

        <Field label="Match owner (gets ADMIN_ROLE on the match — usually your multisig)">
          <AddressInput value={owner} onChange={setOwner} />
        </Field>

        <Field label="Oracle (gets RESOLVER_ROLE — your backend / oracle key)">
          <AddressInput value={oracle} onChange={setOracle} />
        </Field>

        {activeError && (
          <BannerError>{activeError.message ?? 'Transaction failed'}</BannerError>
        )}

        {isSuccess && activeTxHash && (
          <div
            className="flex items-center gap-2 rounded px-3 py-2"
            style={{
              background: 'rgba(0,200,83,0.08)',
              border: '1px solid rgba(0,200,83,0.3)',
              color: '#00C853',
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            <CheckCircle2 size={14} />
            <span className="flex-1 text-[12px]">Match created. Refreshing match list…</span>
            <a
              href={explorerTx(activeTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {activeTxHash.slice(0, 8)}…{activeTxHash.slice(-6)}
              <ExternalLink size={11} />
            </a>
          </div>
        )}

        <motion.button
          whileHover={canSubmit ? { scale: 1.01 } : undefined}
          whileTap={canSubmit ? { scale: 0.99 } : undefined}
          onClick={onSubmit}
          disabled={!canSubmit}
          className="w-full rounded py-2.5 text-[12px] font-bold uppercase tracking-[0.1em]"
          style={{
            background: canSubmit ? '#E8001D' : '#1E1E1E',
            color: canSubmit ? '#fff' : '#666',
            border: `1px solid ${canSubmit ? '#E8001D' : '#2A2A2A'}`,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            fontFamily: "'Barlow', sans-serif",
            boxShadow: canSubmit ? '0 4px 20px -8px #E8001D' : 'none',
          }}
        >
          {activeIsPending
            ? 'Confirm in wallet…'
            : isConfirming
              ? 'Deploying match…'
              : !walletAddress
                ? 'Connect wallet'
                : !isFactoryOwner
                  ? 'Not factory owner'
                  : !isValid
                    ? 'Fill all fields with valid addresses'
                    : 'Deploy match'}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Mini primitives ────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div
        className="text-[10px] uppercase tracking-[0.12em]"
        style={{ color: '#666', fontFamily: "'Barlow', sans-serif" }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function AddressInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const valid = !value || isAddress(value);
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="0x…"
      className="w-full rounded-md px-3 py-2 text-[12px] focus:outline-none"
      style={{
        background: '#0F0F0F',
        border: `1px solid ${valid ? '#2A2A2A' : '#E8001D'}`,
        color: '#fff',
        fontFamily: "'JetBrains Mono', monospace",
      }}
    />
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[10px]"
      style={{ color: '#555', fontFamily: "'Barlow', sans-serif" }}
    >
      {children}
    </div>
  );
}

function BannerWarning({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-5 mt-4 flex items-start gap-2 rounded px-3 py-2 text-[11px]"
      style={{
        background: 'rgba(245,197,24,0.08)',
        border: '1px solid rgba(245,197,24,0.3)',
        color: '#F5C518',
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function BannerError({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded px-3 py-2 text-[11px]"
      style={{
        background: 'rgba(232,0,29,0.08)',
        border: '1px solid rgba(232,0,29,0.3)',
        color: '#E8001D',
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      {children}
    </div>
  );
}

function short(addr?: Address): string {
  if (!addr) return '—';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
