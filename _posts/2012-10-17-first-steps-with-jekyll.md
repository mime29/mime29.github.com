---
layout: post
title: "First steps with Jekyll"
description: ""
category: 
tags: []
---
{% include JB/setup %}

# Jekyll First Steps

## Install

Installing Jekyll is very simple:

* gem install jekyll

## Bootstrap

* git clone https://github.com/plusjade/jekyll-bootstrap.git USERNAME.github.com
* cd USERNAME.github.com
* git remote set-url origin git@github.com:USERNAME/USERNAME.github.com.git
* git push origin master

*Install your public key to github:*
https://help.github.com/articles/error-permission-denied-publickey

## Add content

* rake page name="about.md"
* rake post title="Hello World"

## Publish

* git add .
* git commit -m "Add new content"
* git push origin master

