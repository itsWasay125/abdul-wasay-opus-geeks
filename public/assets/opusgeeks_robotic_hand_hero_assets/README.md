# OpusGeeks Robotic-Hand Home Hero — Asset Pack

Place the contents of `public/assets/hero/` in your existing project's `public/assets/hero/`. The reference image is for comparison only: DO NOT render the complete mockup as a hero layer.

## Transparent PNG assets
- 01_robotic_hand.png — fixed lower-right / palm facing upward
- 02_web.png — Web slide, glossy web browser
- 03_mobile_app.png — Apps/Mobile slide, glossy smartphone
- 04_uiux.png — UI/UX slide, glass UI design stack; same artwork as the More asset, reused to avoid an unrelated/cartoon illustration
- 05_game.png — Games slide, controller
- 06_ai.png — AI slide, sci-fi AI module
- 07_cloud.png — Cloud slide, server/cloud
- 08_more_digital_products.png — More slide, abstract digital building blocks (also used for UI/UX if needed)

These are transparent pre-rendered CGI-style PNG illustrations, not GLB or live 3D geometry. Use 2.5D GSAP transforms and crossfades; DON'T promise true 3D spin of the internal shapes. The transparency retains translucent glow/edge pixels: don't auto-strip or aggressively remove the glow.

## How to use
Open `CLAUDE_CODE_PROMPT.md` and give it to Claude Code. This pack contains 8 individual asset files + 1 full-layout reference image.
