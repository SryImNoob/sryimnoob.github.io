---
layout: post
title: 一个暴力的动态规划问题
categories: Puzzle
description: A brute-force dynamic programming problem
tags: Algorithm Interview
---

# 一个暴力的动态规划问题

来源于朋友问的一个题目,相比之下,这篇post的题目更方便写代码一点. 虽然整体思路是一样的,但原题实现起来会比较麻烦,所以我化简了一下. 这也体现出作业题和面试题一个不同之处.

作业题通常是侧重证明,而不关心实现. 所以说,作业题的题面上的细微差别,算法思路依然是固定的. 但对于实现来讲,实现的复杂度可能有天壤之别,比如需要处理更多的corner cases.

其实一开始没想写,但不想手机上打字解释怎么做...talk is cheap, show me your code...2333

题外话,毕业之后可以欢乐的解决一些作业题,并且发出来,有种腹黑的恶趣味,hhhh

## 题目描述

Given two arrays $A[N]$ and $B[N]$, return the number of $Z[N]$, such that $Z[0] \le Z[1] \le \dots \le Z[n-1]$ and $A[i] \le Z[i] < B[i]$.

要求写一个多项式时间的算法.

## 解法: 动态规划

既然要求多项式解法,其实也暗示了算法的框架就是离散化DP.

假设离散化之后我们得到一个数组`s[m] = sorted(list(set(A+B)))`, 我们可以观察到Z[i]取值在$[s[k],s[k+1])$之间时,Z[i+1:N]的所有可能性的数量是基于Z[i]的一个多项式

$$
f_{ik}(x), x \in [s[k], s[k+1])
$$

所以我们设$dp[i][k] = f_{ik}$, 即每个状态是一个多项式,具体来讲,每个状态是多项式的系数向量. 大概的状态转移方程如下(详情请看代码):

$$
left[i] = getIndex(s, A[i]) \\
right[i] = getIndex(s, B[i]) \\
dp[i][k](x) = \sum_{j=max(k,left[i+1])}^{right[i+1]} (\sum_{x'=max(x,s[j])}^{s[j+1]} dp[i+1][j](x')) 
$$

然后就没了. 从作业题的角度来讲,这道题就解决了. 因为求多项式数列的前$i$项和的复杂度,只和多项式的系数个数相关. 

至于具体如何做到快速求多项式数列前$i$项和, 实现方法如下.

## 实现: 高斯消元

快速的多项式求前i项合. 即给一个多项式数列$f(i)$,快速求出$\sum_{x=1}^{i} f(x)$.

求多项式前i项合,又可以分解成求[Sums of powers], 即$sum(i, k) = \sum_{x=1}^{i} x^k$.

我们都学过$sum(n, 1) = n(n + 1)/2$, $sum(n, 2) = n(n + 1)(2n+1)/6$,但对于更大的k,应该怎么办?

方法很简单,直接暴力使用高斯消元求$sum(i,k)$的各项系数.

代码实现: [AZB_Solver.ipynb]

## 后记

这个题目的dp思路其实并不复杂,一旦有了头绪,便可以顺藤摸瓜想到底层用高斯消元来搞定多项式数列的前i项合. 整个写出来,个人感觉还是很有"高层结构精巧+底层暴力美学"的画面感的.

[Sums of powers]: https://en.wikipedia.org/wiki/Sums_of_powers

[AZB_Solver.ipynb]: https://github.com/SryImNoob/ProblemSet/blob/master/homework/AZB_Solver.ipynb
