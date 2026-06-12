"use client";

import * as React from "react";
import { Toaster } from "sonner";
import DynamicProviderWrapper from "./DynamicProviderWrapper";
import QueryProvider from "./QueryProvider";

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <QueryProvider>
      <DynamicProviderWrapper>
        {children}
        <Toaster richColors position="bottom-right" theme="dark" />
      </DynamicProviderWrapper>
    </QueryProvider>
  );
}
