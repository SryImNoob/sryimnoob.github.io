---
layout: post
title: 水一题: 随机切蛋糕
categories: Puzzle
description: Is it fair?
tags: Math Interview
---

# 随机切蛋糕

## 问题描述

5个兄弟,分一个蛋糕卷,假设蛋糕卷是一个[0,1]区间,完全随机的在[0,1]区间选4个点切蛋糕,然后老大拿第一段,老二拿第二段...老五拿第五段.

问,这种分蛋糕方式公平吗?

## 解答

其实这道题很好的展示了计算机的优势, 我们可以直接暴力模拟来拿到答案,而不需要考虑为什么.

### 电脑模拟

直接跑10000次,统计每段的均值和方差,然后得到答案,公平.

```python
import numpy as np
n = 10000
m = 4

s = np.random.rand(n, m)
#print(s)
s = np.sort(s, axis=1)
#print(s)
s1 = np.insert(s, m, values=np.ones(n), axis=1)
s0 = np.insert(s, 0, values=np.zeros(n), axis=1)
t = s1 - s0
#print(t)

print(np.mean(t, axis=0))
print(np.var(t, axis=0))
```

### 解析解

没空写题解,先写答案:

$$
F(x) = 1 - (1-x)^n \\
P(x) = n(1-x)^{n-1} \\
E(x) = \frac{1}{n+1} \\
E(X^2) = \frac{2}{(n+2)(n+1)}
Var(x) = E(x^2) - E(x)^2 = \frac{n}{(n+2)(n+1)^2}
$$


```python
def solve(n):
    return 1/(n+1), n/((n+2)*(n+1)*(n+1))

print(solve(m))
```

