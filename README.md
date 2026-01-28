# SYNAPSIS Website

Public website for the **SYNAPSIS** project — a privacy-aware audiovisual data platform for SSH (Social Sciences & Humanities) research, funded by NWO Thematic Digital Competence Centers (TDCC-SSH-C2024-011).

**Live site:** [babajideowoyele.codeberg.page/synapsis-website](https://babajideowoyele.codeberg.page/synapsis-website/)
**Mirror:** [babajideowoyele.github.io/synapsis-website](https://babajideowoyele.github.io/synapsis-website/)

## Quick Start

```bash
npm install
npm run serve
```

Opens at `http://localhost:8080`. Changes auto-reload.

## Build

```bash
npm run build
```

Output goes to `_site/`.

## Project Structure

```
synapsis-website/
├── _includes/              # Shared Eleventy layouts
│   ├── base.njk            # Main page layout (head, header, footer)
│   └── survey.njk          # Survey section layout
├── _data/
│   └── eleventyComputed.js # Preserves .html file extensions
├── survey/                 # Survey section pages (1-10)
├── assets/                 # Images, videos, logos
│   ├── Input_Videos/       # Original demo videos
│   ├── Output_MaskedVideos/# Masked demo videos
│   ├── logos/              # Partner logos
│   └── team/               # Team photos
├── downloads/              # Downloadable templates (consent forms, DMP)
├── demos/                  # Demo-related assets
├── theme.css               # Light/dark mode CSS variables
├── theme.js                # Theme toggle logic
├── main.js                 # Scroll reveal, mobile menu, stat counters
├── search.js               # Ctrl+K search overlay
├── search-index.json       # Search index data
├── eleventy.config.js      # Eleventy configuration
└── *.html                  # Page content files
```

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Landing page with project overview |
| Platform | `platform.html` | MaskAnyone toolkit features |
| Demo | `demo.html` | Before/after video masking demos |
| Training | `training.html` | Workshops and event registration |
| Resources | `resources.html` | Documentation, FAQ, downloads |
| Network | `network.html` | Consortium partners and roles |
| Press | `press.html` | Publications and team quotes |
| Survey | `survey.html` | Community survey landing page |
| Survey Sections | `survey/survey-section[1-10].html` | 10-part survey form |

## How It Works

The site uses [Eleventy (11ty)](https://www.11ty.dev/) as a static site generator with Nunjucks templating.

- **Shared layouts** (`_includes/base.njk`, `_includes/survey.njk`) define the HTML shell: `<head>`, header/nav, footer, and shared styles
- **Page files** contain only their unique content with YAML front matter:

```html
---
layout: base.njk
title: Page Title
activeNav: Demo
---
<style>
    /* page-specific styles */
</style>

<main>
    <!-- page content -->
</main>
```

- `layout` — which template to use (`base.njk` for main pages, `survey.njk` for survey sections)
- `title` — sets `<title>` tag
- `activeNav` — highlights the active nav link (Home, Platform, Demo, Training, Resources, Network, Press)

## Editing Pages

**To edit a page's content:** modify the HTML file directly. The shared header/footer come from the layout.

**To edit the header, footer, or nav:** modify `_includes/base.njk` (main pages) or `_includes/survey.njk` (survey pages).

**To add a new page:** create a new `.html` file with front matter pointing to `base.njk` layout.

## Styling

- [Tailwind CSS](https://tailwindcss.com/) via CDN for utility classes
- [IBM Plex Sans / Mono](https://fonts.google.com/specimen/IBM+Plex+Sans) fonts
- [Font Awesome 6](https://fontawesome.com/) icons
- `theme.css` defines CSS custom properties for light/dark mode
- Dark mode toggles the `dark` class on `<html>`

## Deployment

**Codeberg Pages** (primary):

```bash
npm run deploy:codeberg
```

Builds the site and pushes `_site/` to the `pages` branch on Codeberg.

**GitHub Pages** (mirror): deploys automatically on every push to `main` via GitHub Actions.

## Partners

- **Radboud University** — Project lead
- **Hasso Plattner Institute** — Implementation partner
- **Tilburg University, VU Amsterdam, University of Amsterdam** — Research partners

## License

ISC
