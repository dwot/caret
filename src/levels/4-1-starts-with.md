---
id: starts-with
chapter: 4
order: 1
kind: lesson
title: Starts with
---
Find the log lines that **begin** with `ERROR`. Lines that only mention it further along don't count.

+++ match
ERROR disk full
ERROR: timed out
ERROR 500 on /home

+++ reject
no ERROR here
WARN ERROR later
error in lowercase

+++ hiddenmatch
ERROR again

+++ hiddenreject
see ERROR above
 ERROR indented

+++ solution
^ERROR

+++ wrong
ERROR
^error
.ERROR
ERROR.

+++ tools
- `^` matches the start of the line. It doesn't match a character, just a position.
- So `^The` matches "The end", but not "See The end".

+++ steps
Plain `ERROR` finds it anywhere in the line. Try it and look at the right-hand list.

---
Pin it to the start with a caret: `^ERROR`

+++ debrief
**Anchors match positions.** `^` doesn't use up a character. It only says where the rest of the pattern has to begin.

**This is the caret.** It has two jobs: at the start of a pattern it means "start of line", and at the start of a class, as in `[^u]`, it means "not".

**One line at a time.** Caret tests each line on its own, and so does `grep`. In code, a pattern may be given a whole block of text, where `^` means only the very start unless you add the `m` flag.

+++ sheet
```
^ERROR    a line that starts with ERROR
```
