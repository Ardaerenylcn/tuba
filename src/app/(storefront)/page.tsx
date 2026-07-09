import { getHomePageData } from "@/lib/home-content";
import { getAllSiteContent } from "@/lib/site-content";
import { HeroSection, CollectionsSection, AtolyeBizSection, TrustBadgesSection, NewsletterSection } from "@/components/home/home-sections";

export default async function HomePage() {
  const [{ workshops, heroBanner, categories }, siteContent] = await Promise.all([
    getHomePageData(),
    getAllSiteContent(),
  ]);

  return (
    <>
      <HeroSection config={heroBanner} />
      <AtolyeBizSection workshops={workshops} categories={categories} atolyeBizConfig={siteContent.atolye_biz} />
      <CollectionsSection config={siteContent.collections} />
      <TrustBadgesSection config={siteContent.trust_badges} />
      <NewsletterSection config={siteContent.newsletter} />
    </>
  );
}
