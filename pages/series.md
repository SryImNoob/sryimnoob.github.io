---
layout: page
title: Series
description:
comments: false
menu: 系列
permalink: /series/
---

<section class="container posts-content">
  
{% assign sorted_series = site.posts | map: "series" | compact | uniq | sort %}
{% for series in sorted_series %}
  <h3 id="{{ series }}">{{ series }}</h3>
  <ol class="posts-list">
  {% for post in site.posts %}
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
