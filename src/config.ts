export const site = {
  name: 'Paramveer Singh',
  firstName: 'Paramveer',
  role: 'Full-Stack Developer & Agentic AI Engineer',
  tagline: 'Full-stack developer and agentic AI engineer with a strong backend focus — building scalable web apps, RAG pipelines and LLM agents.',
  location: 'Durgapur, India',
  timezone: 'IST',
  email: 'sparamveer1001@gmail.com',
  phone: '+917488287651',
  phoneDisplay: '+91 74882 87651',
  website: 'https://paramveer.me',
  github: 'https://github.com/paramcodes',
  availability: 'Open to internships, freelance & full-time roles',
  resumeUrl: '/Paramveer_Singh_resume_.pdf',
};

export const socials = [
  { label: 'GitHub', href: 'https://github.com/paramcodes', icon: 'github' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/paramveer-singh-2b619a296/', icon: 'linkedin' },
  { label: 'Twitter / X', href: 'http://x.com/Your_PARAM/', icon: 'x' },
  { label: 'Website', href: 'https://paramveer.me', icon: 'globe' },
  { label: 'Email', href: 'mailto:sparamveer1001@gmail.com', icon: 'mail' },
];

export const nav = [
  { label: 'Work', href: '/#work' },
  { label: 'About', href: '/#about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Shelf', href: '/shelf' },
  { label: 'OSS', href: '/oss' },
  { label: 'Contact', href: '/#contact' },
];

export const stats = [
  { value: 500, suffix: '+', label: 'DSA problems solved' },
  { value: 50, suffix: '+', label: 'Contributors mentored' },
  { value: 50, suffix: '+', label: 'PRs reviewed & merged' },
  { value: 1459, suffix: '', label: 'LeetCode peak rating' },
];

export const marquee = [
  'TypeScript', 'Python', 'Next.js', 'Node.js', 'Fastify', 'PostgreSQL',
  'pgvector', 'Docker', 'AWS', 'Terraform', 'RAG Systems', 'Gemini API',
];

export type Project = {
  title: string;
  category: string;
  description: string;
  tags: string[];
  year: string;
  href: string;
  demo?: string;
  gradient: string;
  emoji: string;
  featured?: boolean;
  span?: 'wide' | 'tall' | 'normal';
};

export const projects: Project[] = [
  {
    title: 'ATLAS RAG API',
    category: 'RAG System',
    description: 'Production-grade RAG service with RAPTOR hierarchical indexing (UMAP + HDBSCAN), vector + BM25 search fused via RRF, Jina reranking and Gemini 2.0 Flash answers with citations. Containerized microservices with Prometheus + Grafana observability.',
    tags: ['Fastify', 'pgvector', 'RAPTOR', 'Jina AI', 'Docker'],
    year: '2025',
    href: 'https://github.com/paramcodes/rag-agent-api',
    gradient: 'from-violet-600 via-fuchsia-500 to-orange-400',
    emoji: '◈',
    featured: true,
    span: 'wide',
  },
  {
    title: 'Junior Doctor',
    category: 'AI Agent',
    description: 'Clinical document agent turning scanned patient records into structured discharge summaries. OCR fallback, deterministic reconciliation, medication-conflict detection and full provenance — every fact traces to source doc, page and text.',
    tags: ['Python', 'Gemini API', 'PyMuPDF', 'Pydantic'],
    year: '2025',
    href: 'https://github.com/paramcodes/junior-doctor',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    emoji: '⬢',
    featured: true,
    span: 'tall',
  },
  {
    title: 'Distributed Inference on AWS',
    category: 'Cloud / DevOps',
    description: 'Multi-EC2 model inference pipeline built for Alchemyst AI — private-subnet networking, RPC worker coordination, Terraform provisioning and honest latency trade-off docs under t3.micro constraints.',
    tags: ['AWS', 'Terraform', 'Python', 'RPC'],
    year: '2025',
    href: 'https://github.com/paramcodes/devops-infra',
    gradient: 'from-amber-400 via-rose-500 to-purple-600',
    emoji: '⬣',
    featured: true,
    span: 'normal',
  },
  {
    title: 'Taurus AI Chat',
    category: 'AI Web App',
    description: 'Lightweight AI assistant with streaming UX, rich Markdown (tables, math, code), syntax highlighting with one-click copy and local chat history. Live in production.',
    tags: ['Next.js', 'Google GenAI', 'Tailwind'],
    year: '2025',
    href: 'https://github.com/paramcodes/Taurus',
    demo: 'https://taurus-smoky-eight.vercel.app',
    gradient: 'from-sky-400 via-blue-600 to-indigo-800',
    emoji: '◇',
    span: 'normal',
  },
  {
    title: 'Evolve — ATS Resume Analyzer',
    category: 'AI Web App',
    description: 'Resume analyzer scoring against 8+ ATS criteria — keyword density, formatting, section completeness — with 5+ actionable fixes per resume and a 0–100 recruiter-simulation score. Live in production.',
    tags: ['Next.js', 'Google GenAI'],
    year: '2025',
    href: 'https://github.com/paramcodes/Evolve',
    demo: 'https://evolve-green-five.vercel.app',
    gradient: 'from-lime-300 via-emerald-500 to-teal-700',
    emoji: '◎',
    span: 'wide',
  },
  {
    title: 'SmartNotes',
    category: 'Web App',
    description: 'Type-safe note-taking app (98% TypeScript) — rich-text editing, organization, search and Gemini-assisted workflows on Supabase Postgres. Clean, modular, tested.',
    tags: ['Next.js', 'Supabase', 'Gemini API'],
    year: '2025',
    href: 'https://github.com/paramcodes/smartnotes',
    demo: 'https://smartnotes-blue.vercel.app',
    gradient: 'from-zinc-500 via-neutral-700 to-black',
    emoji: '▣',
    span: 'normal',
  },
];

export const services = [
  {
    icon: '◐',
    title: 'Backend Engineering',
    text: 'APIs that hold up under load — clean architecture, strict types, and databases modeled right the first time.',
    points: ['Node.js · Fastify · Express · Django', 'PostgreSQL · MongoDB · pgvector', 'Auth, caching & background jobs'],
  },
  {
    icon: '◑',
    title: 'AI Agents & RAG',
    text: 'From naive chatbot to grounded system: hierarchical indexing, fused retrieval, rerankers and provenance you can audit.',
    points: ['RAG + RAPTOR pipelines', 'Agents with tool use & evals', 'Gemini · Jina · pgvector'],
  },
  {
    icon: '◒',
    title: 'DevOps & Cloud',
    text: 'Reproducible infra and pipelines — provisioned as code, observed with dashboards, deployed with zero downtime.',
    points: ['AWS · Terraform · Docker', 'GitHub Actions CI/CD', 'Prometheus · Grafana'],
  },
  {
    icon: '◓',
    title: 'Full-Stack Web Apps',
    text: 'Next.js products end to end — from schema to deploy — fast, type-safe and easy for teams to extend.',
    points: ['Next.js · TypeScript · Tailwind', 'Supabase & Postgres', 'SEO & Core Web Vitals'],
  },
];

export const experience = [
  {
    period: '2025 — Present',
    role: 'Independent AI Engineer',
    company: 'Building in public',
    location: 'Durgapur, India · Remote',
    text: 'Designing and shipping AI systems in the open: a RAPTOR-indexed RAG API with full observability, a clinical document agent with provenance tracking, and distributed inference infra on AWS.',
    tags: ['RAG', 'LLM Agents', 'AWS'],
  },
  {
    period: 'Oct 2024 — Nov 2024',
    role: 'Open Source Maintainer / Project Admin',
    company: "GSSoC '24",
    location: 'Remote',
    text: 'Led an open-source web platform with 50+ contributors. Reviewed and merged 50+ PRs, ran CI/CD with GitHub Actions at zero downtime, and mentored contributors in React, Node.js and Git workflows.',
    tags: ['Node.js', 'GitHub Actions', 'Mentorship'],
  },
  {
    period: '2023 — Present',
    role: 'B.Tech, Computer Science',
    company: 'Bengal College of Engineering and Technology',
    location: 'Durgapur · CGPA 7.3/10',
    text: 'Core CS fundamentals plus 500+ DSA problems across platforms — LeetCode peak 1459, CodeChef 1300. The problem-solving base behind everything above.',
    tags: ['DSA', 'Systems', 'Problem Solving'],
  },
];

export const skills = [
  { name: 'TypeScript / JavaScript', level: 94 },
  { name: 'Python', level: 92 },
  { name: 'React / Next.js', level: 90 },
  { name: 'Node.js / Fastify', level: 90 },
  { name: 'PostgreSQL & pgvector', level: 88 },
  { name: 'RAG & LLM Pipelines', level: 92 },
  { name: 'Docker / AWS / Terraform', level: 85 },
  { name: 'DSA & Problem Solving', level: 90 },
];

export const achievements = [
  {
    value: '500+',
    title: 'DSA problems solved',
    text: 'Across LeetCode, CodeChef and competitive programming platforms.',
  },
  {
    value: '1459',
    title: 'LeetCode peak rating',
    text: 'With a 1300 CodeChef rating alongside — consistency, not luck.',
  },
  {
    value: '50+',
    title: 'Contributors mentored',
    text: 'As GSSoC ’24 project admin — 50+ PRs reviewed, merged and shipped.',
  },
  {
    value: '7.3',
    title: 'CGPA · B.Tech CSE',
    text: 'Computer Science at Bengal College of Engineering and Technology.',
  },
];

export const faqs = [
  {
    q: 'Are you available for work?',
    a: 'Yes — open to internships, freelance projects and full-time backend / AI engineering roles. I reply within 24 hours.',
  },
  {
    q: 'What is your core stack?',
    a: 'TypeScript + Python. Next.js and Fastify/Express on the backend, PostgreSQL/pgvector for data, Docker + AWS + Terraform for infra — and RAG/agent pipelines with Gemini and Jina.',
  },
  {
    q: 'Do you contribute to open source?',
    a: 'Yes — I was a GSSoC ’24 project admin leading 50+ contributors, and most of my AI systems work is public on GitHub.',
  },
  {
    q: 'Can I see your résumé?',
    a: 'Absolutely — hit the “Download résumé” button or email me and I’ll share it right over.',
  },
];
