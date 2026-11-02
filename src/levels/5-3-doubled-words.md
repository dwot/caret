---
id: doubled-words
chapter: 5
order: 3
kind: fix
title: Doubled words
---
This proofreader should find a **word repeated twice in a row**, like "the the". Right now it matches any two words.

Fix it, so it only matches when the second word is the same as the first.

+++ start
\b(\w+) (\w+)\b

+++ match
the the cat
this is is wrong
a quick quick fox

+++ reject
the cat sat
the theory
bathe the dog

+++ hiddenmatch
and and

+++ hiddenreject
and android

+++ solution
\b(\w+) \1\b

+++ wrong
\b(\w+) (\w+)\b
\b(\w+) \1
(\w+) \1\b
\1

+++ tools
- `\1` is a **backreference**: it matches the same text that group 1 captured, not the same pattern
- So `(a|b)\1` matches aa and bb, but not ab
- `\b` is a word boundary, on either side of a word

+++ steps
The second `(\w+)` accepts any word. You want the exact text the first group found, and that's `\1`.

---
`\b(\w+) \1`. Check "the theory": it needs one more thing.

---
A closing `\b` stops `\1` from matching the start of a longer word: `\b(\w+) \1\b`

+++ debrief
**Text, not pattern.** `\1` repeats what was actually matched. `(\w+) (\w+)` allows two different words, and `(\w+) \1` doesn't.

**Both boundaries count.** Without the first `\b`, "bathe the" matches on its "the the". Without the last one, "the theory" does.

**Numbering.** Groups are numbered by their opening bracket from the left, so `\2` is the second group.

+++ sheet
```
(\w+) \1      the same word twice
\b(\w+) \1\b  the same whole word twice
```
