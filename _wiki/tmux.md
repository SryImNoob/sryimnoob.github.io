---
layout: wiki
title: Tmux Cheatsheet
categories: Cheatsheet
description: tmux快捷键手册
---

官方wiki:
[https://github.com/tmux/tmux/wiki](https://github.com/tmux/tmux/wiki)

# Tmux Cheatsheet

## Sessions

**Start a new session**

```
$ tmux
$ tmux new -s name
```

```
:new
```

**Show all sessions**

```
tmux ls
```

`C-b s`

**Attach to last session**

```
$ tmux a
$ tmux at
$ tmux attach
$ tmux attach-session
```

**Attach to a session with the name mysession**

```
$ tmux a -t mysession
$ tmux at -t mysession
$ tmux attach -t mysession
$ tmux attach-session -t mysession
```

**Move to previous(next) session**

`C-b (`

`C-b )`

**Rename session**

`C-b $`






## Windows

`C-b c` Create window

`C-b &` Close current window


`C-b p` Previous window

`C-b n` Next window

`C-b 0...9` Select window by number

## Copy mode

`C-b [` Enter copy mode to copy text or view the history.

`C-s` then type the string to search for and press `Enter`.
  - Press `n` to next.
