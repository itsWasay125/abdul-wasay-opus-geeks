/**
 * The bridge between GSAP (which lives in the DOM half of this section) and
 * the render loop (which lives in the R3F half).
 *
 * GSAP tweens these numbers directly; `useFrame` reads them. Nothing here is
 * React state, so an entrance animation or a scroll scrub never triggers a
 * re-render of the scene graph — which is the whole point, because a
 * re-render mid-scrub is what makes this kind of section stutter.
 *
 * One module-level object is safe here: the section is mounted at most once
 * per page, and `reset()` puts it back to the pre-entrance pose on mount.
 */
export const portalState = {
  /* entrance */
  portalScale: 0.75,
  portalSpin: -0.28, // radians, unwinds to 0 as it scales up
  energy: 0, // 0 -> 1, fades the portal surface in
  personOpacity: 0,
  personRise: 0.35, // world units the figure travels up into place
  particles: 0,

  /* scroll scrub across the section */
  scroll: 0, // 0 -> 1

  /* pointer parallax, already damped in the frame loop */
  pointerX: 0,
  pointerY: 0,

  reduced: false,
};

export function resetPortalState(reduced) {
  portalState.reduced = Boolean(reduced);

  if (reduced) {
    /* Reduced motion still gets the real 3D scene — it is simply already at
       its final state, with nothing left to animate. */
    portalState.portalScale = 1;
    portalState.portalSpin = 0;
    portalState.energy = 1;
    portalState.personOpacity = 1;
    portalState.personRise = 0;
    portalState.particles = 1;
  } else {
    portalState.portalScale = 0.75;
    portalState.portalSpin = -0.28;
    portalState.energy = 0;
    portalState.personOpacity = 0;
    portalState.personRise = 0.35;
    portalState.particles = 0;
  }

  portalState.scroll = 0;
  portalState.pointerX = 0;
  portalState.pointerY = 0;
}
