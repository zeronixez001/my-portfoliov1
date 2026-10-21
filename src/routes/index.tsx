import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Adrian Montes — Portfolio" },
      { name: "description", content: "Professional portfolio of Adrian Montes, 4th year student at ICCT College, featuring projects from GitHub." },
      { property: "og:title", content: "Adrian Montes — Portfolio" },
      { property: "og:description", content: "Projects, skills and contact information of Adrian Montes, ICCT College." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Repo = { id: number; name: string; description: string | null; html_url: string; stargazers_count: number; forks_count: number; language: string | null; fork: boolean };
type User = { login: string; avatar_url: string; public_repos: number; followers: number; html_url: string };

const DEFAULT_USER = "zeronixez001";

const skills = [
  { group: "Languages", items: ["JavaScript", "Python", "Java", "SQL"] },
  { group: "Web", items: ["HTML & CSS", "React", "Tailwind CSS", "Node.js"] },
  { group: "Tools", items: ["Git & GitHub", "VS Code", "MySQL", "Figma"] },
];


function useRevealAndNav(setActive: (s: string) => void) {
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("revealed")), { threshold: 0.12 });
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    const nav = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("section[id]").forEach((el) => nav.observe(el));
    return () => { io.disconnect(); nav.disconnect(); };
  }, [setActive]);
}

function ScrollProgress({ onScroll }: { onScroll: (y: number) => void }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const f = () => { const h = document.documentElement; setP(h.scrollTop / (h.scrollHeight - h.clientHeight || 1)); onScroll(h.scrollTop); };
    window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f);
  }, [onScroll]);
  return <div className="fixed top-0 left-0 z-50 h-0.5 bg-accent transition-[width]" style={{ width: `${p * 100}%` }} />;
}

const roles = ["Web Developer", "Software Engineer", "Problem Solver", "Lifelong Learner"];
function Typewriter() {
  const [i, setI] = useState(0); const [t, setT] = useState(""); const [del, setDel] = useState(false);
  useEffect(() => {
    const w = roles[i % roles.length] ?? "";
    const id = setTimeout(() => {
      if (!del && t === w) return setDel(true);
      if (del && t === "") { setDel(false); return setI(i + 1); }
      setT(del ? w.slice(0, t.length - 1) : w.slice(0, t.length + 1));
    }, !del && t === w ? 1600 : del ? 40 : 90);
    return () => clearTimeout(id);
  }, [t, del, i]);
  return <span className="text-accent">{t}<span className="caret">|</span></span>;
}

function Counter({ to, label }: { to: number; label: string }) {
  const [n, setN] = useState(0); const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver((es) => { const e = es[0]; if (!e) return;
      if (!e.isIntersecting) return; io.disconnect();
      const start = performance.now();
      const step = (now: number) => { const k = Math.min(1, (now - start) / 1200); setN(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
    if (ref.current && to > 0) io.observe(ref.current); return () => io.disconnect();
  }, [to]);
  return <div ref={ref}><p className="font-heading text-4xl text-primary">{n}+</p><p className="mt-1 text-sm text-muted-foreground">{label}</p></div>;
}

function RepoCounter({ label }: { label: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    fetch(`https://api.github.com/users/${DEFAULT_USER}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => u && setN(Number(u.public_repos) || 0))
      .catch(() => {});
  }, []);
  return <Counter to={n} label={label} />;
}

function Tilt({ children, className, href }: { children: React.ReactNode; className?: string; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const move = (e: React.MouseEvent) => {
    const el = ref.current!; const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-2px)`;
    el.style.background = `radial-gradient(300px at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, color-mix(in oklab, var(--accent) 10%, var(--card)), var(--card))`;
  };
  const leave = () => { const el = ref.current!; el.style.transform = ""; el.style.background = ""; };
  return <a ref={ref} href={href} target="_blank" rel="noreferrer" onMouseMove={move} onMouseLeave={leave} className={className}>{children}</a>;
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const d = localStorage.getItem("theme") === "dark" || (!localStorage.getItem("theme") && matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(d); document.documentElement.classList.toggle("dark", d);
  }, []);
  const toggle = () => { const d = !dark; setDark(d); document.documentElement.classList.toggle("dark", d); localStorage.setItem("theme", d ? "dark" : "light"); };
  return (
    <button onClick={toggle} aria-label="Toggle dark mode" className="rounded-full border border-border px-3 py-1.5 text-sm transition hover:border-primary hover:text-primary">
      {dark ? "☀ Light" : "☾ Dark"}
    </button>
  );
}

function MusicButton() {
  const [on, setOn] = useState(false);
  const ref = useRef<{ ctx: AudioContext; master: GainNode; timer: number } | null>(null);
  const chords = [[261.63, 329.63, 392, 493.88], [220, 261.63, 329.63, 392], [174.61, 220, 261.63, 329.63], [196, 246.94, 293.66, 392]];
  const playChord = (ctx: AudioContext, master: GainNode, notes: number[]) => {
    const t = ctx.currentTime;
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = i === 0 ? "sine" : "triangle"; o.frequency.value = i === 0 ? f / 2 : f;
      o.detune.value = (Math.random() - 0.5) * 8;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.08, t + 2.5); g.gain.linearRampToValueAtTime(0, t + 8);
      o.connect(g).connect(master); o.start(t); o.stop(t + 8.2);
    });
  };
  const toggle = () => {
    if (on && ref.current) {
      const { ctx, master, timer } = ref.current; clearInterval(timer);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      setTimeout(() => ctx.close(), 1100); ref.current = null; setOn(false); return;
    }
    const ctx = new AudioContext(); const master = ctx.createGain(); const lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 1200;
    master.gain.setValueAtTime(0, ctx.currentTime); master.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 2);
    master.connect(lp).connect(ctx.destination);
    let i = 0; playChord(ctx, master, chords[0]!);
    const timer = window.setInterval(() => { i = (i + 1) % chords.length; playChord(ctx, master, chords[i]!); }, 6000);
    ref.current = { ctx, master, timer }; setOn(true);
  };
  useEffect(() => () => { if (ref.current) { clearInterval(ref.current.timer); ref.current.ctx.close(); } }, []);
  return (
    <button onClick={toggle} aria-label={on ? "Pause music" : "Play relaxing music"}
      className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm transition hover:border-primary hover:text-primary">
      {on ? (
        <span className="flex h-3 items-end gap-0.5">{[0, 1, 2].map((b) => <span key={b} className="w-0.5 animate-pulse bg-accent" style={{ height: `${6 + b * 3}px`, animationDelay: `${b * 0.2}s` }} />)}</span>
      ) : "♪"}
      {on ? "Pause" : "Music"}
    </button>
  );
}

