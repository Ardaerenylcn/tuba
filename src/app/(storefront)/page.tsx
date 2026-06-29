import { getHomePageData } from "@/lib/home-content";
import {
  HeroSection,
  MarqueeStrip,
  StatsSection,
  ProcessSection,
  WorkshopsSection,
  StorySection,
  CertificatesSection,
  CTASection,
} from "@/components/home/home-sections";

export default async function HomePage() {
  const { workshops, certificates } = await getHomePageData();

  return (
    <>
      {/* -mt-16 pulls the hero back under the fixed header */}
      <div className="-mt-16">
        <HeroSection />
      </div>
      <MarqueeStrip />
      <StatsSection />
      <ProcessSection />
      <WorkshopsSection workshops={workshops} />
      <StorySection />
      <CertificatesSection certificates={certificates} />
      <CTASection />
    </>
  );
}
