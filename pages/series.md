---
layout: page
title: Series
description:
comments: false
menu: 标签
permalink: /series/
---

<section class="container posts-content">
{% assign sorted_series = site.series | sort %}
{% for series in sorted_series %}
  <h3 id="{{ series[0] }}">{{ series | first }}</h3>
  <ol class="posts-list">
  {% for post in series.last %}
    <li class="posts-list-item">
    <span class="posts-list-meta">{{ post.date | date:"%Y-%m-%d" }}</span>
    <a class="posts-list-name" href="{{ site.url }}{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
  </ol>
{% endfor %}
</section>

<!-- /section.content -->
