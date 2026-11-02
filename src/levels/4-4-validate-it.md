---
id: validate-it
chapter: 4
order: 4
kind: boss
title: Validate it
---
A sign-up form needs a username check. The **whole line** has to be a valid username, so match the lines that are, and only those.

A valid username:

- is 3 to 12 characters long
- starts with a lowercase letter
- then uses only lowercase letters, digits and underscores

+++ match
ada
grace_h
linus99
a_b_c

+++ reject
ab
9lives
Ada
has space
way_too_long_a_name
ada!

+++ hiddenmatch
x_1
abcdefghijkl

+++ hiddenreject
_under
abcdefghijklm
ada-b

+++ solution
^[a-z][a-z0-9_]{2,11}$

+++ wrong
[a-z][a-z0-9_]{2,11}
^[a-z][a-z0-9_]{2,11}
[a-z][a-z0-9_]{2,11}$
^[a-z0-9_]{3,12}$
^\w{3,12}$
^[a-z][a-z0-9_]{3,12}$

+++ tools
- `^` and `$` together make the pattern cover the whole line: `^abc$` matches only "abc"
- `[a-z]` is one lowercase letter, and `[a-z0-9_]` is one letter, digit or underscore
- `{2,11}` means two to eleven of what's before it
- Handle the first character separately, and remember it counts towards the length

+++ steps
The first character has its own rule: `[a-z]`

---
The rest can be letters, digits or underscores. That's `[a-z0-9_]`. The first character used up one of the 3 to 12, so you need 2 to 11 more: `{2,11}`

---
Without anchors, `way_too_long_a_name` passes because a valid part sits inside it. Add `^` and `$`: `^[a-z][a-z0-9_]{2,11}$`

+++ debrief
**Validation always needs both anchors.** Without them, a pattern only asks whether a valid piece exists somewhere in the text. This is one of the most common regex bugs in real software.

**Count carefully.** Rules like "3 to 12 characters" become `{2,11}` when the first character is handled separately.

**Multi-line text.** In code, `$` can match just before a final line break in some languages, and the `m` flag makes `^` and `$` match at every line. For a single value, check how your language treats these.

+++ sheet
```
^[a-z][a-z0-9_]{2,11}$    a whole line, 3 to 12 long
```
