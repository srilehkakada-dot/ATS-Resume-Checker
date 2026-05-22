import { ResumeData } from '../data/mockData';

interface ResumeTemplatesProps {
  data: ResumeData;
  template: 'modern' | 'executive' | 'creative' | 'emerald';
  colorTheme: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate' | 'gold';
  fontFamily: 'sans' | 'serif' | 'mono';
  spacing: 'compact' | 'comfortable' | 'loose';
  showPhoto: boolean;
  atsOptimized: boolean;
}

export function ResumeTemplates({
  data,
  template,
  colorTheme,
  fontFamily,
  spacing,
  showPhoto,
  atsOptimized,
}: ResumeTemplatesProps) {
  // Theme styling helpers
  const getColorClass = () => {
    if (atsOptimized) return { text: 'text-slate-800', border: 'border-slate-300', bg: 'bg-slate-100', bullet: 'text-slate-600' };
    
    switch (colorTheme) {
      case 'indigo':
        return { text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-50 dark:bg-indigo-950/40', bullet: 'text-indigo-500' };
      case 'emerald':
        return { text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-50 dark:bg-emerald-950/40', bullet: 'text-emerald-500' };
      case 'amber':
        return { text: 'text-amber-500 dark:text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-50 dark:bg-amber-950/40', bullet: 'text-amber-500' };
      case 'rose':
        return { text: 'text-rose-500 dark:text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-50 dark:bg-rose-950/40', bullet: 'text-rose-500' };
      case 'gold':
        return { text: 'text-amber-600 dark:text-amber-300', border: 'border-amber-600/30', bg: 'bg-amber-50 dark:bg-amber-950/30', bullet: 'text-amber-600' };
      case 'slate':
      default:
        return { text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-600/35', bg: 'bg-slate-150 dark:bg-slate-800/40', bullet: 'text-slate-500' };
    }
  };

  const colors = getColorClass();

  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono text-sm';
      case 'sans':
      default:
        return 'font-sans';
    }
  };

  const getSpacingClass = () => {
    switch (spacing) {
      case 'compact':
        return { y: 'space-y-2', itemY: 'space-y-1', py: 'py-1', px: 'px-2', my: 'my-1', font: 'text-[13px] leading-relaxed' };
      case 'loose':
        return { y: 'space-y-6', itemY: 'space-y-3', py: 'py-3', px: 'px-5', my: 'my-4', font: 'text-[15px] leading-loose' };
      case 'comfortable':
      default:
        return { y: 'space-y-4', itemY: 'space-y-2', py: 'py-2', px: 'px-4', my: 'my-2.5', font: 'text-[14px] leading-relaxed' };
    }
  };

  const dim = getSpacingClass();
  const fontClass = getFontFamilyClass();

  // If ATS Hardened is toggled, override formatting to a clean standardized ATS-readable schema
  if (atsOptimized) {
    return (
      <div className={`p-8 bg-white text-slate-800 text-left ${fontClass} leading-normal text-sm w-full max-w-4xl mx-auto shadow-inner`}>
        {/* ATS Header - strictly simple list, centered/left, no grid */}
        <div className="border-b border-slate-300 pb-3 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-900">{data.name}</h1>
          <p className="text-base font-semibold text-slate-700">{data.title}</p>
          <div className="text-xs text-slate-600 mt-1.5 flex flex-wrap justify-center gap-x-3">
            <span>{data.email}</span>
            <span>|</span>
            <span>{data.phone}</span>
            <span>|</span>
            <span>{data.location}</span>
            {data.website && (
              <>
                <span>|</span>
                <span>{data.website}</span>
              </>
            )}
          </div>
        </div>

        {/* ATS Summary */}
        <div className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">Professional Summary</h2>
          <p className="text-xs text-slate-700 mt-1">{data.summary}</p>
        </div>

        {/* ATS Skills */}
        <div className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">Skills</h2>
          <p className="text-xs text-slate-700 mt-1 font-semibold">{data.skills.join(', ')}</p>
        </div>

        {/* ATS Experience */}
        <div className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">Professional Experience</h2>
          <div className="space-y-3 mt-1.5">
            {data.experience.map((exp, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs font-bold text-slate-900">
                  <span>{exp.role}</span>
                  <span>{exp.duration}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-700 italic">
                  <span>{exp.company}</span>
                  <span>{exp.location}</span>
                </div>
                <ul className="list-disc pl-5 mt-1 text-xs text-slate-600 space-y-0.5">
                  {exp.bullets.map((bullet, bIdx) => (
                    <li key={bIdx}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ATS Education */}
        <div className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">Education</h2>
          <div className="space-y-2 mt-1.5">
            {data.education.map((edu, idx) => (
              <div key={idx} className="flex justify-between text-xs text-slate-800">
                <div>
                  <span className="font-bold">{edu.degree}</span> - <span className="italic">{edu.school}</span>
                  {edu.gpa && <span className="text-slate-500 ml-2">(GPA: {edu.gpa})</span>}
                </div>
                <span className="font-bold">{edu.duration}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ATS Projects */}
        {data.projects && data.projects.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">Projects</h2>
            <div className="space-y-2 mt-1.5">
              {data.projects.map((proj, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{proj.name}</span>
                    <span className="font-normal text-slate-600 italic">Technologies: {proj.technologies}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ATS Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">Certifications</h2>
            <ul className="list-disc pl-5 mt-1 text-xs text-slate-600 space-y-0.5">
              {data.certifications.map((cert, idx) => (
                <li key={idx}>{cert}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 pt-3 border-t border-slate-100 text-center text-[10px] text-slate-400">
          This document is generated in single-column text format, fully optimized for parsing systems.
        </div>
      </div>
    );
  }

  // Otherwise, render full trending responsive interactive templates:

  // --- 1. MODERN TECH TEMPLATE ---
  if (template === 'modern') {
    return (
      <div className={`p-8 bg-slate-950 text-slate-200 text-left ${fontClass} ${dim.font} w-full max-w-4xl mx-auto shadow-2xl rounded-lg border border-slate-800/80`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            {showPhoto && (
              <div className="h-16 w-16 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-purple-500/20">
                {data.name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                {data.name}
              </h1>
              <p className={`text-base font-semibold ${colors.text} mt-0.5`}>{data.title}</p>
            </div>
          </div>
          <div className="text-right text-xs space-y-1 text-slate-400 md:self-end">
            <p className="flex items-center gap-1 justify-start md:justify-end">📧 {data.email}</p>
            <p className="flex items-center gap-1 justify-start md:justify-end">📞 {data.phone}</p>
            <p className="flex items-center gap-1 justify-start md:justify-end">📍 {data.location}</p>
            {data.website && <p className="flex items-center gap-1 justify-start md:justify-end">🌐 {data.website}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Info Columns */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-100 mb-2 pb-1 border-b border-slate-850">
                Summary
              </h3>
              <p className="text-slate-350">{data.summary}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-100 pb-1 border-b border-slate-850">
                Experience
              </h3>
              <div className={dim.y}>
                {data.experience.map((exp, idx) => (
                  <div key={idx} className="group relative pl-4 border-l-2 border-slate-800 hover:border-indigo-500 transition-colors">
                    <div className="absolute -left-[6px] top-1.5 h-2.5 w-2.5 rounded-full bg-slate-800 group-hover:bg-indigo-500 transition-colors" />
                    <div className="flex justify-between items-baseline flex-wrap">
                      <h4 className="font-bold text-slate-100 text-sm">{exp.role}</h4>
                      <span className="text-xs font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full">{exp.duration}</span>
                    </div>
                    <div className="text-xs text-slate-400 font-semibold mb-1">
                      {exp.company} — <span className="font-normal italic">{exp.location}</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-350 text-xs mt-1.5">
                      {exp.bullets.map((bullet, bIdx) => (
                        <li key={bIdx}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Columns */}
          <div className="space-y-6">
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-100 mb-3">
                Core Competencies
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700/30 hover:border-indigo-500/50 transition-all"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-100 border-b border-slate-800 pb-1.5">
                Education
              </h3>
              {data.education.map((edu, idx) => (
                <div key={idx} className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-200">{edu.degree}</h4>
                  <p className="text-[11px] text-slate-400">{edu.school}</p>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{edu.duration}</span>
                    {edu.gpa && <span>GPA: {edu.gpa}</span>}
                  </div>
                </div>
              ))}
            </div>

            {data.projects && data.projects.length > 0 && (
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-100 border-b border-slate-800 pb-1.5">
                  Featured Projects
                </h3>
                {data.projects.map((proj, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-200">
                      <span>{proj.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{proj.description}</p>
                    <p className={`text-[10px] ${colors.text} font-mono`}>{proj.technologies}</p>
                  </div>
                ))}
              </div>
            )}

            {data.certifications && data.certifications.length > 0 && (
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-100 mb-2">
                  Credentials
                </h3>
                <ul className="text-[11px] text-slate-400 space-y-1 list-none pl-0">
                  {data.certifications.map((cert, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className={`${colors.text}`}>✓</span> {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- 2. EXECUTIVE GOLD TEMPLATE ---
  if (template === 'executive') {
    return (
      <div className={`p-10 bg-zinc-900 text-zinc-200 text-left ${fontClass} ${dim.font} w-full max-w-4xl mx-auto shadow-2xl rounded-lg border-t-4 border-amber-600/80`}>
        <div className="text-center pb-8 border-b border-zinc-800">
          <h1 className="text-3xl font-serif tracking-wide text-amber-500 uppercase">{data.name}</h1>
          <p className="text-sm font-light tracking-widest text-zinc-400 uppercase mt-1">{data.title}</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-zinc-400 mt-3 max-w-xl mx-auto italic">
            <span>{data.email}</span>
            <span>•</span>
            <span>{data.phone}</span>
            <span>•</span>
            <span>{data.location}</span>
            {data.website && (
              <>
                <span>•</span>
                <span>{data.website}</span>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-8">
          {/* Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <h3 className="text-xs font-bold tracking-widest uppercase text-amber-500 md:text-right md:pr-4 pt-1">
              Executive Profile
            </h3>
            <div className="md:col-span-3 text-zinc-300">
              <p className="italic leading-relaxed">{data.summary}</p>
            </div>
          </div>

          {/* Experience Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <h3 className="text-xs font-bold tracking-widest uppercase text-amber-500 md:text-right md:pr-4 pt-1">
              Career History
            </h3>
            <div className="md:col-span-3 space-y-6">
              {data.experience.map((exp, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-sm font-bold text-zinc-150">{exp.role}</h4>
                    <span className="text-xs font-mono text-amber-500/80">{exp.duration}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400 font-semibold italic">
                    <span>{exp.company}</span>
                    <span>{exp.location}</span>
                  </div>
                  <ul className="list-disc pl-4 text-xs text-zinc-400 space-y-1 mt-1.5">
                    {exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="marker:text-amber-600/70">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <h3 className="text-xs font-bold tracking-widest uppercase text-amber-500 md:text-right md:pr-4 pt-1">
              Core Expertise
            </h3>
            <div className="md:col-span-3">
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded bg-zinc-800 text-zinc-350 border border-zinc-700/50 hover:bg-zinc-700 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Education & Credentials */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <h3 className="text-xs font-bold tracking-widest uppercase text-amber-500 md:text-right md:pr-4 pt-1">
              Education & Certs
            </h3>
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Academic Background</h4>
                {data.education.map((edu, idx) => (
                  <div key={idx} className="text-xs text-zinc-300">
                    <p className="font-bold">{edu.degree}</p>
                    <p className="text-zinc-400 text-[11px]">{edu.school} | {edu.duration}</p>
                    {edu.gpa && <p className="text-zinc-500 text-[10px]">GPA: {edu.gpa}</p>}
                  </div>
                ))}
              </div>

              {data.certifications && data.certifications.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Certifications</h4>
                  <ul className="text-xs text-zinc-300 space-y-1 list-none pl-0">
                    {data.certifications.map((cert, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-500">🏆</span>
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Projects (if exists) */}
          {data.projects && data.projects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              <h3 className="text-xs font-bold tracking-widest uppercase text-amber-500 md:text-right md:pr-4 pt-1">
                Initiatives
              </h3>
              <div className="md:col-span-3 space-y-3">
                {data.projects.map((proj, idx) => (
                  <div key={idx} className="text-xs">
                    <p className="font-bold text-zinc-200">{proj.name}</p>
                    <p className="text-zinc-400 text-[11px]">{proj.description}</p>
                    <p className="text-[10px] text-amber-500/70 mt-0.5 font-mono">{proj.technologies}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- 3. CREATIVE NEON TEMPLATE ---
  if (template === 'creative') {
    return (
      <div className={`p-8 bg-zinc-950 text-slate-100 text-left ${fontClass} ${dim.font} w-full max-w-4xl mx-auto shadow-2xl rounded-2xl border border-indigo-500/30 relative overflow-hidden`}>
        {/* Glow backdrop decorative */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row gap-6 pb-6 border-b border-indigo-950">
          {showPhoto && (
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center p-1 shadow-lg shadow-indigo-500/20 self-center md:self-start">
              <div className="h-full w-full rounded-full bg-zinc-950 flex items-center justify-center text-indigo-400 text-3xl font-extrabold">
                {data.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          )}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {data.name}
            </h1>
            <p className="text-md font-semibold text-slate-300 mt-0.5 tracking-wide">{data.title}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3 text-xs text-indigo-300/80">
              <span className="bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-800/40">📧 {data.email}</span>
              <span className="bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-800/40">📞 {data.phone}</span>
              <span className="bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-800/40">📍 {data.location}</span>
              {data.website && <span className="bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-800/40">🌐 {data.website}</span>}
            </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" /> Core Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-950/30 text-indigo-300 border border-indigo-900/40"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" /> Education
              </h3>
              {data.education.map((edu, idx) => (
                <div key={idx} className="text-xs bg-zinc-900/50 p-3 rounded-lg border border-indigo-950/40 space-y-1">
                  <h4 className="font-bold text-slate-200">{edu.degree}</h4>
                  <p className="text-slate-400 text-[11px]">{edu.school}</p>
                  <p className="text-[10px] text-purple-400">{edu.duration} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}</p>
                </div>
              ))}
            </div>

            {data.certifications && data.certifications.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-pink-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-400" /> Credentials
                </h3>
                <div className="bg-zinc-900/50 p-3 rounded-lg border border-indigo-950/40 text-[11px] text-slate-400 space-y-1.5">
                  {data.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-start gap-1">
                      <span className="text-pink-400">✧</span>
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> Professional Bio
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-zinc-900/30 p-3 rounded-xl border border-indigo-950/30 italic">
                {data.summary}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> Experience Narrative
              </h3>
              <div className="space-y-4">
                {data.experience.map((exp, idx) => (
                  <div key={idx} className="bg-zinc-900/40 p-4 rounded-xl border border-indigo-950/30 space-y-2 hover:border-indigo-500/30 transition-colors">
                    <div className="flex justify-between items-baseline flex-wrap gap-1">
                      <h4 className="font-bold text-slate-100 text-sm">{exp.role}</h4>
                      <span className="text-[10px] text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-900/40 font-mono">{exp.duration}</span>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold">{exp.company} — <span className="font-normal italic">{exp.location}</span></p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                      {exp.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="marker:text-indigo-400">{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {data.projects && data.projects.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> Notable Ventures
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.projects.map((proj, idx) => (
                    <div key={idx} className="p-3 bg-zinc-900/40 rounded-xl border border-indigo-950/30 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-slate-100">{proj.name}</h4>
                        <p className="text-[11px] text-slate-450 mt-1 leading-snug">{proj.description}</p>
                      </div>
                      <p className="text-[9px] text-indigo-400 font-mono mt-2 bg-indigo-950/40 py-0.5 px-2 rounded-md self-start border border-indigo-900/20">{proj.technologies}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- 4. CLEAN PROFESSIONAL (EMERALD) ---
  return (
    <div className={`p-8 bg-zinc-900 text-slate-300 text-left ${fontClass} ${dim.font} w-full max-w-4xl mx-auto shadow-2xl rounded-lg border-l-8 border-emerald-600`}>
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-emerald-950/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide">{data.name}</h1>
          <p className="text-sm font-semibold tracking-wider text-emerald-500 uppercase mt-0.5">{data.title}</p>
        </div>
        <div className="text-xs text-slate-400 space-y-1">
          <p>💼 {data.email}</p>
          <p>📞 {data.phone}</p>
          <p>📍 {data.location}</p>
          {data.website && <p>🔗 {data.website}</p>}
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2 border-b border-emerald-950/80 pb-1">
            Professional Summary
          </h3>
          <p className="text-slate-300 text-xs leading-relaxed">{data.summary}</p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 border-b border-emerald-950/80 pb-1">
            Skills Inventory
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {data.skills.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-1 text-xs text-slate-350">
                <span className="text-emerald-500">✦</span>
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 border-b border-emerald-950/80 pb-1">
            Work Experience
          </h3>
          <div className="space-y-4">
            {data.experience.map((exp, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-baseline flex-wrap">
                  <h4 className="text-xs font-bold text-white uppercase">{exp.role}</h4>
                  <span className="text-[11px] text-emerald-500 font-semibold">{exp.duration}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span className="font-semibold italic">{exp.company}</span>
                  <span>{exp.location}</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-350 text-[11px] mt-1">
                  {exp.bullets.map((bullet, bIdx) => (
                    <li key={bIdx}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2 border-b border-emerald-950/80 pb-1">
              Education
            </h3>
            {data.education.map((edu, idx) => (
              <div key={idx} className="text-xs text-slate-300">
                <p className="font-bold text-slate-200">{edu.degree}</p>
                <p className="text-slate-400 text-[11px]">{edu.school} ({edu.duration})</p>
                {edu.gpa && <p className="text-slate-500 text-[10px]">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </div>

          {data.certifications && data.certifications.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2 border-b border-emerald-950/80 pb-1">
                Certifications
              </h3>
              <ul className="text-xs text-slate-400 space-y-1 list-none pl-0">
                {data.certifications.map((cert, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
