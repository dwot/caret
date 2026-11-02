---
id: clean-up-the-numbers
chapter: 6
order: 4
kind: boss
type: replace
title: Clean up the numbers
---
A contact list has phone numbers in every format. Rewrite each one as `555-123-4567`, with one pattern and one replacement.

The separators vary: brackets around the first three digits, or a dash, dot, space or nothing between the groups of digits. Anything that isn't a ten-digit number is left alone.

+++ match
(555) 123-4567 ==> 555-123-4567
555.123.4567 ==> 555-123-4567
555 123 4567 ==> 555-123-4567
5551234567 ==> 555-123-4567
call 212-555-0100 today ==> call 212-555-0100 today

+++ reject
123-4567
not a number
55-123-4567

+++ hiddenmatch
(212) 555.0100 ==> 212-555-0100

+++ hiddenreject
555-12-34567

+++ solution
\(?(\d{3})\)?[ .-]?(\d{3})[ .-]?(\d{4})

+++ replacement
$1-$2-$3

+++ wrong
(\d{3})[ .-]?(\d{3})[ .-]?(\d{4}) ==> $1-$2-$3
\(?(\d{3})\)?[ .-](\d{3})[ .-](\d{4}) ==> $1-$2-$3
\(?(\d{3})\)? (\d{3})-(\d{4}) ==> $1-$2-$3
\(?(\d+)\)?[ .-]?(\d+)[ .-]?(\d+) ==> $1-$2-$3

+++ tools
- Three groups: `(\d{3})`, `(\d{3})` and `(\d{4})`
- `[ .-]?` is an optional separator. A dash at the end of a class is a plain dash
- Brackets are special, so a real one needs a backslash, and `\(?` is an optional one
- The replacement puts the groups back with dashes between them

+++ steps
Start with the digits and optional separators: `(\d{3})[ .-]?(\d{3})[ .-]?(\d{4})`

---
That leaves the bracket on `(555) 123-4567`. Add an optional `\(?` before the first group and `\)?` after it.

---
The replacement is `$1-$2-$3`. Each line that's already right comes out the same.

---
The pattern is `\(?(\d{3})\)?[ .-]?(\d{3})[ .-]?(\d{4})` and the replacement is `$1-$2-$3`.

+++ debrief
**That's the whole course in one pattern:** escaping, classes, optional parts, counts, groups and replacement.

**Real data is messier.** Phone numbers around the world don't fit this, so use a library when it matters. Regex is great for tidying a list you can look at, and risky for rules you can't.

**Where to go next.** Try `grep -E` and `sed -E` in [Tilde](https://tilde.plaintext.guru), or your editor's find and replace. Remember that `\d` doesn't always work there, so use `[0-9]`.

+++ sheet
```
\(?(\d{3})\)?[ .-]?(\d{3})[ .-]?(\d{4}) → $1-$2-$3
   tidy a phone number
```
