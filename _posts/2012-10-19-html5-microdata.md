---
layout: post
title: "HTML5 Microdata"
description: ""
category: 
tags: []
---
{% include JB/setup %}

## SEO and Microdata

Microdata is interesting to make your website more visible on the web.
According to these references, microdata will improve many things:

* [How Using Microdata Can Improve Your Website SEO](http://www.entrepreneur.com/article/223074)
* [W3C Microdata specification](http://www.w3.org/TR/microdata/#overview)

### Improvements through microdata

_Microdata can give the search-engine spiders more context for the type of information on a website and the way the site should be indexed and ranked._
_Another benefit of microdata is the creation of "rich snippets," which display more information on the search result pages than traditional listings._

### Microdata sample

    <div itemscope id="amanda" itemref="a b"></div>
        <p id="a">Name: <span itemprop="name">Amanda</span>
        </p>
        <div id="b" itemprop="band" itemscope itemref="c">  
        </div>
        <div id="c">
         <p>Band: <span itemprop="name">Jazz Band</span></p>
         <p>Size: <span itemprop="size">12</span> players</p>
        </div>
    </div>
