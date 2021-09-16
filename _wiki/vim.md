---
layout: wiki
title: Vim Cheatesheet
categories: Cheatesheet
description: Vim快捷键手册
---

# Vim Cheatsheet

**全局替换**

`:%s/search_string/replacement_string/g`

**Delete from cursor to end of file**

As others have mentioned: you can use d$ or D (shift-d) to delete from the cursor position until the end of the line.

What I typically find more useful is c$ or C (shift-c) because it will delete from the cursor position until the end of the line and put you in [INSERT] mode.

**Delete all text above**

`dgg` or `dG`

**replace newline with comma**

`:%s/\n/,`
