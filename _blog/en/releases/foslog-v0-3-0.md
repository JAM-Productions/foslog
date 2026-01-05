---
title: "Foslog v0.3.0 - The Content Update"
date: "2025-12-01"
category: "releases"
description: "This massive update brings a host of new features, including a full review system, pagination, legal pages, and significant UI enhancements."
---

# Introducing Foslog v0.3.0

We're thrilled to unveil **Foslog v0.3.0**, a landmark release packed with new features and improvements that deepen the user experience. This update introduces a comprehensive review system, enhanced navigation with pagination, and important legal documents, alongside numerous UI and performance upgrades.

## What's New

### Core Features
- **Full Review System**: You can now add, view, and like reviews for any media item. A new review modal and dedicated review pages make sharing your opinion seamless.
- **Pagination**: We've added pagination to the home page and for reviews on media pages, making it easier to browse large collections of content.
- **Legal Pages**: We've implemented Privacy Policy and Terms of Service pages to ensure transparency and trust.
- **Site-Wide Footer**: A new footer has been added, providing easy access to legal documents and other important links.
- **Media Page Enhancements**: Media pages now include skeletons for a smoother loading experience, a form to post reviews directly, and display associated genres.

### UI/UX Enhancements
- **No More Theme Flashing**: We've fixed the annoying theme flash that occurred on page load.
- **Smarter Header**: The header is now collapsible and defaults to a collapsed state for a cleaner look. The Foslog logo also links back to the home page.
- **Icon Upgrade**: We've replaced emojis with crisp `lucide-react` icons in the media type filter for a more professional feel.
- **Improved Modals**: The review modal now works better on mobile, and we've fixed a visual glitch where dropdowns could be cut off.
- **Better Image Handling**: We've replaced `<img>` tags with Next.js's `<Image>` component for optimized image loading.

### API & Performance
- **Smarter Ratings**: The system for calculating average ratings and total review counts has been optimized for better performance.
- **Improved Error Handling**: We've implemented a more robust API error handling system for increased stability.
- **CORS and Auth Fixes**: We've made our CORS policy more flexible and resolved several authentication issues related to Vercel deployments.
- **Unmocked Data**: The home and media pages now load real, unmocked data, bringing the platform to life.

## Full Changelog

For a detailed list of all changes, you can view the [full changelog on GitHub](https://github.com/JAM-Productions/foslog/compare/v0.2.0...v0.3.0).

## Contributors

This release wouldn't have been possible without the hard work of our amazing contributors:

- @jorbush
- @mriverre8
- @google-labs-jules
- @dependabot

---

*Have feedback or suggestions? We'd love to hear from you at jamproductionsdev@gmail.com*
