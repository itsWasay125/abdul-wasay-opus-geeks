import Icon from "../components/Icon";
import PortfolioStudioBanner from "../components/og/PortfolioStudioBanner";
import Project3DSlider from "../components/Project3DSlider";
import ScrollGallery from "../components/ScrollGallery";
import { allProjects } from "../data/projects";

const portfolioCollections = [
  {
    id: "websites",
    index: "01",
    eyebrow: "Website Development",
    title: "Websites built to turn attention into action.",
    copy:
      "Opus Geeks invites you to explore our website development portfolio, where innovation meets excellence. With a focus on user-centric design, cutting-edge technologies, and strategic insights, we've crafted bespoke websites that captivate audiences and drive tangible results for businesses across diverse industries.",
    projects: [
      {
        title: "V-Stream Aviation",
        type: "Aviation Website",
        image: "/assets/portfolio/Group-1000008327.webp",
        accent: "#d6a94d",
        copy: "A premium aviation sales experience shaped around trust, clarity, and confident enquiries.",
      },
      {
        title: "Kelstech Home Service",
        type: "Service Platform",
        image: "/assets/portfolio/Group-1000008328.webp",
        accent: "#8b7cf6",
        copy: "A conversion-focused home service platform that makes installation and assembly feel effortless.",
      },
      {
        title: "Restaurant Techs",
        type: "Restaurant Platform",
        image: "/assets/portfolio/Group-1000008331.webp",
        accent: "#22d3ee",
        copy: "A connected restaurant technology platform designed to present products and services with impact.",
      },
      {
        title: "US Maxim",
        type: "Beauty Commerce",
        image: "/assets/portfolio/Group-1000008334.webp",
        accent: "#c99d45",
        copy: "An elegant beauty storefront combining product discovery, premium branding, and commerce.",
      },
      {
        title: "Clean Sanctuary",
        type: "Cleaning Services",
        image: "/assets/portfolio/Group-1000008336.webp",
        accent: "#33b6d8",
        copy: "A bright service website that turns a clean visual system into a clear customer journey.",
      },
      {
        title: "OHS Healthcare",
        type: "Healthcare Website",
        image: "/assets/portfolio/Group-1000008350.png",
        accent: "#5f7df7",
        copy: "A trustworthy healthcare web experience built around accessibility and essential information.",
      },
    ],
  },
  {
    id: "mobile-apps",
    index: "02",
    eyebrow: "Mobile Application Development",
    title: "Mobile products designed for everyday momentum.",
    copy:
      "Discover the transformative power of mobile applications with Opus Geeks' diverse portfolio of innovative projects. Our mobile application development portfolio showcases our expertise in creating intuitive, engaging, and high-performance apps that drive success for businesses across various industries.",
    projects: [
      {
        title: "Mind Nourishment",
        type: "Wellness Mobile App",
        image: "/assets/portfolio/Group-1000008352.webp",
        accent: "#67e8f9",
        copy: "A calm wellness journey designed to help users pause, reflect, and build healthier routines.",
      },
      {
        title: "Le Cavalier Cellars",
        type: "Wine Commerce App",
        image: "/assets/portfolio/Group-1000008353.webp",
        accent: "#c39b50",
        copy: "A refined mobile commerce experience for exploring collections and discovering memorable wines.",
      },
      {
        title: "Restaurant Techs Mobile",
        type: "Restaurant Services App",
        image: "/assets/portfolio/Group-1000008354.webp",
        accent: "#22d3ee",
        copy: "A fast service marketplace connecting restaurants with the help they need, when they need it.",
      },
      {
        title: "Wedding Stay",
        type: "Wedding Planning App",
        image: "/assets/portfolio/Group-1000008355.webp",
        accent: "#f5f5f5",
        copy: "A polished planning experience bringing packages, venues, deals, and bookings into one place.",
      },
    ],
  },
  {
    id: "ui-ux",
    index: "03",
    eyebrow: "UI / UX Design & Development",
    title: "Interfaces where form and function move together.",
    copy:
      "Opus Geeks invites you to explore our portfolio of UI/UX design and development projects, where form meets function to create exceptional user experiences. Our portfolio showcases our expertise in crafting intuitive, visually appealing interfaces that captivate users and drive engagement for businesses across diverse industries.",
    projects: [
      {
        title: "Instant Website Showcase",
        type: "Responsive Web System",
        image: "/assets/portfolio/RT-mockup-10.webp",
        accent: "#e5b67d",
        copy: "A modular presentation system built to make responsive website concepts easy to understand.",
      },
      {
        title: "Restaurant Experience System",
        type: "Commerce UI / UX",
        image: "/assets/portfolio/RT-mockup-2.png",
        accent: "#22d3ee",
        copy: "A multi-device restaurant experience connecting discovery, ordering, and customer engagement.",
      },
      {
        title: "Smart Home Control",
        type: "Mobile Product Design",
        image: "/assets/portfolio/RT-mockup-5.png",
        accent: "#8c7bf2",
        copy: "A clean connected-home interface that makes complex controls feel simple and approachable.",
      },
      {
        title: "Travel Companion",
        type: "Travel App UI / UX",
        image: "/assets/portfolio/RT-mockup-6.webp",
        accent: "#c8c8c8",
        copy: "A travel planning concept balancing discovery, utility, and a calm visual hierarchy.",
      },
      {
        title: "Healthcare Platform",
        type: "Healthcare UI / UX",
        image: "/assets/portfolio/RT-mockup-9.webp",
        accent: "#b8a9ef",
        copy: "A reassuring healthcare experience that keeps services, information, and support within reach.",
      },
    ],
  },
];

