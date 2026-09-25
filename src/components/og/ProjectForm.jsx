import { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { serviceMenu } from "../../data/content";

/* The brief form, in one place.
   ===================================================================
   It is rendered twice: inside the "Start a project" modal the header
   opens, and as its own section under the homepage CTA. Both want the
   same fields and the same copy, and a second copy of either would
   drift from the first the moment one of them was edited. */

const SERVICES = [...serviceMenu.map((s) => s.label), "Something else"];

export default function ProjectForm({ compact = false, onSent }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    service: SERVICES[0],
    budget: "",
    brief: "",
  });
  const [sent, setSent] = useState(false);

  const update = (event) => {
    setSent(false);
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = (event) => {
    event.preventDefault();
    setSent(true);
    onSent?.(form);
  };

  return (
    <form className={`pform${compact ? " pform--compact" : ""}`} onSubmit={submit}>
      <div className="pform__row">
        <label className="pform__field">
          <span>Your name</span>
          <input name="name" value={form.name} onChange={update} required placeholder="Jane Doe" />
        </label>
        <label className="pform__field">
          <span>Work email</span>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={update}
            required
            placeholder="jane@company.com"
          />
        </label>
      </div>

      <div className="pform__row">
        <label className="pform__field">
          <span>What you need</span>
          <select name="service" value={form.service} onChange={update}>
            {SERVICES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="pform__field">
          <span>Budget range</span>
          <select name="budget" value={form.budget} onChange={update}>
            <option value="">Not sure yet</option>
            <option>Under $10k</option>
            <option>$10k – $25k</option>
            <option>$25k – $60k</option>
            <option>$60k +</option>
          </select>
        </label>
      </div>

      <label className="pform__field">
        <span>The brief</span>
        <textarea
          name="brief"
          value={form.brief}
          onChange={update}
          rows={compact ? 3 : 4}
          required
          placeholder="What are you building, who is it for, and what has to be true at launch?"
        />
      </label>

      <div className="pform__foot">
        <p className="pform__promise">
          <Check size={14} strokeWidth={2.4} aria-hidden="true" />
          A senior reply within one working day. No sales sequence.
        </p>
        <button className="og-btn og-btn--solid pform__send" type="submit">
          <span>{sent ? "Brief sent" : "Send the brief"}</span>
          <ArrowUpRight size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </div>

      {sent ? (
        <p className="pform__sent" role="status">
          Thanks — that is with the team. You will hear back within one working day.
        </p>
      ) : null}
    </form>
  );
}
