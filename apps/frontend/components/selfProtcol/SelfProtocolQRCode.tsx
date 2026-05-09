"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SelfQRcodeWrapper, SelfAppBuilder } from "@selfxyz/qrcode";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { countries } from "@selfxyz/core";

interface SelfProtocolQRCodeProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function SelfProtocolQRCode({
  onClose,
  onSuccess,
}: Readonly<SelfProtocolQRCodeProps>) {

  const { primaryWallet } = useDynamicContext();
  const userId = primaryWallet?.address ?? "";

  // Portal target — only available client-side, after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleClose = () => {
    onClose?.();
  };

  const handleSuccessfulVerification = () => {
    onSuccess?.();
    handleClose();
  };

  // Build the Self Protocol app instance
  const selfApp = new SelfAppBuilder({
    version: 2,
    appName: "ChilizTV",
    scope: "chiliztv",
    logoBase64: "https://chiliztv.com//Logo_FINAL.svg",
    endpoint: "https://chiliztv.com/api/verifier",
    endpointType: "staging_https",
    userId,
    userIdType: "hex",
    disclosures: {
      minimumAge: 18,
      excludedCountries: [countries.FRANCE, countries.IRAN, countries.NORTH_KOREA],
      ofac: true,
      name: true,
      nationality: true,
    },
    devMode: true,
    userDefinedData: JSON.stringify({
      walletAddress: userId ?? "",
    }),
  }).build();

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 max-w-md w-full relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center">
          Verify Your Identity
        </h2>

        {selfApp ? (
          <SelfQRcodeWrapper
            selfApp={selfApp}
            onSuccess={handleSuccessfulVerification}
            darkMode={true}
            onError={() => {
              console.error("Error: Failed to verify identity");
            }}
          />
        ) : (
          <div className="w-[280px] h-[280px] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex items-center justify-center mx-auto">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Loading QR Code...
            </p>
          </div>
        )}

        <p className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm">
          Scan the QR code with the Self Protocol app to verify your identity securely.
        </p>

        <p className="mt-2 text-center text-gray-500 dark:text-gray-500 text-xs">
          Identity verification is required to comply with international regulations, prevent fraud,
          and ensure that rewards are only withdrawn by eligible users. Your information remains private
          and secure.
        </p>
      </div>
    </div>,
    document.body,
  );
}
