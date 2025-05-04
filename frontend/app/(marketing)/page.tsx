"use client";

import React, { useEffect } from "react";
import FeaturesSection from "./_components/FeaturesSection";
import Footer from "./_components/Footer";
import HeroSection from "./_components/HeroSection";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import Header from "./_components/Header";
function App() {
  const { status } = useAccount(),
    router = useRouter();
  useEffect(() => {
    status == "connected" ? router.push("/dash") : null;
  }, [status]);
  return (
    <div className="bg-gray-100 font-sans">
      <div>
        <Header />
      </div>
      <div>
        <HeroSection />
        <div id="continueReading">
          <FeaturesSection />
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default App;
