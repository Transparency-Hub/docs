# Transparency Hub Network admin web documentation

This Mintlify guide describes the admin web app at `Staticwebsite-App` `origin/main` commit `b1ee213` (checked September 15, 2026). It covers UI available to an administrator in a selected chapter, subject to role permissions. It does not document unpublished feature branches, the mobile apps, or the backend/public API.

When updating the guide, fetch `origin/main` in `Staticwebsite-App` and compare page labels, controls, routes, feature flags, and permissions against that commit before making claims. Update the source commit in the introduction and this README. Do not use plans or QA guides as evidence that a feature is released.

Validate the site with `npx mintlify validate` and `npx mintlify broken-links`. Preview it with `npx mintlify dev`.

The repository's older Dockerfile and GitHub Pages workflow still call `mintlify build`, which the installed CLI no longer provides. Those deployment paths need separate repair before they can build a static artifact.
