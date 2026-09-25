import IndustriesSection from "../components/IndustriesSection";
import IndustriesDeck from "../components/IndustriesDeck";

/* Internal side-by-side page for choosing between the two industries treatments.
   Not linked in the nav - open /preview/industries directly. */
export default function IndustriesPreview() {
  return (
    <div className="preview-flow">
      <div className="preview-flag">
        <strong>Option A</strong>
        <span>Sector console - tabs, image stage, brief panel (currently live on the homepage)</span>
      </div>
      <IndustriesSection />

      <div className="preview-flag preview-flag--b">
        <strong>Option B</strong>
        <span>Sector deck - 3D cards driven by scroll, real client sites scrolling in browser frames</span>
      </div>
      <IndustriesDeck />
    </div>
  );
}
