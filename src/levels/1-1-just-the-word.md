---
id: just-the-word
chapter: 1
order: 1
kind: lesson
title: Just the word
---
Every line about a **cat** should light up. The rest should stay dark.

Most characters in a regex just mean themselves.

+++ match
my cat sleeps all day
the cat sat on the mat
a cat and a dog

+++ reject
my dog sleeps all day
a bird on the mat

+++ hiddenmatch
catnap time

+++ hiddenreject
a car in the drive

+++ solution
cat

+++ wrong
Cat
dog

+++ tools
- A regex is a pattern that's searched for anywhere in a line.
- Letters and digits match themselves, so `dog` finds the d, o and g in "my dog barks" and in "doggy".
- Case counts: `dog` doesn't find "Dog".

+++ steps
Type `cat` into the pattern box. Each match lights up as you type.

---
The answer is just the word: `cat`

Every line on the left should have a highlight, and none on the right. Press **Check** to have each line marked.

+++ debrief
**A match can be anywhere.** `cat` also finds "catnap", because a regex looks for the pattern anywhere in the line. Later you'll pin it to whole words.

**Case counts.** `cat` doesn't match "Cat". You'll meet the `i` flag soon.

+++ sheet
```
cat       the letters c, a, t, in that order
```
