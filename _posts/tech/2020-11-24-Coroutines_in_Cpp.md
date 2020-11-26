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

[**Coroutines in C**](https://www.chiark.greenend.org.uk/~sgtatham/coroutines.html)

之前自己写的和这个问题相关的文章,但之前这两篇更像解题草稿,写了很多解决思路,最终决定使用switch+macro来实现.

[**Cartesian Product**](https://freopen.com/lang/2020/08/11/Cartesian-Product.html): 这篇主要介绍了一下笛卡尔积问题,顺便炫了一下Cpp的可变模板参数(variadic templates).
 
[**Cartesian Product 2**](https://freopen.com/lang/2020/11/19/Cartesian-Product-2.html): 这篇写了一下如何从特制的Generator到通用的Generator实现, 即如何将使用Python yield写的generatro转化成Cpp代码.


## Solution based on switch statement

首先总结一下yield的语义.
```
0: int f() {
1:  int i = 0;
2:  while(i < 3) {
3:    yield i;
4:    i++;
5:  }
6:  return;
7: }

f() -> 0
f() -> 1
f() -> 2
f() -> error: no next element, it's done.
...
```

当我们第四次调用f()的时候,我们需要恢复到上次执行时的环境.所谓的环境,具体指的有两件事:
  - local variables: i需要恢复成为2.
  - 程序计数器: 再次调用时,我们将从yield的下一行开始执行, 即第4行 i++.


如何做到恢复局部变量:
  - 可以将所有变量都设成static的,调用f()就不会再次初始化.
  - 将局部变量打包成一个struct, 调用f()时,将它的局部变量传递给它.
简而言之,需要将局部变量的位置从栈上移动到堆上.

如何控制程序计数器:
  - 自己维护一个计数器状态,并将其和局部变量保存在一起,程序根据计数器状态,跳转到对应代码位置.

把这两个方法结合在一起,就产生了第一版的大框架,使用state来保存程序状态,然后将所有的控制流指令进行拆解,即if和while都拆成不同的代码块分布在case语句中:

if语句的拆解:
```
if(c) { a } else { b }

switch(state) {
case if_check: if(c) { state = if_true; continue; } else { state = if_false; continue; }
case if_true: { a; state = if_end; continue; }
case if_false: { b; }
case if_end: {}
}
```

while语句的拆解:
```
while(c) { a }

switch(state) {
case loop_check: if(!c) { state = loop_end; continue; }
case loop_body: { a; state = loop_check; continue; }
case loop_end: {}
}
```

yield语句的拆解:
```
yield x;

switch(state) {
case yield_body: { state = yield_end; return x; }
case yield_end: {}
}
```

刚刚那段程序的拆解结果如下:
```
int f(int &i, int &state) {
while(1) {
switch(state) {
case 1: i = 0;
case 2: if(i > 3) {state = 6; continue; } // while(i > 3)
case 3: { state = 4; return i; } // set state to the next line of yield, and return i.
case 4: i++;
case 5: { state = 2; continue; } // jump back to the beginning of the loop.
case 6: { // the conroutine is finished. }
}
}
}
```

## Design and Implementation, V1

[**Version One**](https://github.com/FiveEyes/FiveEyes.github.io/blob/master/assets/code/cpp/macro_yield.cpp)

写完Cartesian Product 2之后, 写了第一版,就是简单的使用宏把CP2中的switch自动化定义. 使用宏定义了自己的控制流语句IF,WHILE, 这样可以把所有的控制流自动拆解成对应case.

### Interface design

具体的原理就如上所述, 那么接下来就是API设计了.有以下几点需求吧:
  - 局部变量和state如何保存.
  - 如何表示Coroutine已经完成,比如hasNext() = false.
  - 如何对Coroutine传参和以及Coroutine如何返回值.(Generator是不需要传参的)
  
最终选定的方案如下:
```
template<typename T>
class Generator : public std::enable_shared_from_this<Generator<T>> {
public:
    int state;
    Generator() : state(0) {}
    virtual bool next(T& output) = 0;
    bool operator()(T& output) {
        return next(output);
    }
    shared_ptr<Generator<T>> getPtr() { return this->shared_from_this(); }
};
```

这个抽象的Generator类将next和hasNext压缩成一个函数,`bool next(T& output)`:
  - 如果Generator已经终止,则返回false.
  - 如果Generator还有下一个元素,则通过引用参数output来返回下一个元素.

使用样例代码:
```
Generator<int> gen;
int output;
while(gen.next(output)) cout << output << endl;
```

这个Generator也很方便转变成传统的Iterator,拆解成`T next()`和`bool hasNext()`,这个Adapter如下:
```
template<typename T>
class GenIter : public std::enable_shared_from_this<GenIter<T>> {
public:
    shared_ptr<Generator<T>> gen;
    T output;
    bool pending;
    GenIter(shared_ptr<Generator<T>> _gen) : gen(_gen),  pending(false) {}
    T next() {
        if(!pending) hasNext();
        if(pending) {
            pending = false;
        } else {
            // Error, Iterator is done.
        }
        return output;
    }
    bool hasNext() {
        if(pending) return pending;
        return pending = gen->next(output);
    }
    shared_ptr<GenIter<T>> getPtr() { return this->shared_from_this(); }
};
```

### Macro Implementation

接口设计完之后,还需要解决如何自动把control flow拆解成switch的case. 这就轮到Macro登场了.
```
bool f(int& output) {
  bool flag = true;
  if(flag) {
    flag = false;
    output = 1;
    yield;
  } else {
    output = 0;
    yield;
  }
}
```

首先设计一下自动化switch之后的样子:
```
// class members
int state = 0;
int flag;
bool f(int& output) {
  enum { beg_prg = 0, check_if1, true_if1, false_if1, end_if1, beg_yield1, end_yield1, beg_yield2, end_yield2, end_prg};
  while(1) {
  switch(state) {
  case beg_prg : flag = true;
  case check_if1 : if(!flag) {state = false_if1; continue;}
  case true_if1 : 
    flag = false; 
    output = 1;
    case beg_yield1 : state = end_yield1; return true;
    case end_yield1 : {}
    state = end_if1;
    continue;
  case false_if1 :
    output = 1;
    case beg_yield2 : state = end_yield2; return true;
    case end_yield2 : {}
  case end_if1 : {}
  case end_prg :
    state = end_prg;
    return false;
  }
  }
}
```

设计完毕之后只需要将对应的名字生成规则,和case生成规则写成macro即可. 代码如下:

```
#define BEG(name) BEG_##name
#define ELSE(name) ELSE_##name
#define END(name) END_##name
#define LAB(name) LAB_##name

#define DEC_BEG enum { PBEG = 0, PEND, 
#define DEC_IF(name) BEG(name), ELSE(name), END(name)
#define DEC_LOOP(name) BEG(name), END(name)
#define DEC_YIELD(name) BEG(name), END(name)
#define DEC_LABEL(name) LAB(name)
#define DEC_END };

#define PRG_BEG \
switch(state) { \
case PBEG: {}

#define PRG_END \
case PEND: {} \
default: { isAlive = false; return true; } }



#define IF(name,c,a,b) \
case BEG(name): { if(c) { {a;} state = END(name); return false; } else { state = ELSE(name); } } \
case ELSE(name): { b; } \
case END(name): {}

#define WHILE(name,c,s) \
case BEG(name): { if(!(c)) { state = END(name); return false; } {s;} state = BEG(name); return false; } \
case END(name): {}

#define YIELD(name) \
case BEG(name): { state = END(name); isAlive = true; return true; } \
case END(name): {}

#define CONTINUE(loop) { state = BEG(loop); return false; }
#define BREAK(loop) { state = END(loop); return false; }

#define SET_LABEL(name) case LAB(name) : {}
#define GOTO(label) { state = label; return false; }

#define RETURN() { state = PEND; return false; }
```

使用上面的宏重写刚刚的代码
```
bool f(int& output) {
  DEC_BEG
    DEC_IF(if1), DEC_YIELD(y1), DEC_YIELD(y2)
  DEC_END
  
  PRG_BEG
  flag = true;
  IF(flag, {
    flag = false;
    output = 1;
    YIELD(y1);
  }, {
    output = 0;
    YIELD(y2);
  });
  PRG_END
}
```

`DEC_BEG ... DEC_END`用来定义enum类型, `DEC_IF(if1), DEC_YIELD(y1), DEC_YIELD(y2)`会自动展开成每个语句所需要的enum名字.
`PRG_BEG ... PRG_END`用来封装switch, 然后使用`IF, YIELD`宏来重写控制流.

这就是第一版的设计方案,还有一些小细节上的处理,详情请看源码.

## Design and Implementation, V2

[**Version Two**](https://github.com/FiveEyes/FiveEyes.github.io/blob/master/assets/code/cpp/macro_v2.cpp)

尝试把宏定义的WHILE替换为Cpp原生的while, 然后发现居然可以编译, 并且运行正确. 这样就可以省去自己定义IF和WHILE, 并且通过`__line__`来免去提前声明YIELD语句.

从语法上来讲, 这一版的主要改进:
  - 去掉了`DEC_BEG ... DEC_END`环节,所有控制流都使用原生的cpp语句即可,if,while,for,等等.
  - 因为去掉了DEC环境,那么使用YIELD的时候,只需要`YIELD()`即可.
  
刚刚的代码,使用第二版重写如下:
```
bool f(int& output) {
  PRG_BEG
  flag = true;
  if(flag) {
    flag = false;
    output = 1;
    YIELD();
  } else {
    output = 0;
    YIELD();
  }
  PRG_END
}
```

是不是感到了黑科技的力量, WOW! AWESOME! AMAZING!

其实把宏展开之后的代码,一般人是不敢写的...展开后如下
```
bool f(int& output) {
  switch(state) {
  case 0:
  flag = true;
  if(flag) {
    flag = false;
    output = 1;
    state = 334;
    return true;
    case 334:; // Line 334
  } else {
    output = 0;
    state = 339;
    return true;
    case 339:; // Line 339.
  }
  case -1: { state=-1; return false; }
  }
  return false;
}
```

仔细阅读发现switch中间穿插着if语句,而case 334和case 339嵌入在ifelse之间...如果把这代码丢到code review里...EMM...

所以,第二版的改进就是基于switch的case其实就是goto的语法糖,而且可以插入在代码里的任何位置.
  - 当然还有个小前提,就是没有跳过任何局部变量的初始化步骤.
  - 但在我们的design里面,所有的局部变量都已经移动到了class的成员变量,代码里并没有任何真正局部变量,所以这一条限制我们可以无视.

第二点改进是如何省去声明yield语句:
  - 方法就是我们可以使用`__LINE__`来现场生成每一条yield所需要unique name,即它所在的行号,这样就不需要提前声明了.


## Examples

```
testFibGen(); 
testBetterHanoiGen();
testPrimeGen();
testSubsetGen();
testPermutationGen();
testBetterProdGen();
testGuessNumber();
testGuessYourNumber();
```

都在代码里, 很简单, 不解释了.

## Practise: Leetcode

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
        while(iter.next(output)) YIELD();
        output = root->val;
        YIELD();
        iter = make_shared<Helper>(root->right);
        while(iter.next(output)) YIELD();
        PRG_END
    }
};
```
代码写出来和深搜遍历打印一致,需要打印的地方替换成YIELD即可. 

然后使用之前定义的`GenIter`将它转化成具有hasNext函数的Iterator.
```
class BSTIterator {
public:
    GenIter<int> iter;
    BSTIterator(TreeNode* root) : iter(make_shared<Helper>(root)) {
        
    }
    
    /** @return the next smallest number */
    int next() {
        return iter.next();
    }
    
    /** @return whether we have a next smallest number */
    bool hasNext() {
        return iter.hasNext();
    }
};
```

### LC 281

### LC 341

### LC 604

### LC 1286
  
我Leetcode刷过的题目都在这, 自己扒翻一下吧: 
  - [Leetcode Solutions](https://github.com/FiveEyes/ProblemSet/tree/master/LeetCode)
