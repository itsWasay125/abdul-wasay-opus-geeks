import { serviceMenu } from "../data/content";
import ServiceDetail from "./ServiceDetail";

export default function UIUXDesign() {
  return <ServiceDetail service={serviceMenu.find((s) => s.path.endsWith("ui-ux-design"))} />;
}
