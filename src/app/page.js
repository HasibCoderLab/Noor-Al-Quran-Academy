import Hero from "../components/landing/Hero";
import Courses from "../components/landing/Courses";
import About from "../components/landing/About";
import Pricing from "../components/landing/Pricing";
import Testimonials from "../components/landing/Testimonials";
import FAQ from "../components/landing/FAQ";

export default function Home() {
  return (
    <main>
      <Hero />
      <Courses />
      <About />
      <Pricing />
      <Testimonials />
      <FAQ />
    </main>
  );
}
