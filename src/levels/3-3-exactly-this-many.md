---
id: exactly-this-many
chapter: 3
order: 3
kind: lesson
title: Exactly this many
---
Find the dates written the standard way: **four digits, a dash, two digits, a dash, two digits**, like `2026-11-01`.

Try to do it without writing `\d` eight times.

+++ match
2026-11-01
due 1999-12-31 at noon
2024-02-29

+++ reject
26-11-01
2026-1-1
2026/11/01
2026-11
abcd-ef-gh

+++ hiddenmatch
started 2030-01-15

+++ hiddenreject
202-11-01

+++ solution
\d{4}-\d{2}-\d{2}

+++ wrong
\d+-\d+-\d+
\d{4}-\d{1,2}-\d{1,2}
\d{2}-\d{2}-\d{2}
....-..-..

+++ tools
- `{4}` after something means exactly four of it: `\d{4}` is four digits
- `{2,4}` means two to four of it
- `{2,}` means two or more
- Plain text can sit between repeats: `a{2}-b{2}` matches "aa-bb"

+++ steps
Four digits: `\d{4}`

---
Then a dash and two digits, twice: `\d{4}-\d{2}-\d{2}`

+++ debrief
**Counts make formats short.** The hex colours from chapter 2 become `#[0-9a-f]{3}`, and the serial numbers become `[A-Z]{2}-\d{3}-\d`.

**The others are special cases:** `?` is `{0,1}`, `*` is `{0,}` and `+` is `{1,}`.

**The format isn't the whole story.** This pattern accepts `2026-99-99`. Regex checks shape, not meaning, so real date checking belongs in code.

+++ sheet
```
\d{4}     exactly four digits
\d{1,3}   one to three digits
\d{2,}    two or more digits
```
