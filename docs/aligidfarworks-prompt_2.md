# aligidfarworks.com — Website Development Prompt

## Overview

A single-page portfolio website for architect Ali Gidfar. The site displays approximately 15 architectural projects in a fullscreen, cinematic, autoscrolling experience. The aesthetic is dark, moody, and minimal — befitting a serious architectural practice.

---

## Visual Design & Aesthetic

- **Color palette:** Deep navy to near-black backgrounds (`#0a0c14` range), with white and light gray typography
- **Typography:** Clean geometric sans-serif throughout (e.g. Inter, DM Sans, or Neue Haas Grotesk). Titles slightly larger/lighter weight, body text at regular weight
- **Overall feel:** Modern, minimal, high-end architecture studio — no decorative elements, no gradients except functional dark overlays on images
- Thin, subtle UI controls — nothing that competes with the imagery

---

## Layout — Desktop

- Fullscreen viewport at all times. No scrolling page — the entire experience lives within `100vh`
- **Top right:** "Ali Gidfar" in small, light geometric sans — persistent across all slides
- **Left side:** A vertical list of years (only years corresponding to actual projects, e.g. 1993, 2001, 2008…). The year associated with the currently active project is highlighted in white; all others are dim/low-opacity. Clicking a year navigates to that project
- **Main area:** Fullscreen project image with a dark gradient overlay at the bottom third, over which project text is displayed
- **Bottom overlay text (on image):** Project title (large), location/city, completion year, and 2–3 sentences of descriptive text
- **Bottom right corner:** A small discreet icon (e.g. a thin circle with initials "AG" or a business card icon) that when clicked reveals a contact card overlay containing: firm name/logo, email address, phone number, LinkedIn and/or social links
- **Pause/Play button:** Small, minimal button (e.g. ⏸/▶ icon) positioned bottom center or bottom left — explicit click only to pause or resume autoscroll

---

## Layout — Mobile (Portrait)

- Load alternate portrait-optimized images for each project (separate image asset per project, named consistently e.g. `project-01-mobile.jpg`)
- Year list collapses or hides on mobile — replaced by a small dot/dash indicator showing current project position
- Project text remains overlaid at the bottom with the same dark gradient treatment
- Contact icon remains in bottom right, tap to expand
- Pause/play button remains accessible

---

## Project Data Structure

Each project contains the following fields:

```json
{
  "id": "string",
  "title": "string",
  "location": "string",
  "year": "number (completion year)",
  "description": "string (2–3 sentences)",
  "image_desktop_1": "string (landscape image path)",
  "image_desktop_2": "string (landscape image path)",
  "image_mobile_1": "string (portrait image path)",
  "image_mobile_2": "string (portrait image path)"
}
```

All project data should live in a single structured JSON or JS data file — easy to update without touching layout code.

---

## Autoscroll & Navigation Behavior

- On load, autoscroll begins automatically
- Each project contains **2 sub-slides** (the 2 photos). The autoscroll cycles: sub-slide 1 → sub-slide 2 → next project's sub-slide 1, and so on
- **Transition:** Slow cinematic crossfade (~1.5–2s fade duration, ~5–7s display duration per sub-slide)
- The **year list on the left updates and highlights** when the project changes — not on sub-slide changes within the same project
- **Pause/Play:** Clicking the pause button freezes the autoscroll on the current sub-slide. Clicking play resumes from where it left off
- **Manual navigation:**
  - Clicking a year on the left jumps to that project's first sub-slide and resumes autoscroll
  - Left/right arrow keys (desktop) navigate between projects
  - Swipe left/right gestures (mobile) navigate between projects

---

## Contact Card (Bottom Right)

- Triggered by clicking a small persistent icon in the bottom right corner (e.g. thin circle with "AG" initials)
- Expands into a minimal card overlay — dark frosted panel aesthetic, not a full modal
- **Contains:**
  - Ali Gidfar's name
  - Firm name / logo
  - Email address
  - Phone number
  - LinkedIn and/or social links
- Dismisses by clicking the icon again or clicking outside the card

---

## Tech Notes

- **Stack TBD** — structure the code so it can be implemented in plain HTML/CSS/JS or ported to React without major refactoring
- All project data stored in a **single structured JSON or JS data file** (update content without touching layout code)
- Images should be **lazy-loaded**; preload the next project's images while the current one is displayed
- No external CMS required — static site is sufficient
- Mobile breakpoint should swap desktop images for portrait-optimized mobile images using responsive logic (not just CSS scaling)
