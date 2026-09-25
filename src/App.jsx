import { Suspense, lazy } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import SiteHeader from "./components/og/SiteHeader";
import SiteFooter from "./components/og/SiteFooter";
import Chatbot from "./components/Chatbot";
import CtaBanner3D from "./components/og/CtaBanner3D";
import HomeBrief from "./components/og/HomeBrief";
import ScrollProvider from "./components/ScrollProvider";
import StatsSection from "./components/StatsSection";
import Homepage from "./pages/Homepage";
import { useFitHeadings } from "./hooks/useFitHeadings";

/* Every route but the homepage is split out.

   All fifteen pages used to be static imports, so opening the site meant
   downloading and parsing the portfolio deck, the blog, the FAQ engine and
   every service page before the hero could run - about 1.1MB of JavaScript
   on the main thread, which is most of why the first few seconds felt heavy
   on a Mac. The homepage stays eager because it is the common entry point;
   the rest arrive when their link is followed. */
const Services = lazy(() => import("./pages/Services"));
const WebDevelopment = lazy(() => import("./pages/WebDevelopment"));
const MobileDevelopment = lazy(() => import("./pages/MobileDevelopment"));
const UIUXDesign = lazy(() => import("./pages/UIUXDesign"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Blogs = lazy(() => import("./pages/Blogs"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const FAQs = lazy(() => import("./pages/FAQs"));
const IndustriesPreview = lazy(() => import("./pages/IndustriesPreview"));
const LegalPage = lazy(() => import("./pages/LegalPage"));

function SiteLayout() {
  const { pathname } = useLocation();
  /* every page banner stays on three lines - see the hook */
  useFitHeadings(pathname);
  const hideGlobalStats = pathname.startsWith("/contact-us") || pathname.startsWith("/faqs");
  /* Portfolio opens on the lit studio stage — a dark band — so the resting
     header drops its light plate there and inverts its type. */
  const darkHero = pathname === "/portfolio";

  return (
    <>
      <SiteHeader darkHero={darkHero} />
      <main id="main-content">
        {/* min-height holds the page open while a route chunk lands, so the
            footer does not fly up and back down on every navigation */}
        <Suspense fallback={<div style={{ minHeight: "70vh" }} aria-busy="true" />}>
          <Outlet />
        </Suspense>
        {!hideGlobalStats && <StatsSection className="theme-light" />}
        <CtaBanner3D onContactPage={pathname.startsWith("/contact-us")} />
        {/* the brief form, home only - the CTA above it is global */}
        {pathname === "/" && <HomeBrief />}
      </main>
      <SiteFooter />
      <Chatbot />
    </>
  );
}

export default function App() {
  return (
    <ScrollProvider>
      {/* mounted above the router, so it runs on a real page load and never on
          an in-app navigation */}

      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/web-development" element={<WebDevelopment />} />
          <Route path="/services/mobile-development" element={<MobileDevelopment />} />
          <Route path="/services/ui-ux-design" element={<UIUXDesign />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/page/:pageNumber" element={<Blogs />} />
          <Route path="/blogs/:slug" element={<BlogDetail />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/privacy-policy" element={<LegalPage slug="privacy-policy" />} />
          <Route path="/terms-conditions" element={<LegalPage slug="terms-conditions" />} />
          <Route path="/preview/industries" element={<IndustriesPreview />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ScrollProvider>
  );
}
