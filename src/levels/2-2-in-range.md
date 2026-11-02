---
id: in-range
chapter: 2
order: 2
kind: lesson
title: In range
---
Find the three-digit web colours in this stylesheet: a `#`, then exactly three lowercase hex digits. Hex digits are **0 to 9** and **a to f**.

+++ match
color: #fa0
border: #09c
background: #123

+++ reject
color: #xyz
border: #fg0
margin: #12

+++ hiddenmatch
outline: #abc

+++ hiddenreject
color: #a-c

+++ solution
#[0-9a-f][0-9a-f][0-9a-f]

+++ wrong
#...
#[0-9][0-9][0-9]
#[a-z0-9][a-z0-9][a-z0-9]
#[a-f][a-f][a-f]

+++ tools
- `[0-9]` is a range: any digit
- `[a-f]` is any of a, b, c, d, e or f
- You can put several ranges in one class: `[a-z0-9]` is one lowercase letter or digit
- A class is always one character, so three characters need three classes

+++ steps
You could write out `[0123456789abcdef]`, but a dash inside a class makes a range: `[0-9a-f]`

---
That's one hex digit, and you need three. Write it three times after the `#`: `#[0-9a-f][0-9a-f][0-9a-f]`

+++ debrief
**That was long-winded.** Writing the same class three times is tedious. Chapter 3 shortens it to `#[0-9a-f]{3}`.

**Ranges follow character codes,** so `[a-z]` is only lowercase, and `[A-Za-z]` covers both cases. A dash at the very start or end of a class is a plain dash: `[-.]`.

+++ sheet
```
[0-9]     any digit
[a-f]     a letter from a to f
[0-9a-f]  one hex digit
```
