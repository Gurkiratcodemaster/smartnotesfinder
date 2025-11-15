import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FeatureSection from "./components/FeatureSection";
import UploadBox from "./components/UploadBox";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-primary-bg">
      <Navbar />
      <HeroSection />
      <FeatureSection />
      <div className="py-16">
        <UploadBox />
      </div>
    </div>
  );
}