export default function Portfolio() {
  return (
    <main className="portfolio-page">
      <PortfolioStudioBanner />

      <ScrollGallery />

      <section className="portfolio-page__mastery">
        <div>
          <p className="portfolio-page__eyebrow"><span /> Selected Work</p>
          <h2>Unveiling our <strong>software mastery.</strong></h2>
        </div>
        <p>
          Step into the realm of excellence with Opus Geeks as we unveil our mastery of software
          solutions through a diverse portfolio. Every project combines expertise, creativity,
          innovation, and strategic insight to deliver outstanding results.
        </p>
        <div className="portfolio-page__mastery-stats">
          <span><strong>03</strong> Disciplines</span>
          <span><strong>15</strong> Featured Projects</span>
          <span><strong>3D</strong> Interactive Gallery</span>
        </div>
      </section>

      <Project3DSlider
        projects={allProjects}
        eyebrow="Interactive project gallery"
        title="Every discipline. One moving portfolio."
        copy="Browse all featured projects in a continuous 3D carousel, then explore each discipline below."
      />

      {portfolioCollections.map((collection) => (
        <section
          id={collection.id}
          className="portfolio-page__collection"
          key={collection.id}
          style={{ "--collection-index": `"${collection.index}"` }}
        >
          <div className="portfolio-page__collection-heading">
            <div>
              <p className="portfolio-page__eyebrow"><span /> {collection.index} / 03</p>
              <h2>{collection.eyebrow}</h2>
            </div>
            <p>{collection.copy}</p>
          </div>

          <div className="portfolio-page__project-grid">
            {collection.projects.map((project, projectIndex) => (
              <article
                className="portfolio-page__project-card"
                data-tilt
                key={project.title}
                style={{ "--project-accent": project.accent, "--project-delay": `${projectIndex * 80}ms` }}
              >
                <div className="portfolio-page__project-frame">
                  <img src={project.image} alt={`${project.title} project preview`} />
                  <span className="portfolio-page__project-glare" />
                  <div className="portfolio-page__project-number">
                    {String(projectIndex + 1).padStart(2, "0")}
                  </div>
                </div>
                <div className="portfolio-page__project-copy">
                  <span>{project.type}</span>
                  <h3>{project.title}</h3>
                  <p>{project.copy}</p>
                  <button type="button" disabled title="Project website link will be added soon">
                    Project Link Soon
                    <Icon name="arrow-up-right" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="portfolio-page__closing">
        <span className="og-ring og-ring--tl" aria-hidden="true" />
        <span className="og-ring og-ring--br" aria-hidden="true" />
        <p className="portfolio-page__eyebrow"><span /> Built For Impact</p>
        <h2>More than polished screens. <strong>Products made to perform.</strong></h2>
        <p>
          Project website links are ready to be connected as soon as the final destinations are provided.
        </p>
      </section>
    </main>
  );
}
