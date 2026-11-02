---
id: one-or-more
chapter: 3
order: 1
kind: lesson
title: One or more
---
The commentator gets excited. Find every **goal**, however many o's it has, but it must have at least one.

+++ match
goal!
gooooal!
what a goooooooal

+++ reject
gal
gol
gual

+++ hiddenmatch
gooal

+++ hiddenreject
goa

+++ solution
go+al

+++ wrong
goal
go*al
go.al
g.*al

+++ tools
- `+` after something means one or more of it: `ba+d` matches bad and baaad, but not bd
- `*` after something means zero or more of it: `ba*d` matches bd, bad and baaad

+++ steps
A `+` applies to whatever comes just before it. Here that's the o: `o+`

---
Put it in the word: `go+al`

+++ debrief
**`+` and `*`** differ by one case. `go*al` also matches "gal", because zero o's is allowed.

**They repeat one thing.** `go+` means g and then o's, not "go" over and over. To repeat more than one character, you'll need the groups in chapter 5.

**`.*` means anything at all,** including nothing. It's the most used and most overused pattern there is.

**A class can repeat too.** `[0-9]+` is a whole number, and each repeat can be a different digit.

+++ sheet
```
o+        one or more o's
o*        zero or more o's
[0-9]+    a whole number
.*        anything, or nothing
```
