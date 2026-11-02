---
id: grey-or-gray
chapter: 2
order: 1
kind: lesson
title: Grey or gray
---
Find both spellings, **grey** and **gray**, and nothing else that looks like them.

A pair of square brackets matches one character, chosen from the ones inside.

+++ match
a grey morning
paint it gray
greyscale photos

+++ reject
a groyne on the beach
gruyere on toast
great big dogs

+++ hiddenmatch
gray wolves

+++ hiddenreject
gr y gap

+++ solution
gr[ae]y

+++ wrong
gr.y
grey
gray
gr[a-z]y

+++ tools
- `[abc]` matches one character: a, b or c
- So `b[ai]g` matches bag and big, but not bug or baig

+++ steps
The dot was too blunt for this: `gr.y` also finds "groy" and "gruy". Try it and see.

---
List the letters you'll accept in square brackets: `gr[ae]y`

+++ debrief
**One character.** However much you put between the brackets, a class matches exactly one character. `[ae]` is one letter, either a or e.

**Most special characters stop being special in here.** `[.]` is a real dot, with no backslash needed.

**`grey|gray` works too,** but it says everything twice. A class says exactly what varies.

+++ sheet
```
[ae]      one character: a or e
gr[ae]y   grey or gray
```
