---
title: "Foslog v0.4.0 - The Expansion Update"
date: "2026-01-19"
category: "releases"
description: "Version 0.4.0 is here, bringing a massive expansion with TV Series, Games, and Books, plus new features like User Profiles, a Blog, and advanced search."
---

# Introducing Foslog v0.4.0

We're excited to announce the release of **Foslog v0.4.0**, an update that dramatically expands the world of content available to you. This release introduces three new media types, a robust user profile system, a brand new blog, and a host of UI and performance improvements to make your experience smoother and more engaging.

## What's New

### Core Features
- **New Media Types**: We've massively expanded our library! You can now discover, track, and review **TV Series**, **Video Games**, and **Books**.
- **User Profiles**: You now have your own personal profile page, creating a central hub to view your reviews and manage your activity.
- **Advanced Search & Filtering**: Finding what you're looking for is now easier than ever with new options to filter by media type and a more powerful search system.
- **Blog Platform**: Welcome to our new blog! This is the new home for all announcements, release notes, and articles from the Foslog team.
- **Share Functionality**: Found a review you love? You can now easily share reviews with friends using our new share feature, complete with toast notifications.

### UI/UX Enhancements
- **Global Notifications**: A new global toast notification system has been implemented to provide clear and immediate feedback on your actions across the site.
- **Improved Mobile Pagination**: We've refined pagination on mobile devices for a more intuitive browsing experience.
- **Configuration Modal**: A new configuration modal has been added to give you more control over your experience.
- **Show Likes as Fallback**: To provide more insight, media cards without star ratings will now display like/dislike counts.
- **Continued Internationalization**: We've continued to translate more parts of the UI, including dynamic text like "No Poster" and "No reviews yet."

### API & Performance
- **Pagination Stability**: We've resolved a critical bug that caused instability, duplicate items, and missing content in paginated views.
- **Token Refresh Fix**: A race condition in the API token refresh logic has been fixed, leading to more stable and reliable connections with third-party services.
- **Optimized Data Handling**: We have implemented helper functions to better parse and handle data from external APIs like Google Books and IGDB.
- **Global Homepage Stats**: The statistics on the homepage are now global, reflecting activity from the entire Foslog community over the last month.

## Full Changelog

For a detailed list of all changes, you can view the [full changelog on GitHub](https://github.com/JAM-Productions/foslog/compare/v0.3.0...v0.4.0).

## Contributors

This release was made possible by the incredible contributions from:

- @jorbush
- @mriverre8
- @google-labs-jules
- @dependabot
- @Copilot

---

*Have feedback or suggestions? We'd love to hear from you at jamproductionsdev@gmail.com*
