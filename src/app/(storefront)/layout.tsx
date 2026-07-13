import type { ReactNode } from "react";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { WhatsAppButton } from "@/components/storefront/whatsapp-button";
import { getAllSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  const siteContent = await getAllSiteContent();
  const announcement = siteContent.announcement_bar;
  const logoUrl = siteContent.logo.imageUrl ?? null;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-[var(--text-primary)] focus:px-4 focus:py-2 focus:text-sm focus:text-[var(--surface)]"
      >
        İçeriğe geç
      </a>
      <SiteHeader announcement={announcement} logoUrl={logoUrl} />
      {/* pt accounts for announcement bar (40px) + header nav (64px) = 104px, or just nav (64px) when bar hidden */}
      <main id="main" className={`flex-1 ${announcement.visible ? "pt-[104px]" : "pt-[64px]"}`}>
        {children}
      </main>
      <SiteFooter />
      <WhatsAppButton />
    </>
  );
}