function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      <div className="bg-grid-fixed absolute inset-0" />
      <div className="blob top-[-10%] left-[-10%] h-[45vw] w-[45vw] bg-accent" />
      <div className="blob right-[-10%] bottom-[-15%] h-[40vw] w-[40vw] bg-primary" style={{ animationDelay: "-8s" }} />
      <div className="blob top-[40%] left-[45%] h-[25vw] w-[25vw] bg-accent" style={{ animationDelay: "-15s", opacity: 0.2 }} />
    </div>
  );
}

function Heading({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="mb-10 flex items-baseline gap-4 border-b border-border pb-4">
      <span className="text-sm font-medium text-accent">{n}</span>
      <h2 className="text-3xl text-primary">{children}</h2>
    </div>
  );
}

function Projects() {
  const [input, setInput] = useState(DEFAULT_USER);
  const [username, setUsername] = useState(DEFAULT_USER);
  const [user, setUser] = useState<User | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lang, setLang] = useState("All");

  useEffect(() => {
    let off = false;
    setLoading(true); setError("");
    Promise.all([
      fetch(`https://api.github.com/users/${username}`).then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`).then((r) => r.json()),
    ]).then(([u, r]) => {
      if (off) return;
      setUser(u); setRepos(Array.isArray(r) ? r.filter((x: Repo) => !x.fork) : []); setLang("All");
    }).catch(() => !off && setError("GitHub user not found."))
      .finally(() => !off && setLoading(false));
    return () => { off = true; };
  }, [username]);

  const langs = ["All", ...(Array.from(new Set(repos.map((r) => r.language).filter(Boolean))) as string[])];
  const shown = lang === "All" ? repos : repos.filter((r) => r.language === lang);

  return (
    <section id="projects" data-reveal className="mx-auto max-w-5xl px-6 py-20">
      <Heading n="03">Projects</Heading>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {user && !error ? (
          <a href={user.html_url} target="_blank" rel="noreferrer" className="flex items-center gap-3">
            <img src={user.avatar_url} alt={user.login} className="h-12 w-12 rounded-full border border-border" />
            <div>
              <p className="font-medium text-primary">github.com/{user.login}</p>
              <p className="text-sm text-muted-foreground">{user.public_repos} repositories · {user.followers} followers</p>
            </div>
          </a>
        ) : <span />}
        <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) setUsername(input.trim()); }} className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="GitHub username"
            className="rounded border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary" />
          <button className="btn-primary">Load</button>
        </form>
      </div>

      {!loading && !error && langs.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {langs.map((l) => (
            <button key={l} onClick={() => setLang(l)}
              className={`rounded border px-3 py-1 text-xs font-medium transition ${l === lang ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}>{l}</button>
          ))}
        </div>
      )}

      {loading && <p className="text-muted-foreground">Loading projects…</p>}
      {error && <p className="text-destructive">{error}</p>}
      {!loading && !error && (
        <div className="grid gap-5 sm:grid-cols-2">
          {shown.map((r) => (
            <Tilt key={r.id} href={r.html_url} className="card-formal flex flex-col rounded p-6">
              <h3 className="text-lg text-primary">{r.name}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{r.description ?? "No description provided."}</p>
              <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                {r.language && <span className="font-medium text-accent">{r.language}</span>}
                <span>★ {r.stargazers_count}</span>
                <span>Forks {r.forks_count}</span>
              </div>
            </Tilt>
          ))}
          {shown.length === 0 && <p className="text-muted-foreground">No projects found.</p>}
        </div>
      )}
    </section>
  );
}

