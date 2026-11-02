---
id: any-character
chapter: 1
order: 2
kind: lesson
title: Any character
---
Match the three-letter words that start with **c** and end with **t**, whatever's in the middle.

+++ match
cat
cot
cut

+++ reject
coat
cast
dog

+++ hiddenmatch
c4t

+++ hiddenreject
ct

+++ solution
c.t

+++ wrong
cat|cot|cut
c
t

+++ tools
- `.` matches any one character: a letter, a digit, a space or punctuation.
- So `b.g` matches bag, big and b4g, but not bg (nothing in the middle) or bang (two in the middle).

+++ steps
Listing them would work on these lines, but Check also tries some you can't see. You need one pattern for all of them.

---
A dot stands for exactly one character of any kind: `c.t`

+++ debrief
**Exactly one.** `c.t` doesn't match "ct", because the dot needs a character to match. It doesn't match "coat" either: that's two characters between the c and the t.

**Any character** really does mean any: letters, digits, spaces and punctuation. The one exception is a line break.

+++ sheet
```
c.t       c, any one character, t
```
