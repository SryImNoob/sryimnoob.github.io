---
layout: post
title: RecursiveTask试水
categories: Tech
description: Modern Java in Action, 2nd Edition, Chapter 15
tags: Tech Java
---

# RecursiveTask试水

## Java并发编程模型

Java一直在引进不同的异步模型:
  - Java ?: synchronized, Runnable, Thread.
  - Java 5: java.util.concurrent, ExecutorService, Callable, Future.
  - Java 7: RecursiveTask, fork/join.
  - Java 8: CompletableFuture.
  - Java 9: java.util.concurrent.Flow.
  
这里面个人感觉比较新奇的就是RecursiveTask. 第一印象吧,就是这货工作中应该没什么卵用,但特别适合用来构建一些递归算法or数据结构.

## 划分树, SortTree

瞬间想到的一个数据结构,划分树.这货的唯一用处就是做区间k大值,[POJ 2104](http://poj.org/problem?id=2104),每次查询复杂度O(logN).当然,还有一个更简单强大的数据结构可以实现相同的复杂度,主席树.

题外话,主席树,可以理解为一个棵可持久化的线段树.可持久化的用处在于,我们可以拿到任意两个操作之间的delta线段树.但主席树并不可以并行构建.

简单介绍一下划分树这个数据结构,这货其实是将归并排序的全过程以树的形式dump出来. 换句话说,就是将所有MergeSort的递归调用得到的有序的子数组,以树的形式储存起来.

如果只简单实现了划分树,那么可以得到一个O(logN * logN)的算法. 优化到O(logN)的想法,类似于使用归并排序求逆序数. 

合并两个有序子数组L和R成为有序的Root时,我们开额外一个数组,保存每个元素push入Root时,左子数组L已经pop了多少元素.

当然,这篇试水就是简单使用RecursiveTask来并行构建一下划分树.(并不想刷题,2333

把n=1e7之后,从任务管理器上还是能看到所有core都在跑的...可能是速度太快了,没太有感觉...

```java
import java.util.Arrays;
import java.util.concurrent.RecursiveTask;
import java.util.Optional;
import java.util.Random;


public class SortTree {
    private int[] sorted;
    private int begin;
    private int end;
    private SortTree leftChild;
    private SortTree rightChild;

    public SortTree(int[] sorted, int begin, int end, SortTree leftChild, SortTree rightChild) {
        this.sorted = sorted;
        this.begin = begin;
        this.end = end;
        this.leftChild = leftChild;
        this.rightChild = rightChild;
    }

    public boolean isLeaf() {
        return leftChild == null && rightChild == null;
    }

    public Optional<SortTree> leftChild() {
        return Optional.ofNullable(leftChild);
    }

    public Optional<SortTree> rightChild() {
        return Optional.ofNullable(rightChild);
    }

    public void print(String prefix) {
        System.out.print(prefix + "(" + begin + ", " + end + "): ");
        for (int i = 0; i < sorted.length; ++i) {
            System.out.print("" + sorted[i] + ", ");
        }
        System.out.println();
        if (!isLeaf()) {
            leftChild.print(prefix + "  ");
            rightChild.print(prefix + "  ");
        }
    }

    public static class RecursiveTaskBuilder extends RecursiveTask<SortTree> {
        static final long serialVersionUID = 0L;
        private int[] unsorted;
        private int begin;
        private int end;

        public RecursiveTaskBuilder(int[] unsorted, int begin, int end) {
            this.unsorted = unsorted;
            this.begin = begin;
            this.end = end;
        }

        @Override
        protected SortTree compute() {
            if (end - begin <= 1) {
                int[] sorted = subArray(unsorted, begin, end);
                return new SortTree(sorted, begin, end, null, null);
            }
            
            // System.out.println("compute " + begin + " " + end);
            
            int mid = (begin + end) / 2;
            RecursiveTaskBuilder leftBuilder = new RecursiveTaskBuilder(unsorted, begin, mid);
            leftBuilder.fork();
            RecursiveTaskBuilder rightBuilder = new RecursiveTaskBuilder(unsorted, mid, end);
            rightBuilder.fork();
            
            // System.out.println("sorting " + begin + " " + end);
            
            int[] sorted = subArray(unsorted, begin, end);
            Arrays.sort(sorted);
            
            // System.out.println("sorted " + begin + " " + end);
            
            SortTree rightChild = rightBuilder.join();
            // QSortTree rightChild = rightBuilder.compute();
            // Arrays.sort(curInd);
            SortTree leftChild = leftBuilder.join();
            // System.out.println("sorting " + begin + " " + end);
            // int l = 0, r = 0;
            // int[] indl = leftChild.sorted;
            // int[] indr = rightChild.sorted;
            // for(int i = 0; i < curInd.length; ++i) {
            // if(r == indr.length) {
            // curInd[i] = indl[l++];
            // } else if(l == indl.length) {
            // curInd[i] = indr[r++];
            // } else if(indr[r] < indl[l]) {
            // curInd[i] = indr[r++];
            // } else {
            // curInd[i] = indl[l++];
            // }
            // }
            
            // System.out.println("return " + begin + " " + end);
            
            return new SortTree(sorted, begin, end, leftChild, rightChild);
        }

        private static int[] subArray(int[] arr, int begin, int end) {
            int[] ret = new int[end - begin];
            for (int i = 0; i < end - begin; ++i) {
                ret[i] = arr[begin + i];
            }
            return ret;
        }

        public static RecursiveTaskBuilder create(int[] unsorted) {
            return new RecursiveTaskBuilder(unsorted, 0, unsorted.length);
        }
    }

    public static void main(String[] args) {
        int n = 10000000;
        Random ran = new Random();
        int[] s = new int[n];
        for(int i = 0; i < n; ++i) s[i] = i;
        for(int i = n - 1; i > 0; --i) {
            int j = ran.nextInt(i);
            int c = s[i];
            s[i] = s[j];
            s[j] = c;
        }
        RecursiveTaskBuilder builder = RecursiveTaskBuilder.create(s);
        long startTime = System.nanoTime();
        SortTree tree = builder.invoke();
        long endTime = System.nanoTime();
        long duration = (endTime - startTime);
        System.out.println("time: " + duration);
        // tree.print("");
    }
}
```





