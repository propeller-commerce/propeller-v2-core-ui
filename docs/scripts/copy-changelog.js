// Copy the package CHANGELOG.md into content/changelog.mdx with frontmatter
// so it renders inside the docs site. Run by `npm run gen:changelog`
// (which is wired to prestart/prebuild in package.json).

const fs = require('node:fs');
const path = require('node:path');

const SRC = path.resolve(__dirname, '..', '..', 'CHANGELOG.md');
const DEST = path.resolve(__dirname, '..', 'content', 'changelog.mdx');

const body = fs.readFileSync(SRC, 'utf8');
const stripped = body.replace(/^# Changelog\s*\n+/i, '');

const frontmatter = `---
title: Changelog
sidebar_label: Changelog
sidebar_position: 99
---

`;

fs.writeFileSync(DEST, frontmatter + stripped, 'utf8');
console.log('Copied CHANGELOG.md -> content/changelog.mdx');
