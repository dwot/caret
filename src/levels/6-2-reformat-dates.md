---
id: reformat-dates
chapter: 6
order: 2
kind: lesson
type: replace
title: Reformat dates
---
Rewrite US dates, `MM/DD/YYYY`, as `YYYY-MM-DD`. Any other text on the line stays exactly where it is, and anything else that isn't that format is left alone.

+++ match
11/01/2026 ==> 2026-11-01
12/31/1999 ==> 1999-12-31
due 02/29/2024 at noon ==> due 2024-02-29 at noon

+++ reject
2026-11-01
1/2/26

+++ hiddenmatch
paid 07/04/1976 today ==> paid 1976-07-04 today

+++ hiddenreject
12/2026

+++ solution
(\d{2})/(\d{2})/(\d{4})

+++ replacement
$3-$1-$2

+++ wrong
(\d+)/(\d+)/(\d+) ==> $3-$1-$2
(\d{2})/(\d{2})/(\d{4}) ==> $3-$2-$1
.*(\d{2})/(\d{2})/(\d{4}).* ==> $3-$1-$2

+++ tools
- One group each for the month, the day and the year
- A group can be used in any order in the replacement
- Only what the pattern matches gets replaced, so leave out the text around the date

+++ steps
Match the format, with a group around each number: `(\d{2})/(\d{2})/(\d{4})`

---
Group 3 is the year, group 1 the month and group 2 the day. Put them in order, with dashes: `$3-$1-$2`

---
The pattern is `(\d{2})/(\d{2})/(\d{4})` and the replacement is `$3-$1-$2`.

+++ debrief
**Match only what changes.** Adding `.*` around the date would match the whole line, and replace "due" and "at noon" along with it.

**The `g` flag.** A replace only changes the first match in a line unless you add `g`, for "global". Put `g` in the flags box when a line can hold more than one date.

+++ sheet
```
(\d{2})/(\d{2})/(\d{4}) → $3-$1-$2    US date to ISO
g flag: replace every match, not just the first
```
