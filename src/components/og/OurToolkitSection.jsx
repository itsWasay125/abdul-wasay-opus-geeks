import KnowledgeConvergence from "./KnowledgeConvergence";

/**
 * OurToolkitSection
 * =================
 * Opus Geeks Homepage section showcasing core engineering capabilities
 * powered by the interactive KnowledgeConvergence component with integrated header.
 */
export default function OurToolkitSection() {
  return (
    <section className="og-toolkit-section" aria-label="Our Engineering Toolkit">
      {/* Background Volumetric Ambient Glows */}
      <div className="og-toolkit-section__glow og-toolkit-section__glow--purple" aria-hidden="true" />
      <div className="og-toolkit-section__glow og-toolkit-section__glow--cyan" aria-hidden="true" />

      <div className="og-shell" style={{ position: "relative", zIndex: 10 }}>
        {/* Interactive KnowledgeConvergence Visualizer with Embedded Centered Header */}
        <KnowledgeConvergence
          title="Opus Geeks"
          badgeText="Our Toolkit"
          dotColor="#00ADEE"
        />
      </div>
    </section>
  );
}
