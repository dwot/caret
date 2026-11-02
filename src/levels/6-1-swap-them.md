---
id: swap-them
chapter: 6
order: 1
kind: lesson
type: replace
title: Swap them
---
A new box has appeared: the **replacement**. Everything your pattern matches gets replaced with it.

Turn each `Last, First` name into `First Last`. Names without a comma stay as they are. In the replacement, `$1` means the text from group 1.

+++ match
Lovelace, Ada ==> Ada Lovelace
Hopper, Grace ==> Grace Hopper
Ritchie, Dennis ==> Dennis Ritchie

+++ reject
Plato
Cher

+++ hiddenmatch
Turing, Alan ==> Alan Turing

+++ hiddenreject
Madonna

+++ solution
(\w+), (\w+)

+++ replacement
$2 $1

+++ wrong
(\w+), (\w+) ==> $1 $2
(\w+) (\w+) ==> $2 $1
.* ==> $2 $1

+++ tools
- `$1` in the replacement is the text from group 1, `$2` from group 2
- Anything else in the replacement is plain text
- So `(\d+) cm` with the replacement `$1 centimetres` turns "5 cm" into "5 centimetres"

+++ steps
Capture each name, and match the comma and space between them: `(\w+), (\w+)`

---
Now write them in the new order in the replacement box. The comma isn't in a group, so it disappears: `$2 $1`

---
The pattern is `(\w+), (\w+)` and the replacement is `$2 $1`.

+++ debrief
**Whatever matched gets replaced.** Anything in the match that isn't in a group, like the comma, is gone. Anything outside the match stays where it was.

**Other tools.** Python and `sed` write groups as `\1` and `\2` in the replacement, so `sed -E 's/(\w+), (\w+)/\2 \1/'` does the same thing.

**Editors do this too.** VS Code's find and replace has a regex mode that uses `$1`.

+++ sheet
```
(\w+), (\w+) → $2 $1    swap two words
```
