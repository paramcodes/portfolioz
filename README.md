# Yunhi — Portfolio

A premium, Awwwards-grade portfolio built with [Astro 5](https://astro.build) + Tailwind CSS v4. Dark-first, fast, responsive, SEO-ready.

## Quick start

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/
npm run preview
```

## Rebrand in 60 seconds

All content lives in one file: **`src/config.ts`**

- Name, role, location, email, socials
- Hero stats, marquee logos
- Services, projects, experience, skills, testimonials

Edit that file, rebuild, done. No hunting through components.

## Structure

```
src/
  config.ts          # ← edit me
  layouts/Base.astro # SEO, fonts, nav, footer, global JS
  components/        # Hero, About, Services, Projects, Experience, Skills, Testimonials, Contact, etc.
  pages/index.astro  # composition
  styles/global.css  # Tailwind v4 theme + custom utilities
```

## Features

- Aurora hero, grain, glow cursor, magnetic buttons
- Reveal-on-scroll, animated counters, spotlight cards
- Filterable bento project grid, sticky experience timeline
- Marquee, mobile menu, active-section nav, back-to-top
- Light/dark theme toggle (dark default), custom scrollbar, selection
- SEO meta + OG tags, sitemap-ready, 404 page, accessible markup
