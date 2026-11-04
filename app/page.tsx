import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { Research, Projects, Experience, About, SkillsEducation, Contact } from "@/components/Sections";

export default function Home() {
  return (
    <>
      <a href="#research" className="skip">Skip to content</a>
      <Navbar />
      <Hero />
      <main>
        <Research />
        <Projects />
        <Experience />
        <About />
        <SkillsEducation />
      </main>
      <Contact />
    </>
  );
}
