---
layout: post
title: "[RAILS] S3 Storage"
description: ""
category: 
tags: [rails, Amazon, S3]
---
{% include JB/setup %}

# S3 Storage in a Ruby on Rails application

When deploying a web app on a Heroku server, it's good to know that the Heroku file system is READ ONLY.
If you need to upload files to your web app, one solution is to go for Amazon S3.
Many solutions are available, here are two of them explained.

### AWS S3 GEM

I used this solution in one of my projects.
You need to add this gem to your Gemfile

    gem 'aws-s3', '0.6.2', :require => 'aws/s3'

type the following command

    bundle

and then add the following code to your controller

    @@BUCKET = "nameofyourbucket"

    uploaded_io = params[:gallery][:thumbnail] //it was for a picture gallery... 
    filename = sanitize_filename(uploaded_io.original_filename)
    AWS::S3::S3Object.store(filename, uploaded_io.read, @@BUCKET, :access => :public_read)
    url = AWS::S3::S3Object.url_for(filename, @@BUCKET, :authenticated => false)
    
    params[:gallery][:thumbnail] = url
    @gallery = Gallery.new(params[:gallery])
    ...

Don't forget to add specific parameters in your application.rb
    
    AWS::S3::DEFAULT_HOST.replace "s3-ap-northeast-1.amazonaws.com"
    AWS::S3::Base.establish_connection!(
      :access_key_id     => 'ACCESS KEY, CAN BE FOUND IN YOUR CREDENTIAL MENU',
      :secret_access_key => 'Please check your management console on the S3 webpage'
    )

Then you're done! If you upload a file using the file_field type in your rhtml page,
it should work like a charm! In the sample code, the file_field should be named thumbnail.


### PAPERCLIP and S3

The best is to go directly to the official web page: https://devcenter.heroku.com/articles/paperclip-s3

