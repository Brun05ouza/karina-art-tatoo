import { useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { CustomCursor } from "./components/CustomCursor";
import { Preloader } from "./components/Preloader";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Manifesto } from "./components/Manifesto";
import { EditorialGallery } from "./components/EditorialGallery";
import { ProcessHorizontal } from "./components/ProcessHorizontal";
import { PrivateAtelier } from "./components/PrivateAtelier";
import { ArtistSection } from "./components/ArtistSection";
import { BookingForm } from "./components/BookingForm";
import { Footer } from "./components/Footer";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      lerp: 0.075,
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.2,
      autoRaf: false,
    });

    // Sync Lenis scroll with ScrollTrigger
    lenis.on("scroll", () => ScrollTrigger.update());

    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    // Refresh after Lenis is attached so ScrollTrigger measures correctly
    setTimeout(() => ScrollTrigger.refresh(), 300);

    return () => {
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      {/* Grain overlay */}
      <div className="ks-grain" aria-hidden="true" />

      {/* Custom cursor */}
      <CustomCursor />

      {/* Preloader */}
      <Preloader onComplete={() => setPreloaderDone(true)} />

      {/* Site content */}
      <div
        style={{
          background: "#131412",
          color: "#F2EDE2",
          minHeight: "100vh",
          opacity: preloaderDone ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
      >
        <Header />
        <main>
          <Hero />
          <Manifesto />
          <EditorialGallery />
          <ProcessHorizontal />
          <PrivateAtelier />
          <ArtistSection />
          <BookingForm />
        </main>
        <Footer />
      </div>
    </>
  );
}
