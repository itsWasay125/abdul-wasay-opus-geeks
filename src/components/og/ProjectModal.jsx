import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import ProjectForm from "./ProjectForm";

/* The "Start a project" dialog.
   ===================================================================
   It opens on a Z axis: the card arrives from behind the page, rotated
   back a few degrees, and settles flat. That is the whole 3D of it —
   a perspective on the backdrop and one transform on the card, both of
   which composite, so opening it costs nothing on the main thread.

   It is a real dialog: focus moves into it, Escape closes it, the page
   behind it cannot scroll, and focus returns to the button that opened
   it. */

export default function ProjectModal({ open, onClose }) {
  const cardRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    openerRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const card = cardRef.current;
    card?.querySelector("input, select, textarea, button")?.focus();

    const onKey = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !card) return;
      const focusable = card.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      openerRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="pmodal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pmodal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="pmodal__card" ref={cardRef}>
        <button type="button" className="pmodal__close" onClick={onClose} aria-label="Close">
          <X size={18} strokeWidth={2.2} />
        </button>

        <div className="pmodal__head">
          <p className="pmodal__eyebrow">
            <span aria-hidden="true" />
            Start a project
          </p>
          <h2 id="pmodal-title">
            Tell us what you are <strong>building.</strong>
          </h2>
          <p className="pmodal__lead">
            Five fields. You get a senior team, a fixed scope and a first call inside one
            working day.
          </p>
        </div>

        <ProjectForm compact onSent={() => {}} />
      </div>
    </div>
  );
}
