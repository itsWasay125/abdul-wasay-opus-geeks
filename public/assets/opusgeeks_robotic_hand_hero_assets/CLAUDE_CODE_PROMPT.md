Implement the OpusGeeks HOMEPAGE HERO ONLY using the provided transparent image pack. DO NOT generate, edit, replace or duplicate the site header/navigation. The user's existing project appears to use React + Vite/react-router-dom; inspect package.json and existing files, respect the ACTUAL stack, component API, CSS conventions, existing routes, and button components. Do NOT migrate the project to Next.js. Use GSAP already in the project.

Visual reference: reference/home_hero_reference.png. This is a GUIDE ONLY; NEVER overlay the full mockup image as an asset. Preserve the clean bright white/off-white theme, existing header, and OpusGeeks gradient (#633494 → #147BC2 → #00AEEF). Desired hero: left text and CTAs, big premium futuristic silver robotic hand on lower-right, and one rotating featured service illustration hovering above its palm. Do not create basic procedural 3D, cartoon hand, cube primitives, random service cards, or icon-only placeholders. Use the provided high-resolution, transparent CGI PNGs. Do NOT import the previous `opusgeeks_hero_separate_assets.zip` cube composition—this is a NEW hero.

Asset web-root URLs (files have been copied into the existing project):
/assets/hero/01_robotic_hand.png
/assets/hero/02_web.png
/assets/hero/03_mobile_app.png
/assets/hero/04_uiux.png
/assets/hero/05_game.png
/assets/hero/06_ai.png
/assets/hero/07_cloud.png
/assets/hero/08_more_digital_products.png

Important interaction: RIGHT-SIDE MAIN FEATURED IMAGE MUST CHANGE when the highlighted service changes. This is NOT a static cube plus tiny text labels. Sequence:
01 WEB → 02_web.png
02 APPS → 03_mobile_app.png
03 GAME → 05_game.png
04 UI/UX → 04_uiux.png
05 AI → 06_ai.png
06 CLOUD → 07_cloud.png
07 MORE → 08_more_digital_products.png
Then repeat seamlessly from WEB forever. Use a 3.2–4.0 second interval per state. Each displayed image is the CENTERPIECE above the hand, not seven images simultaneously cluttering the visual. A service name list at the far right (WEB, APP, GAME, UI/UX, AI, CLOUD, MORE) can highlight the active label. Make this list clickable and keyboard-accessible; direct selection resets the autoplay clock. Hover/focus on the visual pauses autoplay, and tab/window hidden pauses it. Respect prefers-reduced-motion: static first image or manual-only change.

Keep the ROBOTIC HAND fixed in its reference composition, entering from lower-right with open upward palm beneath the featured object. The hand may have minimal 4–7px breathing movement, but don't rotate or morph it. Above the palm, preload images before slideshow transitions; use two absolutely-positioned image slots or GSAP timeline so one image scales down, rotates only a FEW DEGREES, fades out, and the next image fades/scales in. Never reveal a blank gap, and never layer both illustrations visibly for extended time. Each featured PNG already contains floating crystals and blue/purple glow; avoid duplicating full groups of decorative cubes.

Left content, roughly as in the reference:
Eyebrow: TECHNOLOGY FOR A BRIGHTER TOMORROW
Headline: Transforming / Ideas into / Reality. (highlight Ideas and Reality using brand gradient, make h1 semantic)
Paragraph: We build websites, apps, games and digital products that help brands grow, engage and lead.
Buttons: START BUILDING → route to existing contact/project page; PLAY SHOWREEL → only wire up if the repository already has a real showreel asset/modal; otherwise use existing secondary CTA with legitimate route, don't fake a playable video.
Do not invent agency stats, customer testimonials, case studies or claims. Preserve existing verified proof if present elsewhere.

Layout: left copy 45–48%, right illustration 52–55% (desktop), overall 88–100svh if sensible given real header. Hand must not cover the heading or CTA. Hero is white with subtle ambient blue/purple light, not a black sci-fi background or card-framed illustration. Service artwork should have enough visual scale to dominate the right side while maintaining its alpha, with no black square backgrounds. At mobile <=900px, stack copy then visual; fit hand and hovering art in a fixed-aspect area, avoid sideways overflow and keep reasonable hero height.

GSAP timeline: eyebrow, headline, body, CTA reveal on mount/hero in view; hand subtle reveal from x+25 with opacity and scale, then featured artwork reveals. Long-running timeline rotates through services with clean sequencing; prefer one managed GSAP timeline + timer, handle StrictMode correctly. Add small cursor parallax to hand group and floating art only on fine pointers, with motion limited to ~10–15px. Motion should be refined and lightweight for Intel UHD 620. Reuse current fonts and layout system. All asset URLs are web-root URLs starting `/assets/hero/`, never `/public/assets/hero/`. Include cleanup of timelines/listeners/timers and accessibility labels/alt and reduced-motion behavior.

Inspect current homepage hero usage and replace ONLY that hero with this design; DO NOT touch header, footer, other homepage sections or site routing. Verify screenshots at desktop 1440px and mobile 390px; check image requests/console errors and aspect/overlap. Explicitly state any deviations caused by asset limitations.
