---
layout: post
title: "Netstat port and processes"
description: ""
category: 
tags: []
---
{% include JB/setup %}


## Netstat

I just wanted to monitor properly my server and know exactly what was running on what port.
As a reminder, I put the command line I used on my blog; after all it can be useful to anybody else!

To display all sockets state in Listening mode with executable name

	sudo netstat -palon

To display only listening sockets with executable name

	sudo netstat -plon

__If you don t use sudo, you won't be able to monitor all processes running on the server__

