import { useEffect } from "react";
import Header from "../components/Header.jsx";
import Hero from "../components/Hero.jsx";
import ModelPreview from "../components/ModelPreview.jsx";
import SimulationShowcase from "../components/SimulationShowcase.jsx";
import Footer from "../components/Footer.jsx";
import ResourceGrid from "../components/ResourceGrid.jsx";
import { site } from "../config/site.js";

export default function Home() {
  useEffect(() => {
    document.title = `${site.team} — ${site.problemStatement} · ${site.event}`;
  }, []);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <ModelPreview />
        <SimulationShowcase />
      </main>
      <Footer />
      <ResourceGrid />
    </>
  );
}
