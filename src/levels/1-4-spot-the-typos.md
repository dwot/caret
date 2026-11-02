---
id: spot-the-typos
chapter: 1
order: 4
kind: boss
title: Spot the typos
solutionflags: i
---
Everyone misspells **receive**. Find every line that has the word, however it's spelled here: the right way, with the middle letters swapped, or in shouting capitals.

Leave the other words alone.

+++ match
Please receive this parcel
I did not recieve it
WE RECEIVE ORDERS DAILY
did you Recieve my note

+++ reject
Please recover the parcel
We relieve the night shift
A recent order
Keep the receipt

+++ hiddenmatch
RECIEVE
received with thanks

+++ hiddenreject
recharge
RESERVE

+++ solution
rec..ve

+++ wrong
receive
recieve
re....ve

+++ tools
- `.` matches any one character, so two dots in a row stand for two unknown letters: `b..k` matches book and back
- The **flags** box changes how the whole pattern works. Type `i` there to ignore case, so `dog` also finds DOG and Dog

+++ steps
Two spellings differ only in two letters in the middle. What could stand in for each of them?

---
A dot each: `rec..ve`

---
That misses the capitals, so type just `i` in the **flags** box. The pattern stays `rec..ve`. Press **Check**.

+++ debrief
**Flags change the whole pattern.** `/rec..ve/i` is how you'll see this written in code. In `grep` the same thing is `grep -i`.

**Another way.** `receive|recieve` with the `i` flag works too. `|` means "or", and it's coming in chapter 5.

**Dots are blunt.** `rec..ve` would also match "recXYve", which isn't a word. Here that's fine, because you know what's in the text. In the next chapter you'll say exactly which letters are allowed: `rec[ei][ei]ve`.

+++ sheet
```
/rec..ve/i    any two characters, in either case
```
