---
id: anything-but
chapter: 2
order: 3
kind: lesson
title: Anything but
---
A **q** is nearly always followed by a **u**. Find the rare words where it's followed by something else.

+++ match
a cup of qahwa
the faqir
a qanat in the desert

+++ reject
the queen
quite quick
an equal share

+++ hiddenmatch
niqab

+++ hiddenreject
unique

+++ solution
q[^u]

+++ wrong
q
q.
qu

+++ tools
- `[^abc]` matches one character that **isn't** a, b or c. The `^` has to come first.
- So `b[^a]g` matches big and bug, but not bag. It doesn't match bg either, because it still needs a character.

+++ steps
You could list every letter except u, but there's a shorter way. A `^` at the start of a class flips it.

---
`[^u]` is any one character except u, so: `q[^u]`

+++ debrief
**It still needs a character.** `q[^u]` means a q and then one character that isn't u. So it doesn't match "Iraq", where nothing follows the q. A lookahead, `q(?!u)`, gets round that: it means a q that isn't followed by u, and needs no character after it.

**`^` means two things.** Inside brackets at the start, it means "not". Outside brackets, it's what this course is named after, and that's chapter 4.

**Shorthands.** Some classes are so common they have short names:

- `\d` is a digit, `[0-9]`
- `\w` is a word character, `[A-Za-z0-9_]`
- `\s` is whitespace: a space or a tab

Capitals flip them, so `\D` is anything but a digit. They don't all work in `grep -E` and `sed`, where you'd write `[0-9]`.

+++ sheet
```
[^u]      one character that isn't u
\d \D     a digit, not a digit
\w \W     a word character, not one
\s \S     whitespace, not whitespace
```
