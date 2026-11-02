---
id: capture-it
chapter: 5
order: 2
kind: lesson
title: Capture it
---
Pull the **status code** out of each request line: the three digits at the very end. Each line shows what your capture group needs to hold, and what it holds now.

Lines that don't end in a status code shouldn't match at all.

+++ match
GET /home 200 ==> 200
POST /login 302 ==> 302
GET /missing 404 ==> 404
GET /item/123 200 ==> 200

+++ reject
server started
GET /home

+++ hiddenmatch
PUT /a/b/c 500 ==> 500

+++ hiddenreject
GET /home 20

+++ solution
(\d{3})$

+++ wrong
\d{3}$
(\d{3})
(\d+)$
(\d)\d\d$

+++ tools
- Round brackets **capture**: they remember the text they matched, and the note under each line shows it
- So `(\d+) kg` on "12 kg" captures 12
- `\d{3}` is three digits, and `$` is the end of the line

+++ steps
First match the code: `\d{3}$`. Without the `$`, the first three digits win, and `/item/123` gives the wrong answer.

---
Put round brackets around the part you want to keep: `(\d{3})$`

+++ debrief
**Match more than you keep.** The pattern as a whole says where to look, and the group says what to take. This is how regex gets used in real code: find a line, then pull a piece out of it.

**In code.** In Python it's `re.search(pattern, line).group(1)`, and in JavaScript `line.match(pattern)[1]`.

**In `sed`,** the same groups let you keep part of a line: `sed -E 's/.*([0-9]{3})$/\1/'`. Chapter 6 does that here.

+++ sheet
```
(\d{3})$   capture the last three digits
```
