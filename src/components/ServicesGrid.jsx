import { services } from "../data/content";
import Icon from "./Icon";

export default function ServicesGrid() {
  return (
    <div className="services-grid">
      {services.map((service) => (
        <article className="service-card reveal" data-tilt key={service.title}>
          <div className="card-shine" aria-hidden="true"></div>
          <div className="service-icon">
            <Icon name={service.icon} />
          </div>
          <h3>{service.title}</h3>
          <p>{service.copy}</p>
        </article>
      ))}
    </div>
  );
}
