---
id: literally-a-dot
chapter: 1
order: 3
kind: lesson
title: Literally a dot
---
Find every mention of the file **report.txt**.

The dot you just learned has a catch: this time you mean an actual dot.

+++ match
open report.txt
send me report.txt today
the old report.txt is gone

+++ reject
report-txt
reportstxt
report txt is not a file

+++ hiddenmatch
final report.txt

+++ hiddenreject
report_txt

+++ solution
report\.txt

+++ wrong
report.txt
report

+++ tools
- `.` matches any one character, so `a.b` also matches "axb"
- A backslash turns a special character back into a plain one: `a\.b` matches only "a.b"

+++ steps
Try `report.txt`. It highlights the wrong lines too, because its dot matches the `-` and the `s`.

---
Put a backslash in front of the dot, and it means a real dot: `report\.txt`

Press **Check**.

+++ debrief
**Escaping.** A backslash takes away a character's special meaning. These all need one when you mean them literally: `. * + ? ^ $ ( ) [ ] { } | \`

**The quiet bug.** `report.txt` still matches the file you wanted, so it looks right. It just matches too much, and that's the most common regex bug there is. Always look at what shouldn't match, as well as what should.

**Version numbers** are the classic case: `1.2` also matches "1x2" and "142". Write `1\.2`.

+++ sheet
```
\.        a real dot
\\        a real backslash
```
