---
layout: post
title: "Sublime Text, the one you were looking for"
description: ""
category: 
tags: []
---
{% include JB/setup %}


Listen to this while reading: [Playlist](http://grooveshark.com/#!/mime29/collection/favorites)

# TIPS AND PACKAGES FOR SUBLIME TEXT ON MAC

## OS Integration

### Add a sublime service for files and folders

Open Automator
Add a Shell script task with the following command

    <path to the subl executable> -n $@

Select file or folders as input
Now you can open files and folders within sublime

### Add system executable for terminal access

    sudo ln -s “<path to the subl executable>” /bin/subl

Now you can do the following to open the current folder

    subl .


## Shortcuts

Main shortcut: Access all ST commands

    SHIFT+CMD+P

To select a word and select the next same word: 

    CMD+D

To select all identical words

    SHIFT+CMD+G

Search in the whole project: 

    CTRL+CMD+F

Fetch/Retreive files: 

    SHIFT+CMD+P “fetch” “package file” “wordpress or jquery...”

Advanced new file: 

    CMD+ALT+N

HTTP Request: Select request and press

    SHIFT+

Instant Search: Go to the first occurence of the search word

    CMD+I
    ENTER

Jump to anything: You can use fuzzy search

    CMD+P

If you want to edit a specific style in a specific css file

    ‘style.css@symbolname   ‘

If you want to access the symbols add ‘@’ before typing the symbol
To do the same thing:You can use directly

    CMD+R

You can also reach specific words within a file

    ‘style.css#word‘

Hide the side bar:

    CMD+K+B

Advanced New File:

    CMD+ALT+N


## Packages

**Package Control** :  Help you to manage any sublime text package!
_If you need to install a package not yet available from Package Control, just git clone the package into your package folder_

* **Advanced new file** : Automatically create subfolders when creating a new file
* **Zen Coding** :  Write HTML super quickly! “ul>li*4>a[href=#]{My link text}+.main+.footer” (Has been/Deprecated)
* **Emmett** : Future of Zen Coding - css quick generation - lorem210 TAB
* **Nettuts** : package or file auto-download management for projects requirements
* **Sidebar enhancements** : Improved projects right click options.”Open in browser”-> Can add a url attribute in the subl project file
* **Prefixr** :  Auto write multi browser compatible css
* **Xiki** : Navigate in your file system through Xiki Buffer
* **Sublime Linter** : Syntax check for python, java, php. Can deactivate with Disable Lint command
* **Gist** : Store Snippets in Github - need to setup your github credential in the plugin folder
* **DocBlockr** : Add smart comments in the code
* **PlainTasks** : Create tasks list
* **Http requester** : Send a HTTP request based on the selection
* **Live Reload** : Auto reload your web browser when hitting save


## Snippets

Snippets are your to automatically generate text or code from small keywords input followed by TAB.
Snippets can manage cursor position. It means that we can decide where the cursor will be in the text block and the user can go the next cursor location pressing TAB.


## Fetch (nettuts)

Allow you to pull zip files or any files automatically 
Edit the file fetch.sublime-settings in your project root folder
Then call the Fetch command and choose to fetch a single file or all files you want


## Regular expression

Sublime text supports regular expression to edit or search text
If you want to replace the first letter of many html h2 headers, you can do:

    CMD+I

type in : 
    <h2>.+</h2> and press ALT+ENTER

it select all occurrence, problem is, you select also the 'h2', not only the text
You can use backward negative matcher and forward positive matcher:

    (?<=<h2>).+(?=</h2>)

You can finally Title-ize the selected text using CMD+SHIFT+P Title and press Enter


## Vintage mode (VIM)

Just remove the disable package vintage in sublime config file and have fun !

    ci’ : change inner ‘ ’
    vi’ : visually select inner quote
    c4w: change 4 words
    vt,: visually select til the comma
    vf,: visually select to the comma selecting it too
    V: select the line
    . : repeat the last command


## Generic shortcuts

You can see the list off all shortcuts right here:
http://docs.sublimetext.info/en/latest/reference/keyboard_shortcuts_win.html



