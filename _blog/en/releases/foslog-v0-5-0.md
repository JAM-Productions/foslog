---
title: "Foslog v0.5.0 - The Community & Refinement Update"
date: "2026-03-02"
category: "releases"
description: "Version 0.5.0 is here, introducing social features with the new following system, review editing, half-star ratings, and significant performance optimizations with database triggers."
---

# Introducing Foslog v0.5.0

We are thrilled to announce the release of **Foslog v0.5.0**! This update is all about deepening the community experience and refining the core features you use every day. From the highly requested following system to the precision of half-star ratings and massive under-the-hood performance gains, v0.5.0 makes Foslog faster, more social, and more precise.

## What's New

### Community & Social
- **Following System**: You can now follow and unfollow other users! Keep track of your favorite reviewers and see their latest activity. We've also added a new Follow Modal to easily manage your connections.
- **Review Editing & Deletion**: Made a typo or changed your mind? You can now edit or delete your existing reviews.
- **Comment Management**: You now have the ability to delete comments from a review, giving you more control over the discussions on your posts.

### Precision & UI
- **Half-Star Reviews**: Sometimes 4 stars isn't enough, but 5 is too many. You can now rate media with half-star precision.
- **New Stats Carousel**: We've implemented a sleek new carousel for statistics cards on small screens, making it easier to digest your data on the go.
- **Mobile Experience Fixes**: We've standardized card heights and fixed the annoying mobile form zoom issue by increasing font sizes on small inputs.
- **Visual Refinements**: Look out for the new JAM logo in the footer and improved media card UI for a more polished look.

### Performance & Architecture
- **Database Triggers**: We've moved heavy statistical calculations to PostgreSQL triggers. This means global stats and totals are updated instantly and efficiently in the background.
- **Redis Caching**: Global stats are now cached with Redis, significantly reducing database load and speeding up page transitions.
- **Axiom Integration**: We've integrated Axiom for better logging and observability, helping us catch and fix issues faster than ever.
- **Architecture Diagrams**: We've added new architecture and workflow diagrams to the repository to better document how Foslog works under the hood.

### User & SEO
- **Account Management**: You can now delete your account directly from the settings modal. We've also improved the reliability of username and profile image updates.
- **SEO & Metadata**: We've made significant improvements to our SEO and metadata handling, making it easier for your reviews to be found and shared across the web.
- **Internationalization**: More localized labels have been added, including fixes for "series" vs "serie" labels across different languages.

## Full Changelog

For a detailed list of all changes, you can view the [full changelog on GitHub](https://github.com/JAM-Productions/foslog/compare/v0.4.0...v0.5.0).

## Contributors

A huge thank you to our contributors for this release:

- @jorbush
- @mriverre8
- @mykytakrasnov (Welcome to our newest contributor!)
- @Copilot
- @google-labs-jules
- @dependabot

---

*Have feedback or suggestions? We'd love to hear from you at jamproductionsdev@gmail.com*
