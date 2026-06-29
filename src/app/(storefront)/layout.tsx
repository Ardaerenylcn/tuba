import type { ReactNode } from "react";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { WhatsAppButton } from "@/components/storefront/whatsapp-button";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 pt-16">{children}</main>
      <SiteFooter />
      <WhatsAppButton />
    </>
  );
}
