---
id: maybe
chapter: 3
order: 2
kind: lesson
title: Maybe
---
Find the web addresses. Each one starts with **http://** or **https://**.

+++ match
http://example.com
https://example.org
see https://example.net/help

+++ reject
ftp://example.com
httpx://example.com
httpss://example.com

+++ hiddenmatch
http://example.io

+++ hiddenreject
htps://example.com

+++ solution
https?://

+++ wrong
http://
https://
https*://
http.?://
http.*://

+++ tools
- `?` after something means it's optional: zero or one of it
- So `dogs?` matches dog and dogs, but not dogss
- It only applies to the one thing just before it

+++ steps
The two prefixes differ by one letter. Make that letter optional with `?`: `s?`

---
`https?://`

+++ debrief
**Optional, once.** `colou?r` matches both "color" and "colour", and `?` is usually what you want when a word has two spellings.

**Why not `*`?** `https*://` also accepts "httpss://". Saying exactly how many you'll allow is what keeps bad lines out.

**Slashes.** They're ordinary characters here. In code they often end the pattern, so you'll see `\/` in JavaScript: `/https?:\/\//`.

+++ sheet
```
s?        an optional s
colou?r   color or colour
```