function Index() {
  const [active, setActive] = useState("");
  const [y, setY] = useState(0);
  useRevealAndNav(setActive);
  return (
    <main className="relative isolate">
      <Background />
      <ScrollProgress onScroll={setY} />
      {y > 500 && (
        <a href="#top" aria-label="Back to top" className="btn-primary fixed right-6 bottom-6 z-40 shadow-lg">↑</a>
      )}
      <nav className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="#top" className="font-heading text-lg text-primary">Adrian Montes</a>
          <div className="flex items-center gap-6">
          <div className="hidden gap-8 text-sm text-muted-foreground md:flex">
            {["about", "skills", "projects", "contact"].map((s) => (
              <a key={s} href={`#${s}`} className={`capitalize transition hover:text-primary ${active === s ? "font-medium text-primary underline decoration-accent decoration-2 underline-offset-8" : ""}`}>{s}</a>
            ))}
          </div>
          <MusicButton />
          <ThemeToggle />
          </div>
        </div>
      </nav>

      <header id="top" className="relative mx-auto grid max-w-5xl items-center gap-10 px-6 pt-20 pb-24 md:grid-cols-[1fr_240px] md:pt-28">
        <div className="hero-grid pointer-events-none absolute inset-0 -z-10" />
        <div className="animate-float pointer-events-none absolute top-24 right-6 -z-10 hidden h-64 w-64 rounded-full bg-accent/15 blur-3xl md:block" />
        <div>
          <p className="text-sm font-medium tracking-widest text-accent uppercase">Portfolio</p>
          <h1 className="mt-4 text-5xl leading-tight text-primary md:text-7xl">Adrian Montes</h1>
          <p className="mt-4 text-2xl font-heading md:text-3xl"><Typewriter /></p>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Fourth-year student at ICCT College, focused on building reliable, well-designed web applications.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="#projects" className="btn-primary">View Projects</a>
            <a href="#contact" className="btn-outline">Contact Me</a>
          </div>
          <div className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-border pt-8">
            <Counter to={4} label="Years of study" />
            <RepoCounter label="Projects on GitHub" />
            <Counter to={12} label="Technologies" />
          </div>
        </div>
        <div className="mx-auto w-full max-w-[180px] md:max-w-[220px]">
          <img src="/my-portfoliov1/adrian-montes.jpg" alt="Adrian Montes" className="aspect-[3/4] w-full rounded-2xl border border-border object-cover shadow-xl ring-1 ring-accent/30" />
        </div>
      </header>

      <section id="about" data-reveal className="mx-auto max-w-5xl px-6 py-20">
        <Heading n="01">About</Heading>
        <div className="grid gap-10 md:grid-cols-3">
          <p className="text-lg leading-relaxed md:col-span-2">
            I am a fourth-year student at ICCT College with a strong interest in software development.
            I enjoy turning ideas into practical applications, writing clean code, and continuously
            learning new technologies. I am currently seeking internship and entry-level opportunities.
          </p>
          <dl className="space-y-4 text-sm">
            <div><dt className="text-muted-foreground">Education</dt><dd className="font-medium">ICCT College — 4th Year</dd></div>
            <div><dt className="text-muted-foreground">Location</dt><dd className="font-medium">Philippines</dd></div>
            <div><dt className="text-muted-foreground">Status</dt><dd className="font-medium">Open to opportunities</dd></div>
          </dl>
        </div>
      </section>

      <section id="skills" data-reveal className="mx-auto max-w-5xl px-6 py-20">
        <Heading n="02">Skills</Heading>
        <div className="grid gap-5 md:grid-cols-3">
          {skills.map((s) => (
            <div key={s.group} className="card-formal rounded p-6">
              <h3 className="text-primary">{s.group}</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {s.items.map((i) => <li key={i} className="flex items-center gap-2 transition hover:translate-x-1 hover:text-primary"><span className="h-1.5 w-1.5 rounded-full bg-accent" />{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <Projects />

      <section id="contact" data-reveal className="mx-auto max-w-5xl px-6 py-20">
        <Heading n="04">Contact</Heading>
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="text-lg text-muted-foreground">
              I welcome inquiries regarding internships, collaborations, and employment opportunities.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <a href="mailto:zeronixez001@gmail.com" className="text-accent hover:underline">zeronixez001@gmail.com</a>
              <a href="https://github.com/zeronixez001" target="_blank" rel="noreferrer" className="text-accent hover:underline">github.com/zeronixez001</a>
            </div>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget);
              window.location.href = `mailto:zeronixez001@gmail.com?subject=${encodeURIComponent(`Message from ${f.get("name")}`)}&body=${encodeURIComponent(String(f.get("msg")))}`; }}
            className="space-y-3">
            <input name="name" required placeholder="Your name" className="w-full rounded border border-input bg-card px-3 py-2 outline-none focus:border-primary" />
            <textarea name="msg" required rows={4} placeholder="Your message" className="w-full rounded border border-input bg-card px-3 py-2 outline-none focus:border-primary" />
            <button className="btn-primary">Send Message</button>
          </form>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Adrian Montes
      </footer>
    </main>
  );
}
