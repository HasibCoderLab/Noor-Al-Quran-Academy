import Hero from "../components/landing/Hero";
import Courses from "../components/landing/Courses";
import About from "../components/landing/About";
import Pricing from "../components/landing/Pricing";
import Testimonials from "../components/landing/Testimonials";
import FAQ from "../components/landing/FAQ";
import { SITE, COURSES } from "../data/siteData";

export const metadata = {
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: SITE.name,
  description: SITE.description,
  founder: {
    "@type": "Person",
    name: SITE.teacher,
    jobTitle: SITE.teacherTitle,
  },
  areaServed: SITE.targetCountries,
  sameAs: [SITE.facebook, SITE.messenger].filter(Boolean),
  availableLanguage: ["en", "bn", "ar"],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Online Quran courses",
    itemListElement: COURSES.map((course) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Course",
        name: course.name,
        description: course.description,
        courseMode: "online",
        inLanguage: ["en", "ar", "bn"],
      },
    })),
  },
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Courses />
      <About />
      <Pricing />
      <Testimonials />
      <FAQ />
    </main>
  );
}
