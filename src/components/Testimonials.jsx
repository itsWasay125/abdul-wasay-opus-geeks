import { testimonialSlides } from "../data/content";
import Icon from "./Icon";
import {
  ThreeDScrollTriggerContainer,
  ThreeDScrollTriggerRow,
} from "./lightswind/ThreeDScrollTrigger";

/* The five client portraits the About page already ships. There are fifteen
   quotes, so they cycle - the initials stay underneath as the fallback if a
   file ever fails to load, which is what the avatar showed before. */
const avatarPhotos = [
  "/assets/clients/client-01.jpg",
  "/assets/clients/client-02.jpg",
  "/assets/clients/client-03.jpg",
  "/assets/clients/client-04.jpg",
  "/assets/clients/client-05.jpg",
];

const avatarGradients = [
  "linear-gradient(135deg, rgba(99,52,148,0.95), rgba(70,30,120,0.85))",
  "linear-gradient(135deg, rgba(0,174,239,0.95), rgba(8,130,170,0.85))",
  "linear-gradient(135deg, rgba(20,123,194,0.95), rgba(40,70,160,0.88))",
  "linear-gradient(135deg, rgba(47,99,178,0.95), rgba(30,60,130,0.85))",
];

function getInitials(name) {
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0][0].toUpperCase();
}

function TestimonialCard({ item, index }) {
  return (
    <article className="testimonial-card">
      <div className="stars" aria-label="Five star rating">
        <Icon name="star" />
        <Icon name="star" />
        <Icon name="star" />
        <Icon name="star" />
        <Icon name="star" />
      </div>
      <p>&ldquo;{item.quote}&rdquo;</p>
      <div className="testimonial-author">
        <div
          className="t-avatar"
          style={{ background: avatarGradients[index % avatarGradients.length] }}
          aria-hidden="true"
        >
          {getInitials(item.name)}
          <img
            src={avatarPhotos[index % avatarPhotos.length]}
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>
        <div>
          <strong>{item.name}</strong>
          <span>{item.role}</span>
        </div>
      </div>
    </article>
  );
}

/* Two rows, not three. The data is authored in blocks, so it is flattened
   and split evenly here — that way adding a quote never leaves one row short
   and none of them are dropped. */
const ALL_QUOTES = testimonialSlides.flat();
const HALF = Math.ceil(ALL_QUOTES.length / 2);
const rows = [ALL_QUOTES.slice(0, HALF), ALL_QUOTES.slice(HALF)];

export default function Testimonials() {
  return (
    <section id="testimonials" className="section testimonials-section theme-light">
      <div className="section-heading reveal">
        <p className="eyebrow">Testimonials</p>
        <h2>Trusted by teams who expect <strong>more from digital.</strong></h2>
        <p>Real partnerships, clear communication, and products people are proud to launch.</p>
      </div>

      <ThreeDScrollTriggerContainer className="testimonials-scroll-stage">
        {rows.map((slide, slideIndex) => (
          <ThreeDScrollTriggerRow
            key={slideIndex}
            baseVelocity={7}
            direction={slideIndex % 2 === 0 ? 1 : -1}
            className="testimonial-3d-row"
            pauseOnHover={true}
          >
            {slide.map((item, index) => (
              <TestimonialCard item={item} index={index} key={`${item.name}-${index}`} />
            ))}
          </ThreeDScrollTriggerRow>
        ))}
      </ThreeDScrollTriggerContainer>
    </section>
  );
}
