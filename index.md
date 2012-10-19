---
layout: page
title: Mikael Dev Blog
tagline: learn everyday
---
{% include JB/setup %}

Welcome to my github blog! I write here many things I learn about technologies. It helps me remember quickly how to do specific things.

## Latests posts

<ul class="posts">
  {% for post in site.posts %}
    <li><span>{{ post.date | date_to_string }}</span> &raquo; <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></li>
  {% endfor %}
</ul>

