import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { galleryShots } from "../data/galleryShots";

export default function ScrollGallery() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // 3D tilt with scale compensation so the cards fill the full screen height without any bottom gap
  const rotateX = useTransform(scrollYProgress, [0, 0.6], [52, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.6], [1.2, 1]);

  // Symmetrical column drift with all columns aligned at top
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const y3 = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);

  const colTransforms = [y1, y2, y3];

  return (
    <section className="scroll-gallery" aria-label="3D Wall of Work">
      <div className="scroll-gallery__ambient-glow" aria-hidden="true" />

      <div className="scroll-gallery__intro">
        <div className="scroll-gallery__badge">
          <span className="scroll-gallery__badge-pip" aria-hidden="true" />
          <Sparkles size={14} className="scroll-gallery__badge-icon" aria-hidden="true" />
          <span>3D Wall of Work</span>
        </div>

        <h2>
          Every screen here is <strong>a site we shipped.</strong>
        </h2>

        <p className="scroll-gallery__lead">
          Storefronts, service platforms, booking engines, and enterprise systems — built end to end,
          launched, and running for real-world businesses.
        </p>
      </div>

      <div className="scroll-gallery__track" ref={containerRef}>
        <div className="scroll-gallery__3d-stage">
          <motion.div
            className="scroll-gallery__3d-wall"
            style={{
              rotateX,
              scale,
              transformStyle: "preserve-3d",
              perspective: "1200px",
            }}
          >
            {galleryShots.map((colItems, colIndex) => (
              <motion.div
                className={`scroll-gallery__3d-col scroll-gallery__3d-col--${colIndex + 1}`}
                key={`col-${colIndex}`}
                style={{
                  y: colTransforms[colIndex] || "0%",
                }}
              >
                {colItems.map((shot, shotIndex) => (
                  <article
                    className="gallery-tile"
                    key={`${shot.client}-${shotIndex}`}
                  >
                    <div className="gallery-tile__browser" aria-hidden="true">
                      <span className="gallery-tile__dots">
                        <i /><i /><i />
                      </span>
                      <span className="gallery-tile__url">
                        opusgeeks.com / {shot.client.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                      </span>
                    </div>

                    <div className="gallery-tile__media">
                      <img
                        src={shot.image}
                        alt={`${shot.client} - ${shot.type}`}
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="gallery-tile__glare" aria-hidden="true" />
                    </div>

                    <figcaption className="gallery-tile__caption">
                      <div className="gallery-tile__meta">
                        <strong>{shot.client}</strong>
                        <small>{shot.type}</small>
                      </div>
                      <span className="gallery-tile__badge">
                        <ArrowUpRight size={14} />
                      </span>
                    </figcaption>
                  </article>
                ))}
              </motion.div>
            ))}
          </motion.div>

          <span className="scroll-gallery__veil" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}





