---
layout: post
title: Coroutines in Cpp
categories: Tech
description: 两个神奇的C语言特性, Switch + Macro, 实现Yield.
tags: Tech Cpp
---

# Coroutines in Cpp

代码都写完了, 但没空写一篇总结, 先写个标题占坑.

## History

写完发现自己重新发明了一个轮子... 这里有一份很好的总结:

[Coroutines in C](https://www.chiark.greenend.org.uk/~sgtatham/coroutines.html)

自己以前和这个问题相关的博客, 这两篇更像解题草稿, 写了很多解决思路, 最终决定使用switch+宏来实现. 本篇的宏只是众多解决方案之一, 并没有特别对本篇的宏写太多解释:

[Cartesian Product](https://freopen.com/lang/2020/08/11/Cartesian-Product.html)
 
[Cartesian Product 2](https://freopen.com/lang/2020/11/19/Cartesian-Product-2.html)

## Implementation

[**Version 1**](https://github.com/FiveEyes/FiveEyes.github.io/blob/master/assets/code/cpp/macro_yield.cpp)

写完Cartesian Product 2之后, 写了第一版, 就是简单的使用宏把CP2中的switch自动化定义. 使用宏定义了自己的控制流语句IF,WHILE, 这样可以把所有的控制流自动拆解成对应case.


[**Version 2**](https://github.com/FiveEyes/FiveEyes.github.io/blob/master/assets/code/cpp/macro_v2.cpp)

尝试把宏定义的WHILE替换为Cpp原生的while, 然后发现居然可以编译, 并且运行正确. 这样就可以省去自己定义IF和WHILE, 并且通过`__line__`来免去提前声明YIELD语句.

## Leetcode

写完第二版之后, 拿它把Leetcode上Iterator的题目都刷了...还挺好用的.
题目列表:

### [LC 173. Binary Search Tree Iterator](https://leetcode.com/problems/binary-search-tree-iterator/)

可以说是一个标准例题了... 要求实现一个二叉树的中序迭代器.
```
class Helper : public Generator<int> {
public:
    TreeNode * root;
    shared_ptr<Helper> iter;
    Helper(TreeNode * _root) : root(_root) {}
    bool next(int &output) {
        PRG_BEG
        if(root == NULL) RETURN();
        iter = make_shared<Helper>(root->left);
        YIELD_ALL(iter,output);
        output = root->val;
        YIELD();
        iter = make_shared<Helper>(root->right);
        YIELD_ALL(iter,output);
        PRG_END
    }
};
```
代码写出来和深搜遍历打印一致,需要打印的地方替换成YIELD即可.

### LC 281

### LC 341

### LC 604

### LC 1286
  
我Leetcode刷过的题目都在这, 自己扒翻一下吧: 
  - [Leetcode Solutions](https://github.com/FiveEyes/ProblemSet/tree/master/LeetCode)
