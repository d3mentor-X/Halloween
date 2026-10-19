// Contact card modal — shows Waleed's contact details from the data file.
// Placeholder values are hidden and clearly labeled so visitors know links
// are not yet set.

import { profile } from "@/data/portfolio";
import { X, Mail, Github, Linkedin, Skull } from "lucide-react";

interface Props {
  onClose: () => void;
}

export function ContactCard({ onClose }: Props) {
  const isPlaceholder = (v: string) => v.startsWith("PLACEHOLDER");

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 px-4 backdrop-blur-sm">
      <div className="rise w-full max-w-md rounded-2xl border border-bone-deep/30 bg-[#0b0d12]/95 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skull size={20} className="text-blood" />
            <h2 className="font-display text-xl text-bone">Contact</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-bone-dim transition hover:bg-white/5 hover:text-bone"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mt-4 font-display text-lg text-bone">{profile.name}</p>
        <p className="mt-1 text-xs leading-relaxed text-bone-dim">{profile.intro}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {profile.skills.map((s) => (
            <span key={s} className="rounded-full border border-bone-deep/25 px-3 py-1 text-[10px] uppercase tracking-widest text-bone-dim">
              {s}
            </span>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          {!isPlaceholder(profile.contact.email) ? (
            <a href={`mailto:${profile.contact.email}`} className="flex items-center gap-2 rounded-xl border border-bone-deep/20 bg-white/[0.02] px-4 py-3 text-sm text-bone transition hover:border-bone-dim/50">
              <Mail size={16} className="text-blood" /> {profile.contact.email}
            </a>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-bone-deep/20 bg-white/[0.02] px-4 py-3 text-sm text-bone-deep">
              <Mail size={16} /> Email — link not set yet
            </div>
          )}
          {!isPlaceholder(profile.contact.github) ? (
            <a href={profile.contact.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-bone-deep/20 bg-white/[0.02] px-4 py-3 text-sm text-bone transition hover:border-bone-dim/50">
              <Github size={16} className="text-blood" /> GitHub
            </a>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-bone-deep/20 bg-white/[0.02] px-4 py-3 text-sm text-bone-deep">
              <Github size={16} /> GitHub — link not set yet
            </div>
          )}
          {!isPlaceholder(profile.contact.linkedin) ? (
            <a href={profile.contact.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-bone-deep/20 bg-white/[0.02] px-4 py-3 text-sm text-bone transition hover:border-bone-dim/50">
              <Linkedin size={16} className="text-blood" /> LinkedIn
            </a>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-bone-deep/20 bg-white/[0.02] px-4 py-3 text-sm text-bone-deep">
              <Linkedin size={16} /> LinkedIn — link not set yet
            </div>
          )}
        </div>

        <p className="mt-4 text-[11px] text-bone-deep">
          Links marked "not set yet" are placeholders. Waleed can fill them in by editing
          the contact section of the data file.
        </p>
      </div>
    </div>
  );
}
