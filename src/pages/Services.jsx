import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import HeroCluster from "../components/HeroCluster";
import Project3DSlider from "../components/Project3DSlider";
import ServicesGrid from "../components/ServicesGrid";
import { serviceMenu } from "../data/content";
import { allProjects, projectGroups } from "../data/projects";

const servicePreviews = {
  "/services/web-development": projectGroups.web,
  "/services/mobile-development": projectGroups.mobile,
  "/services/ui-ux-design": projectGroups.design,
};

const SERVICES_STATS = [
  { value: 150, suffix: "+", label: "Products shipped" },
  { value: 3, suffix: "", label: "Core disciplines" },
  { value: 360, suffix: "°", label: "Delivery support" },
];

export default function Services() {
  return (
    <main className="services-vvip">
      <HeroCluster
        eyebrow="Product Teams For Ambitious Builds"
        titleLead="Digital services"
        titleAccent={["built to move", "business."]}
        lead="Strategy, product design, and engineering come together in one senior team. Pick a focused track or let us shape the complete route from first idea to launch."
        primary={{ label: "Start a project", to: "/contact-us" }}
        secondary={{ label: "Explore our work", to: "/portfolio" }}
        stats={SERVICES_STATS}
      />

      <section className="services-vvip__paths">
        <header>
          <div>
            <p className="services-vvip__eyebrow"><span /> Choose your build path</p>
            <h2>Three disciplines. <strong>One product standard.</strong></h2>
          </div>
          <p>
            Every engagement gets a tailored roadmap, focused senior talent, and a system designed
            to stay useful after launch.
          </p>
        </header>

        <div className="services-vvip__path-grid">
          {serviceMenu.map((service, index) => {
            const previews = servicePreviews[service.path];
            return (
              <Link
                className="services-vvip__path-card"
                data-tilt
                to={service.path}
                style={{ "--path-index": index }}
                key={service.path}
              >
                <div className="services-vvip__path-media">
                  <img src={previews[0].image} alt={`${service.label} featured project`} />
                  <span className="services-vvip__path-stack" aria-hidden="true">
                    {previews.slice(1, 3).map((project) => (
                      <img src={project.image} alt="" key={project.title} />
                    ))}
                  </span>
                  <strong>0{index + 1}</strong>
                </div>
                <div className="services-vvip__path-copy">
                  <span><Icon name={service.icon} /> Core service</span>
                  <h3>{service.label}</h3>
                  <p>{service.intro}</p>
                  <em>Explore service <Icon name="arrow-up-right" /></em>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <Project3DSlider
        projects={allProjects}
        eyebrow="Live project reel"
        title="Real projects, always in motion."
        copy="Our website, mobile, and product-design work runs in one interactive 3D gallery. Click any project to bring it forward."
      />

      <section className="services-vvip__capabilities">
        <div className="services-vvip__capability-head">
          <p className="services-vvip__eyebrow"><span /> Full delivery spectrum</p>
          <h2>Everything required to <strong>build, launch, and grow.</strong></h2>
        </div>
        <ServicesGrid />
      </section>
    </main>
  );
}
