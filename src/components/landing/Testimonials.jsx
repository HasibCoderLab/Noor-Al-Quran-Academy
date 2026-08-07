import SectionWrapper from "../ui/SectionWrapper";
import { TESTIMONIALS } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";

const flags = {
  Italy: "🇮🇹",
  USA: "🇺🇸",
  UK: "🇬🇧",
  "Saudi Arabia": "🇸🇦",
  Bangladesh: "🇧🇩",
};

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5 text-accent" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "" : "opacity-30"}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <SectionWrapper id="testimonials" bg="alt" direction="bottom">
      <div className={styles.sectionHeader}>
        <span className={styles.badgeGold}>Testimonials</span>
        <h2 className={`${styles.sectionTitle} mt-4`}>What Students Say</h2>
        <div className={styles.goldDivider} />
        <p className={styles.sectionSub}>
          Hear from students and parents across the world who learn with us.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TESTIMONIALS.map((item) => (
          <div key={item.name} className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary/10">
            <Stars rating={item.rating} />

            <p className="mt-4 flex-1 text-sm leading-relaxed text-primary/75">
              &ldquo;{item.text}&rdquo;
            </p>

            <div className="mt-6 flex items-center gap-3 border-t border-primary/10 pt-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {item.name.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-bold text-primary">{item.name}</p>
                <p className="flex items-center gap-1 text-xs text-primary/60">
                  {flags[item.country] || "🌍"} {item.country}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
