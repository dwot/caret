---
id: whole-words-only
chapter: 4
order: 3
kind: lesson
title: Whole words only
---
Find the word **cat** on its own. It doesn't count as part of a longer word.

+++ match
the cat sat down
cat
my cat.

+++ reject
concatenate
catalog
scatter
tomcat

+++ hiddenmatch
cat, dog and bird

+++ hiddenreject
cats

+++ solution
\bcat\b

+++ wrong
cat
 cat 
^cat$
\bcat
cat\b

+++ tools
- `\b` matches a **word boundary**: the edge between a word character and anything else
- It takes up no space, and can go on either side of a word
- So `\bdog` matches "dog" and "dogs", but not "hotdog". `dog\b` does the opposite.

+++ steps
Spaces around the word would miss "cat" on its own, and "my cat." with its full stop.

---
`\b` handles all of those, and it goes on both sides: `\bcat\b`

+++ debrief
**Boundaries are positions too.** `\b` sits between a `\w` character and a non-`\w` one, or at the edge of the line. It doesn't use up any text.

**Mind the definition.** A word is `\w` characters, so `\bcat\b` also finds "cat" in "cat-flap", because a dash isn't a word character.

**In `grep`,** `grep -w cat` does the same job.

+++ sheet
```
\bcat\b   the word cat, not inside another word
```
