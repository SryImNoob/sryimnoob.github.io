---
layout: page
title: Series
description:
comments: false
menu: 标签
permalink: /series/
---

<section class="container posts-content">
  
{% assign sorted_series = site.posts | map: "series" | sort %}
{% for series in sorted_series %}
  <h3 id="{{ series }}">{{ series }}</h3>
  <ol class="posts-list">
  {% for post in series.posts %}
    {% if post.series == series %}
    <li class="posts-list-item">
    <span class="posts-list-meta">{{ post.date | date:"%Y-%m-%d" }}</span>
    <a class="posts-list-name" href="{{ site.url }}{{ post.url }}">{{ post.title }}</a>
    </li>
    {% endif %}
  {% endfor %}
  </ol>
{% endfor %}
</section>

<!-- /section.content -->
