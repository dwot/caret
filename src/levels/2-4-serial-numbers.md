---
id: serial-numbers
chapter: 2
order: 4
kind: boss
title: Serial numbers
---
The warehouse needs every valid serial number. A valid one is **two capital letters, a dash, three digits, a dash, and one more digit**, like `AB-123-9`.

There are plenty of near misses in here, and `\d` will save you some typing.

+++ match
AB-123-9
ZX-042-0
order QW-900-7 shipped

+++ reject
ab-123-9
AB-12-9
AB-123-X
A1-123-9
AB 123 9

+++ hiddenmatch
returned MK-555-1 today

+++ hiddenreject
XY-12A-3
AB-1234-9

+++ solution
[A-Z][A-Z]-\d\d\d-\d

+++ wrong
..-...-.
[A-Z][A-Z]-...-.
\w\w-\d\d\d-\d
[a-z][a-z]-\d\d\d-\d
[A-Z][A-Z]-\d\d-\d

+++ tools
- `[A-Z]` is one capital letter, so two capitals are `[A-Z][A-Z]`
- `\d` is one digit, so three digits are `\d\d\d`
- A dash outside a class is a plain dash
- Work through the format from left to right, writing one piece at a time

+++ steps
Work left to right. Two capital letters: `[A-Z][A-Z]`

---
Then a dash and three digits: `-\d\d\d`

---
Then a dash and one last digit: `-\d`

---
All together: `[A-Z][A-Z]-\d\d\d-\d`

+++ debrief
**A pattern is a description of a format.** Reading `[A-Z][A-Z]-\d\d\d-\d` from left to right says exactly what you were told.

**Check your near misses.** `\w\w` looks fine on the valid serials, and only the wrong lines show that it also lets in `ab` and `A1`.

**It still matches inside longer text,** which is why "order QW-900-7 shipped" passes. Chapter 4's anchors let you demand that the whole line is a serial.

+++ sheet
```
[A-Z][A-Z]-\d\d\d-\d    AB-123-9
```
