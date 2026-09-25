import { Check } from "lucide-react";
import ProjectForm from "./ProjectForm";

/* The homepage brief.
   ===================================================================
   The homepage had no way to start a conversation on the page itself —
   every route to it was a link somewhere else. This sits directly under
   the closing CTA and uses the same form the header's dialog does, so
   the two can never say different things. */

const POINTS = [
  "A senior team on the call, not an account manager",
  "A fixed scope and a delivery date, not a range",
  "Your repository, your cloud account, your keys",
  "An NDA before anything is shared, on request",
];

export default function HomeBrief() {
  return (
    <section className="home-brief" id="home-brief" aria-labelledby="home-brief-title">
      <div className="home-brief__inner">
        <div className="home-brief__copy">
          <p className="og-eyebrow">Start here</p>
          <h2 id="home-brief-title">
            Tell us what you are <strong>building.</strong>
          </h2>
          <p className="home-brief__lead">
            Five fields is all we need to come back with something useful — a first read on
            scope, the team it would take, and what it would cost.
          </p>

          <ul className="home-brief__points">
            {POINTS.map((point) => (
              <li key={point}>
                <Check size={15} strokeWidth={2.4} aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="home-brief__panel">
          <ProjectForm />
        </div>
      </div>
    </section>
  );
}
