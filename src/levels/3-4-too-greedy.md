---
id: too-greedy
chapter: 3
order: 4
kind: fix
title: Too greedy
---
Fix this pattern so it matches **only the HTML tags, not the text between them**. In `<b>bold</b>`, `<b>` and `</b>` should be two separate matches, and the word "bold" shouldn't be highlighted.

Right now it runs from the first `<` right through to the last `>`, and takes everything in between with it.

+++ start
<.*>

+++ match
«<b>»bold«</b>» text
«<i>»one«</i>» and «<i>»two«</i>»
«<p>»hello«</p>»

+++ reject
no tags here
1 > 0

+++ hiddenmatch
«<ul>»«<li>»item«</li>»«</ul>»

+++ hiddenreject
2 > 1

+++ solution
<.*?>

+++ wrong
<.*>
<.+>
<\w+>
<.>

+++ tools
- `*` and `+` are **greedy**: they take as much as they can
- `?` after a repeat makes it **lazy**: `*?` takes as little as it can
- A class that can't cross the end works too: `[^>]*`

+++ steps
Look at what's highlighted: `.*` swallowed everything up to the very last `>`.

---
Add a `?` after the `*` to make it stop at the first `>` it can: `<.*?>`

+++ debrief
**Greedy by default.** `.*` grabs the rest of the line, then gives characters back only until the pattern can finish. That's why it stopped at the last `>`, not the first.

**Two fixes.** `<.*?>` says "as little as possible". `<[^>]*>` says "anything except the closing character", which is often faster and clearer about what you mean.

**The same `?`, a different job.** After a character it means optional. After a repeat it means lazy.

**Regex and HTML.** This works on simple tags, but it isn't how to parse real HTML. Use a proper parser for that.

+++ sheet
```
.*        greedy: as much as it can
.*?       lazy: as little as it can
[^>]*     anything up to the next >
```
