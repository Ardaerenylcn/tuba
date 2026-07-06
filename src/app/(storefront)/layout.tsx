import type { ReactNode } from "react";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { WhatsAppButton } from "@/components/storefront/whatsapp-button";
import { getAllSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  const siteContent = await getAllSiteContent();
  const announcement = siteContent.announcement_bar;

  return (
    <>
      <SiteHeader announcement={announcement} />
      {/* pt accounts for announcement bar (40px) + header nav (64px) = 104px, or just nav (64px) when bar hidden */}
      <main className={`flex-1 ${announcement.visible ? "pt-[104px]" : "pt-[64px]"}`}>
        {children}
      </main>
      <SiteFooter />
      <WhatsAppButton />
    </>
  );
}
