'use client';

import { useState, type FormEvent } from 'react';
import { LBI } from '../primitives/icons';
import { PrimaryBtn, PulseDot } from '../primitives';

/**
 * Email signup — purely client-side until the backend wires an actual
 * mailing list endpoint. Validates with `includes('@')` + length, shakes
 * the form on invalid submit, swaps to a confirmation tile on success.
 */
export function NotifyForm() {
    const [email, setEmail] = useState('');
    const [done, setDone] = useState(false);
    const [shake, setShake] = useState(false);

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!email.includes('@') || email.length < 5) {
            setShake(true);
            window.setTimeout(() => setShake(false), 350);
            return;
        }
        setDone(true);
    }

    if (done) {
        return (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="font-mono-ctv flex items-center gap-3 rounded-md border border-[#2dd4a4]/30 bg-[#2dd4a4]/[0.06] px-5 py-4 text-[12px] uppercase tracking-[0.14em] text-[#2dd4a4]">
                    <PulseDot color="#2dd4a4" />
                    You&apos;re on the list — we&apos;ll ping you on day one.
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setDone(false);
                        setEmail('');
                    }}
                    className="font-mono-ctv text-[10px] uppercase tracking-[0.16em] text-white/45 hover:text-white"
                >
                    Add another →
                </button>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={`flex flex-col gap-3 sm:flex-row sm:items-stretch ${shake ? 'lb-shake' : ''}`}
        >
            <label className="sr-only" htmlFor="lb-notify-email">
                Email
            </label>
            <input
                id="lb-notify-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOU@EXAMPLE.COM"
                className="font-mono-ctv flex-1 rounded-md border border-[#2A2A2A] bg-[#111] px-5 py-4 text-[14px] tracking-[0.04em] text-white placeholder:uppercase placeholder:tracking-[0.18em] placeholder:text-white/30 focus:border-[#E8001D] focus:outline-none"
            />
            <PrimaryBtn type="submit">Notify me {LBI.arrowRight}</PrimaryBtn>
        </form>
    );
}
