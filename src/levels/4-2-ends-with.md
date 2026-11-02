---
id: ends-with
chapter: 4
order: 2
kind: lesson
title: Ends with
---
Find the files whose names **end** in `.log`. Compressed and renamed logs don't count.

+++ match
app.log
old/server.log
error.log

+++ reject
app.log.gz
my.log.old
catalog
log.txt

+++ hiddenmatch
a.b.log

+++ hiddenreject
notes.logs

+++ solution
\.log$

+++ wrong
\.log
.log$
log$
^\.log$

+++ tools
- `$` matches the end of the line, so `end$` matches "the end", but not "the end."
- A real dot needs a backslash: `\.`

+++ steps
Start with what you know: a real dot, then log: `\.log`

---
Pin it to the end with `$`: `\.log$`

+++ debrief
**Two details working together.** Without the backslash, `.log$` also accepts "catalog", because the dot matches the a. Without the `$`, `\.log` also accepts "app.log.gz".

**Comments and blanks.** Together, the anchors do common jobs: `^#` finds comment lines and `^$` finds empty ones. You used the same ideas with `grep` in Tilde.

+++ sheet
```
\.log$    a line that ends in .log
^#        a line that starts with #
^$        an empty line
```
