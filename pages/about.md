---
layout: page
title: About
subtitle: 决斗格格巫
keywords: 
comments: true
menu: 关于
permalink: /about/
---

在那山的那边海的那边, 有一群菜菜子

他们活泼又聪明, 他们调皮又灵敏

他们自由自在生活在那, 绿色的大森林

他们善良勇敢相互都关心

Ou...可爱的菜菜子

Ou...可爱的菜菜子

## 技能列表

{% for skill in site.data.skills %}
### {{ skill.name }}
<div class="btn-inline">
{% for keyword in skill.keywords %}
<button class="btn btn-outline" type="button">{{ keyword }}</button>
{% endfor %}
</div>
{% endfor %}

## 联系

<ul>
{% for website in site.data.social %}
<li>{{website.sitename }}：<a href="{{ website.url }}" target="_blank">@{{ website.name }}</a></li>
{% endfor %}
</ul>
