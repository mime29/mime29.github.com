---
layout: post
title: "[RUBY] lambda and procs"
description: ""
category: 
tags: [ruby, lambda, procs]
---
{% include JB/setup %}

## Ruby Bits 

I followed the first lesson on the new section of codeschool called *Ruby bits*
Here are some notes about this first lesson

Website http://rubybits2.codeschool.com/levels/1


## Blocks and Procs

Ruby is about blocks.
We an store blocks into Proc

    p = Proc.new { puts "tweet" }
    p.call

Create an error proc:

    error = -> { raise "Auth Error" }

Can store blocks into lambda

    l = lambda {puts "tweet"}

staby lambdas ruby 1.9:

    l = { puts "tweets" }

To turn a proc to a block:

    tweets.each(&printer)

But we can also turn blocks to procs using again the & sign

