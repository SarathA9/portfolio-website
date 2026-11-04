import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Spotlight from "@/components/Spotlight";
import ScrollFX from "@/components/ScrollFX";
import SceneBackground from "@/components/SceneBackground";
import { Research, Projects, Experience, About, SkillsEducation, Contact } from "@/components/Sections";

export default function Home() {
  return (
    <>
      <a href="#research" className="skip">Skip to content</a>
      <SceneBackground />
      <Spotlight />
      <ScrollFX />
      <Navbar />
      <main>
        <Hero />
        <Research />
        <Projects />
        <Experience />
        <About />
        <SkillsEducation />
        <Contact />
      </main>
    </>
  );
}
