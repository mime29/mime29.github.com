---
layout: post
title: "Build a simple rails 3 server in 10 mins"
description: ""
category: 
tags: []
---
{% include JB/setup %}


Target
------

Build a json RESTful web server
* We want documents containing a language and a category
* We want the data to be accessible in JSON format
* We want an admin interface to edit data


How-to ?
--------

## Server creation example

	rails new myserver
	cd myserver

	rails generate scaffold Document title:string subtitle:string description:text file_url:string
	rails generate scaffold Category title:string
	rails generate scaffold Language locale:string

	rails generate migration AddCategoryReferenceToDocument category_id:reference
	rails generate migration AddLanguageReferenceToDocument language_id:reference

### In Document model

	class Document < ActiveRecord::Base
	  attr_accessible :description, :file_url, :subtitle, :title, :category_id, :language_id
	  belongs_to :category
	  belongs_to :language
	end

### In Category model

	class Category < ActiveRecord::Base
	  attr_accessible :title
	  has_many :documents, :dependent => :destroy
	end

### In Language model

	class Language < ActiveRecord::Base
	  attr_accessible :locale
	  has_many :documents, :dependent => :destroy
	end

### In Documents View add fields
	
    <div class="field">
        <%= f.label :language_id %><br />
        <%= collection_select(:document, :language_id, Language.all, :id, :locale) %>
    </div>
    <div class="field">
        <%= f.label :category_id %><br />
        <%= collection_select(:document, :category_id, Category.all, :id, :title) %>
    </div>

### In Routes.db Config add/uncomment

	root :to => 'documents#index'

### Erase your default public/index.html

	rm ./public/index.html

### Execute

	rake db:migrate

### Run your server

	rails server

DONE!