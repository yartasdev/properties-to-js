---
title: Playground
description: Convert .properties text to JS, TS, or JSON output instantly in the browser.
aside: false
outline: false
pageClass: layout-playground-wide
---

<div class="playground-page">

# Playground

<p class="playground-page__intro">
  Try conversions without installing the CLI. Output structure matches the package;
  <a href="https://prettier.io/" target="_blank" rel="noopener">Prettier</a> formatting may differ slightly from <code>Converter</code> on Node.
</p>

<Playground />

</div>

<style>
.playground-page h1 {
  margin-bottom: 0.35rem;
  letter-spacing: -0.02em;
}
.playground-page__intro {
  max-width: 72rem;
  margin: 0 0 0.25rem;
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
  line-height: 1.65;
}
</style>
