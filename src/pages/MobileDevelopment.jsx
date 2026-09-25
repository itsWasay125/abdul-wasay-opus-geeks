import { serviceMenu } from "../data/content";
import ServiceDetail from "./ServiceDetail";

export default function MobileDevelopment() {
  return <ServiceDetail service={serviceMenu.find((s) => s.path.endsWith("mobile-development"))} />;
}
