import { SiteNavbar } from "@/components/layout/site-navbar";
import { LandingPage } from "@/features/landing/components/landing-page";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <SiteNavbar />
      <LandingPage />
    </div>
  );
}
