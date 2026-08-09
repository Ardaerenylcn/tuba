import { getHomePageData } from "@/lib/home-content";
import { getAllSiteContent } from "@/lib/site-content";
import { getHomepageReviews } from "@/lib/reviews";
import { HeroSection, CollectionsSection, AtolyeBizSection, TrustBadgesSection, NewsletterSection } from "@/components/home/home-sections";
import { ReviewsSection } from "@/components/storefront/reviews-section";

export default async function HomePage() {
  const [{ workshops, heroBanner, categories }, siteContent, reviews] = await Promise.all([
    getHomePageData(),
    getAllSiteContent(),
    getHomepageReviews(6),
  ]);

  return (
    <>
      <HeroSection config={heroBanner} infoBar={siteContent.hero_info_bar} />
      <AtolyeBizSection workshops={workshops} categories={categories} atolyeBizConfig={siteContent.atolye_biz} />
      <CollectionsSection config={siteContent.collections} />
      <ReviewsSection reviews={reviews} />
      <TrustBadgesSection config={siteContent.trust_badges} />
      <NewsletterSection config={siteContent.newsletter} />
    </>
  );
}
