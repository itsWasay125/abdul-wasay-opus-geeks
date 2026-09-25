import HeroBanner from "../components/HeroBanner";
import InteractiveGrid from "../components/InteractiveGrid";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import AboutFeatureSection from "../components/og/AboutFeatureSection";
import AboutTopClients from "../components/og/AboutTopClients";
import AboutPortal from "../components/AboutPortal/AboutPortal";
import OurToolkitSection from "../components/og/OurToolkitSection";

const capabilities = [
  { title: "Product strategy", copy: "Roadmaps, discovery, validation, and technical direction.", icon: "explore" },
  { title: "Experience design", copy: "Interfaces and systems that make complex products feel simple.", icon: "pen-tool" },
  { title: "Digital engineering", copy: "Fast, resilient web and mobile products built for real use.", icon: "code-2" },
  { title: "AI enablement", copy: "Practical AI features and workflows shaped around measurable value.", icon: "bot" },
];

const industries = [
  "Governmental Sector",
  "Telecom & Media",
  "Professional Services",
  "Healthcare",
  "Oil & Gas",
  "Energy & Utilities",
  "Education",
  "Finance & Banking",
  "Construction",
  "Manufacturing",
];

export default function AboutUs() {
  return (
    <main className="about-page">
      <HeroBanner
        backdrop={
          <InteractiveGrid
            effectColor="rgba(37, 99, 235, 0.34)"
            gridColor="rgba(14, 30, 72, 0.085)"
            fadeIntensity={46}
            glowRadius={30}
          />
        }
        eyebrow="The studio behind the work"
        titleLead="We are the people"
        titleInline="behind"
        titleTail="that move."
        phrases={["Products", "Platforms", "Brands", "Experiences"]}
        lead="A senior product team combining strategy, design, and engineering to turn ambitious ideas into digital experiences people understand, use, and remember."
        primary={{ label: "Start a conversation", to: "/contact-us" }}
        secondary={{ label: "Explore our work", to: "/portfolio", icon: "explore" }}
        stats={[
          { value: "100+", label: "Products shipped" },
          { value: "50+", label: "Teams partnered" },
          { value: "8+", label: "Years in market" },
        ]}
      />

      <AboutPortal />

      {/* the old about-page__principles block said the same thing as this
          section in a weaker layout, so the disciplines list carries it now */}
      <AboutFeatureSection />

      <section className="about-page__capabilities">
        <div className="about-page__capabilities-head">
          <div>
            <p className="about-page__eyebrow"><span /> One connected team</p>
            <h2>Every discipline needed to <strong>move with confidence.</strong></h2>
          </div>
          <p>
            No disconnected handoffs. Strategy, design, and technology move together from the
            earliest question to the final release.
          </p>
        </div>
        <div className="about-page__capability-grid">
          {capabilities.map((capability, index) => (
            <article className="about-page__capability" key={capability.title}>
              <span>0{index + 1}</span>
              <Icon name={capability.icon} />
              <h3>{capability.title}</h3>
              <p>{capability.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <OurToolkitSection />

      <section className="about-page__industries">
        <div className="about-page__industries-copy">
          <p className="about-page__eyebrow"><span /> Industries</p>
          <h2>
            Custom software for sectors that need <strong>real-world clarity.</strong>
          </h2>
          <p>
            We shape products around the realities of each sector, balancing user needs, operational
            complexity, and the systems teams already depend on.
          </p>
          <Link className="about-page__industries-link" to="/contact-us">
            Discuss your industry challenge <Icon name="arrow-up-right" />
          </Link>
        </div>

        <div className="about-page__industry-orbit" aria-label="Industries served">
          <span className="about-page__industry-ring about-page__industry-ring--outer" aria-hidden="true" />
          <span className="about-page__industry-ring about-page__industry-ring--inner" aria-hidden="true" />
          <div className="about-page__industry-track">
            {industries.map((industry, index) => (
              <span
                className="about-page__industry-chip"
                key={industry}
                style={{ "--chip-index": index }}
              >
                <span>{industry}</span>
              </span>
            ))}
          </div>
          <div className="about-page__industry-core">
            <img src="/assets/about/about-showcase.png" alt="Opus Geeks" />
            <span>10 sectors</span>
            <strong>One product mindset</strong>
          </div>
        </div>
      </section>

      <AboutTopClients />
    </main>
  );
}
