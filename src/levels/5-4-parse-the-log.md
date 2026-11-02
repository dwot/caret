---
id: parse-the-log
chapter: 5
order: 4
kind: boss
title: Parse the log
---
Each valid log line is a **date**, a space, a **level** in capitals, a space, then a **message**. The date looks like `2026-11-01`.

Capture all three in order, with three groups. The message is everything to the end of the line. The whole line has to fit, so anything else shouldn't match.

+++ match
2026-11-01 ERROR disk full ==> 2026-11-01 ==> ERROR ==> disk full
2026-11-02 INFO started ==> 2026-11-02 ==> INFO ==> started
2026-11-03 WARN low memory on node 2 ==> 2026-11-03 ==> WARN ==> low memory on node 2

+++ reject
starting up
2026-11 ERROR short date
11/01/2026 ERROR wrong order
2026-11-01 error lowercase

+++ hiddenmatch
2027-01-02 DEBUG a b c ==> 2027-01-02 ==> DEBUG ==> a b c

+++ hiddenreject
see 2026-11-01 INFO not at the start
2026-11-01 INFO

+++ solution
^(\d{4}-\d{2}-\d{2}) ([A-Z]+) (.+)$

+++ wrong
(\d{4}-\d{2}-\d{2}) ([A-Z]+) (.+)$
^(\S+) (\S+) (.+)$
^(\d{4}-\d{2}-\d{2}) (\w+) (.+)$
^(\d{4}-\d{2}-\d{2}) ([A-Z]+) (\w+)$
^\d{4}-\d{2}-\d{2} [A-Z]+ .+$

+++ tools
- `\d{4}` is four digits, so a date is `\d{4}-\d{2}-\d{2}`
- `[A-Z]+` is one or more capitals. The `+` goes **after** the `]`
- `.+` is the rest of the line
- Round brackets around a part capture it. Groups are numbered from the left
- `^` and `$` make the pattern cover the whole line

+++ steps
Build it up, and watch the "you have" notes as you go. Start with the date in a group, at the start of the line: `^(\d{4}-\d{2}-\d{2})`

---
Add a space, then the level in its own group. It's one or more capitals: ` ([A-Z]+)`

---
Add a space, then the message, which is everything left. Finish with `$`: ` (.+)$`

---
All together: `^(\d{4}-\d{2}-\d{2}) ([A-Z]+) (.+)$`

+++ debrief
**Every field became a group.** This is the everyday use of regex: a line of text goes in, and named pieces come out.

**Named groups.** With three or more groups, numbers get hard to read. `(?<date>...)` gives a group a name, and Python writes it `(?P<date>...)`.

**`.+` was safe here** because it's the last thing in the pattern. In the middle of one, remember chapter 3: it would be greedy.

+++ sheet
```
^(\d{4}-\d{2}-\d{2}) ([A-Z]+) (.+)$
   date, level and message
(?<date>\d{4})   a named group
```
