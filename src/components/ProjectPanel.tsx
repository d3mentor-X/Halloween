// Project detail panel shown when a milestone is discovered or revisited.
// All project content comes from the data file — nothing is hardcoded here.

import { Project, profile } from "@/data/portfolio";
import { X, ExternalLink, CheckCircle2, Circle, Github, Mail, Linkedin } from "lucide-react";

interface Props {
  project: Project;
  discovered: boolean;
  onClose: () => void;
  onContact: () => void;
}

const statusStyles: Record<string, string> = {
  Shipped: "border-moss/50 text-moss",
  "In Progress": "border-amber/50 text-amber",
  Research: "border-moon/50 text-moon",
  Planned: "border-bone-deep/50 text-bone-deep",
};

export function ProjectPanel({ project, discovered, onClose, onContact }: Props) {
  const isPlaceholder = (url: string) => url.startsWith("PLACEHOLDER");

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
      <div className="rise panel-scroll relative max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl border border-bone-deep/30 bg-[#0b0d12]/95 p-6 shadow-2xl sm:p-8">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-2 text-bone-dim transition hover:bg-white/5 hover:text-bone"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2">
          {discovered ? (
            <CheckCircle2 size={18} className="text-moss" />
          ) : (
            <Circle size={18} className="text-blood" />
          )}
          <span className="text-[11px] uppercase tracking-widest text-bone-deep">
            {discovered ? "Milestone Discovered" : "New Milestone"}
          </span>
        </div>

        <h2 className="mt-2 font-display text-3xl text-bone sm:text-4xl">{project.title}</h2>
        <p className="mt-1 font-display text-sm uppercase tracking-[0.3em] text-blood">
          {project.subtitle}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-widest ${
              statusStyles[project.status] ?? statusStyles.Planned
            }`}
          >
            {project.status}
          </span>
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-bone-deep/25 px-3 py-1 text-[11px] text-bone-dim"
            >
              {tech}
            </span>
          ))}
        </div>

        <p className="mt-5 text-sm leading-relaxed text-bone-dim sm:text-base">
          {project.summary}
        </p>

        {project.id === "gold-agent" && (
          <p className="mt-3 rounded-lg border border-blood/30 bg-blood/5 p-3 text-xs italic text-blood/90">
            Research only — not financial advice.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {project.links.map((link) =>
            isPlaceholder(link.url) ? (
              <span
                key={link.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-bone-deep/30 px-4 py-2 text-xs text-bone-deep"
                title="Link not yet set — edit src/data/portfolio.ts"
              >
                <Github size={14} />
                {link.label} (coming soon)
              </span>
            ) : (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-bone-dim/40 px-4 py-2 text-xs text-bone transition hover:border-bone hover:bg-white/5"
              >
                <ExternalLink size={14} />
                {link.label}
              </a>
            )
          )}
        </div>

        <div className="mt-8 border-t border-bone-deep/15 pt-5">
          <p className="text-[11px] uppercase tracking-widest text-bone-deep">
            Want to reach {profile.name.split(" ")[0]}?
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {!profile.contact.email.startsWith("PLACEHOLDER") && (
              <a
                href={`mailto:${profile.contact.email}`}
                className="inline-flex items-center gap-1.5 text-xs text-bone-dim transition hover:text-bone"
              >
                <Mail size={14} /> {profile.contact.email}
              </a>
            )}
            {!profile.contact.github.startsWith("PLACEHOLDER") && (
              <a
                href={profile.contact.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-bone-dim transition hover:text-bone"
              >
                <Github size={14} /> GitHub
              </a>
            )}
            {!profile.contact.linkedin.startsWith("PLACEHOLDER") && (
              <a
                href={profile.contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-bone-dim transition hover:text-bone"
              >
                <Linkedin size={14} /> LinkedIn
              </a>
            )}
            <button
              onClick={onContact}
              className="ml-auto rounded-full border border-blood/50 bg-blood/15 px-4 py-2 text-xs uppercase tracking-widest text-bone transition hover:bg-blood/30"
            >
              Contact Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
