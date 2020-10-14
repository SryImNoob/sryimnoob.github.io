---
layout: post
title: AutoValue和Optional小记
categories: Tech
description: Modern Java in Action, 2nd Edition, Chapter 11
tags: Tech Java
---

# AutoValue和Optional小记

读Modern Java in Action, 2nd Edition, 划水一篇小记

AutoValue User Guide: [https://github.com/google/auto/blob/master/value/userguide/builders-howto.md](https://github.com/google/auto/blob/master/value/userguide/builders-howto.md)

java.util.Optional: [https://docs.oracle.com/javase/8/docs/api/java/util/Optional.html](https://docs.oracle.com/javase/8/docs/api/java/util/Optional.html)

## Nullable and Optional

使用AutoValue的时候, 有些fields需要是Nullable的, 有两种处理方式:
  - 使用Nullable,
  - 使用Optional.

**Nullable**
```java
@AutoValue
public abstract class Foo {
  public static Foo create(@Nullable Bar bar) {
    return new AutoValue_Foo(bar);
  }

  @Nullable abstract Bar bar();
}
```
  
**Optional**
```java
@AutoValue
public abstract class Animal {
  public abstract Optional<String> name();

  public static Builder builder() {
    return new AutoValue_Animal.Builder();
  }

  @AutoValue.Builder
  public abstract static class Builder {
    // You can have either or both of these two methods:
    public abstract Builder setName(Optional<String> value);
    public abstract Builder setName(String value);
    public abstract Animal build();
  }
}
```

使用Nullable的缺点: `foo.bar().xxx().yyy()`, 这种调用链会抛出NullPointerException.

而使用Optional的缺点: [`java.util.Optional`]并不是Serializable的, 这会导致AutoValue也不可以Serializable. 

这种情况下, 可以使用[`com.google.common.base.Optional`], 不过Guava的Optional的接口和Java的并不完全一致...

比如java.util.Optional有flatMap,而com.google.common.base.Optional只有transform...

[`java.util.Optional`]: https://docs.oracle.com/javase/8/docs/api/java/util/Optional.html
[`com.google.common.base.Optional`]: https://guava.dev/releases/snapshot/api/docs/com/google/common/base/Optional.html

## 为什么Optional不支持Serializable

这几天看书才明白这个问题, java的Optional在设计的时候, 认为Optional应该只用在接口设计上, 而不是将fields声明称Optional类型. 所以说,java官方对Nullable fields的设计想法是这样的:

```java
public class Foo {
  @Nullable private Bar bar;
  public Optional<Bar> bar();
}
```

从这个角度来讲,AutoValue有必要更新一下自己的接口...


