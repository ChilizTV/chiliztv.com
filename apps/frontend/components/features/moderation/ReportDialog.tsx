'use client';

import { useRef, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Dialog, DialogContent } from '@chiliztv/ui';
import { toast } from 'sonner';

import type { ReportReasonCode, ReportTargetType } from '@chiliztv/shared';

import { useCreateReport } from '@/hooks/api/useCreateReport';
import { REASON_GROUPS } from './domain/reasonGroups';
import { ReasonGroup } from './ReasonGroup';
import { ConfirmStep } from './ConfirmStep';
import { ReportDialogHeader } from './ReportDialogHeader';

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  liveContextMatchId?: number;
  liveContextStreamId?: string;
}

/**
 * Two-step report flow: severity-grouped reason picker → review & confirm
 * (consequence note for fast-path reasons + optional details). Desktop is a
 * centered card, small viewports get a bottom sheet — same content shell.
 */
export function ReportDialog({
  open,
  onClose,
  targetType,
  targetId,
  liveContextMatchId,
  liveContextStreamId,
}: ReportDialogProps) {
  const [step, setStep] = useState<0 | 1>(0);
  const [direction, setDirection] = useState<'r' | 'l'>('r');
  const [reason, setReason] = useState<ReportReasonCode | null>(null);
  const [freeText, setFreeText] = useState('');
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const { mutateAsync: createReport, isPending } = useCreateReport();

  const reset = () => {
    setStep(0);
    setDirection('r');
    setReason(null);
    setFreeText('');
  };

  const close = () => {
    reset();
    onClose();
  };

  const goNext = () => {
    if (!reason) return;
    setDirection('r');
    setStep(1);
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  };

  const goBack = () => {
    setDirection('l');
    setStep(0);
  };

  const handleSubmit = async () => {
    if (!reason || isPending) return;
    try {
      await createReport({
        targetType,
        targetId,
        reasonCode: reason,
        reasonFreeText: freeText.trim() || undefined,
        liveContextMatchId,
        liveContextStreamId,
      });
      toast.success('Report submitted', {
        description: 'Thanks — the community review threshold applies.',
      });
      close();
    } catch (err: unknown) {
      const apiError = (err as {
        response?: { data?: { error?: { code?: string; details?: { reason?: string } } } };
      })?.response?.data?.error;
      const code = apiError?.code;
      const errorReason = apiError?.details?.reason;

      if (code === 'CONFLICT') {
        toast.info('You already reported this');
        close();
        return;
      }
      if (code === 'ACCOUNT_BANNED') {
        toast.error('Your account is restricted');
        return;
      }
      if (code === 'BUSINESS_RULE_VIOLATION') {
        const copy: Record<string, { title: string; description?: string }> = {
          self_report: { title: "You can't report your own content" },
          streamer: { title: "Streamers can't report inside their own live" },
          banned: { title: 'Your account is restricted' },
          not_eligible: {
            title: 'Not eligible to report yet',
            description: 'Stay in the room a little longer, or place a first bet.',
          },
        };
        const c = copy[errorReason ?? ''] ?? { title: 'This report is not allowed' };
        toast.warning(c.title, c.description ? { description: c.description } : undefined);
        return;
      }
      toast.error('Could not submit the report', { description: 'Please try again.' });
    }
  };

  const stepClass = direction === 'r' ? 'ctv-step-r' : 'ctv-step-l';
  const footerBtn =
    'font-mono-ctv rounded-md px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]';

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close(); }}>
      <DialogContent
        showCloseButton={false}
        className="bottom-0 left-0 top-auto w-full max-w-full translate-x-0 translate-y-0 gap-0 rounded-t-2xl rounded-b-none border-[#1E1E1E] bg-[#0A0A0A] p-0 sm:bottom-auto sm:left-[50%] sm:top-[50%] sm:max-w-[400px] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-2xl"
      >
        <div aria-hidden className="flex justify-center pb-0.5 pt-2.5 sm:hidden">
          <span className="h-1 w-9 rounded-full bg-white/15" />
        </div>

        <ReportDialogHeader step={step} targetType={targetType} onClose={close} />

        <div ref={bodyRef} className="max-h-[62dvh] overflow-y-auto overscroll-contain px-4 py-4 sm:max-h-[52dvh]">
          {step === 0 ? (
            <div key="s0" className={`${stepClass} flex flex-col gap-2.5`}>
              <p className="px-1 pb-1 text-[12px] leading-snug text-white/45">
                Pick the closest reason. Grouped by how fast moderation acts.
              </p>
              <div role="radiogroup" aria-label="Report reason" className="flex flex-col gap-2.5">
                {REASON_GROUPS.map((g) => (
                  <ReasonGroup key={g.id} group={g} reason={reason} onSelect={setReason} />
                ))}
              </div>
            </div>
          ) : (
            <div key="s1" className={stepClass}>
              {reason && (
                <ConfirmStep reason={reason} freeText={freeText} onFreeTextChange={setFreeText} />
              )}
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-[#1E1E1E] bg-[#111] px-5 py-3.5">
          {step === 0 ? (
            <button type="button" onClick={close} className={`${footerBtn} border border-[#2A2A2A] text-white/55 hover:border-[#3A3A3A] hover:text-white/80`}>
              Cancel
            </button>
          ) : (
            <button type="button" onClick={goBack} className={`${footerBtn} inline-flex items-center gap-1.5 border border-[#2A2A2A] text-white/55 hover:border-[#3A3A3A] hover:text-white/80`}>
              <ChevronLeft size={13} /> Back
            </button>
          )}
          {step === 0 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!reason}
              className={`${footerBtn} bg-[#E8001D] px-5 text-white hover:bg-[#FF1737] disabled:cursor-not-allowed disabled:bg-[#2A2A2A] disabled:text-white/30`}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className={`${footerBtn} inline-flex items-center gap-2 bg-[#E8001D] px-5 text-white hover:bg-[#FF1737] disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {isPending && (
                <span aria-hidden className="block h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {isPending ? 'Sending…' : 'Submit report'}
            </button>
          )}
        </footer>
      </DialogContent>
    </Dialog>
  );
}
