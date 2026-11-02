# Caret

A calm, level-based course in regular expressions, part of [plaintext.guru](https://plaintext.guru).
Each level gives you some lines of text. Type a regular expression, and what it matches lights up as you type.

Play it at [caret.plaintext.guru](https://caret.plaintext.guru).

```bash
npm install
npm run dev
npm test                  # the matcher, and every level against its solution and wrong answers
npm run build && npm run play   # every level in Chrome, against the built site
```

`BROWSER=firefox` or `BROWSER=webkit` runs the same play-through in another engine.

Pushing a `v*` tag runs `.github/workflows/release.yml`: it tests, builds, plays every level and deploys to Cloudflare
Pages. It needs the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets.

Patterns run in a Web Worker (`src/regex.worker.ts`), and `src/matcher.ts` replaces the worker if one takes too long.
`src/regex.ts` is the plain function underneath, so tests can call it directly.

Levels live in `src/levels/*.md`. See `parseLevel` in `src/levels.ts` for the format. `npm test` checks that each
level's solution passes and that listing its visible lines doesn't.
