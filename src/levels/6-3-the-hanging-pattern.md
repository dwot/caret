---
id: the-hanging-pattern
chapter: 6
order: 3
kind: fix
title: The hanging pattern
---
This pattern checks that a line is **only words separated by single spaces**. It looks fine, and on the short lines it is.

Press **Check**. On a long line that nearly matches, it takes so long it gets stopped. In a real app, that freezes the server. Fix it, so it gives the same answers quickly.

+++ start
^(\w+\s?)*$

+++ match
hello world
one two three
word

+++ reject
hello  world
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!

+++ hiddenmatch
a b c d e f

+++ hiddenreject
trailing space 
not_ok!

+++ solution
^\w+( \w+)*$

+++ wrong
\w+( \w+)*$
^\w+( \w+)*
^[\w ]+$
^\w+$

+++ tools
- `(\w+\s?)*` is a repeat inside a repeat, and the same letters can be split between them in a huge number of ways
- When the line fails at the very end, the engine tries every one of those splits
- The fix is to have only one way to match each line: a word, then repeats of a space and a word

+++ steps
Nested repeats are the problem: `\w+` inside `(...)*`. The space is optional, so "aaaa" could be one word, or two, or four.

---
Make the space required inside the repeat, and put the first word outside it: `\w+( \w+)*`

---
Keep the anchors: `^\w+( \w+)*$`

+++ debrief
**Catastrophic backtracking.** Each extra letter doubled the work, so 48 letters would take longer than anyone could wait. This is why Caret stops slow patterns, and it's taken down real websites.

**The rule of thumb.** Be wary of a repeat inside a repeat, when both can match the same text. Make sure there's only one way to match any given string.

**Regex on user input.** This is called ReDoS when it's used as an attack. Some engines, like RE2 and Rust's regex crate, can't backtrack this way at all.

+++ sheet
```
(a+)+         danger: a repeat inside a repeat
\w+( \w+)*    words and single spaces, safely
```
