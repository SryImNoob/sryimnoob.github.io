---
layout: post
title: Project Euler 499 - St. Petersburg Lottery
categories: Puzzle
description: difficulty rating 100%
tags: Algorithm Interview
---

Problem link: [http://projecteuler.net/problem=499](http://projecteuler.net/problem=499)

Solution: [https://github.com/roosephu/project-euler/blob/master/499.sage](https://github.com/roosephu/project-euler/blob/master/499.sage)

# St. Petersburg Lottery

A gambler decides to participate in a special lottery. In this lottery the gambler plays a series of one or more games.

Each game costs $m$ pounds to play and starts with an initial pot of $1$ pound. The gambler flips an unbiased coin. Every time a head appears, the pot is doubled and the gambler continues. When a tail appears, the game ends and the gambler collects the current value of the pot. The gambler is certain to win at least $1$ pound, the starting value of the pot, at the cost of $m$ pounds, the initial fee.

The game ends if the gambler's fortune falls below $m$ pounds.

Let $p_m(s)$ denote the probability that the gambler will never run out of money in this lottery given an initial fortune $s$ and the cost per game $m$.

For example $p_2(2) \approx 0.2522$, $p_2(5) \approx 0.6873$ and $p_6(10\,000) \approx 0.9952$ (note: $p_m(s) = 0$ for $s \lt m$).

Find $p_{15}(10^9)$ and give your answer rounded to $7$ decimal places behind the decimal point in the form 0.abcdefg.

# Solution

```
t = var('t')
m = 15
f = e^(t * m)
for i in range(50):
    f -= e^(2^i * t) / 2^(i + 1)
f_d = f.derivative()
t0 = -2e-9
for i in range(10):
    print t0, f(t=t0).n(100)
    t0 = (t0 - f(t=t0) / f_d(t=t0)).n(100)
# plot(f, (t, -3e-9, 0))
print(1 - e^(t0*1e9))
```

# Solution Explanation

let $g_m(s)$ denote the probability that the gambler will run out of money in this lottery given an initial fortune $s$ and the cost per game $m$. then $p_m(s) = 1 - g_m(s)$.

**The key idea is that guessing the functional form $g_m(s) = e^{t_ms}$ where $t$ is an unknow constant value yet.**

The problem becomes to finding out the constant $t$ for the given $m$.

First, the recursive equation of $g_m(s)$,

$$
g_m(s) = \sum_{i=0}^{\infty}\frac{g_m(s - m + 2^i)}{2^{i+1}}
$$

btw, a fun fact is that $p_m(s)$ has the same recursive equation. 

Substitute $g_m(s) = e^{ts}$ into this equation,

$$
e^{ts} = \sum_{i=0}^{\infty}\frac{e^{t(s - m + 2^i)}}{2^{i+1}}
$$

Cancel $e^{ts}$,

$$
e^{ts} = e^{ts} \sum_{i=0}^{\infty}\frac{e^{t(-m + 2^i)}}{2^{i+1}}
$$

$$
1 = \sum_{i=0}^{\infty}\frac{e^{t(-m + 2^i)}}{2^{i+1}}
$$

Multiply both sides by $e^{tm}$,

$$
e^{tm} =  \sum_{i=0}^{\infty}\frac{e^{2^it}}{2^{i+1}}
$$

Let 

$$
f_m(t) = e^{tm} - \sum_{i=0}^{\infty}\frac{e^{2^it}}{2^{i+1}}
$$

Then $t_m$ is the root of $f_m(t) = 0$. 

**Truncating $f_m(x)$ at finite terms**

$$
f_m’(t) = e^{tm} - \sum_{i=0}^{49}\frac{e^{2^it}}{2^{i+1}}
$$

**Finding the root $t_m$ of $f_m'(t)$ using Newton’s method**

Once the root $t_m$ is found, we compute

$$
p_m(s) = 1 - e^{t_ms}
$$
