---
id: either-way
chapter: 5
order: 1
kind: lesson
title: Either way
---
A form accepts one answer: the **whole line** has to be exactly `yes` or exactly `no`.

+++ match
yes
no

+++ reject
yesterday
none
say no
yes please
nope

+++ hiddenreject
nono
yes no

+++ solution
^(yes|no)$

+++ wrong
yes|no
^yes|no$
^(yes|no)
(yes|no)$

+++ tools
- `|` means "or": `yes|no` matches either one
- Round brackets group things: `(yes|no)` treats the choice as one unit

+++ steps
Try `yes|no`, then `^yes|no$`. The second one looks right, but "yes please" and "say no" light up.

---
`|` has very low priority, so `^yes|no$` means `^yes` or `no$`. Group the choice so the anchors apply to both: `^(yes|no)$`

+++ debrief
**`|` splits the whole pattern** unless a group limits it. That's why `^yes|no$` is two separate patterns, and it's a classic bug.

**Groups do two jobs.** They limit `|`, and they let you repeat more than one character: `(ha)+` matches "hahaha".

**Groups that don't capture.** `(?:yes|no)` groups in the same way without remembering the text. The next level is about when you do want it remembered.

+++ sheet
```
yes|no       either one
^(yes|no)$   a line that's exactly yes or no
(ha)+        ha, repeated
(?:yes|no)   group, without capturing
```
