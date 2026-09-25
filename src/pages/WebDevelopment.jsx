import { serviceMenu } from "../data/content";
import ServiceDetail from "./ServiceDetail";

export default function WebDevelopment() {
  return <ServiceDetail service={serviceMenu.find((s) => s.path.endsWith("web-development"))} />;
}
