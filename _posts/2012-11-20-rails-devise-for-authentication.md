---
layout: post
title: "[RAILS] Devise for Authentication"
description: ""
category: 
tags: []
---
{% include JB/setup %}


## Devise and Cancan


### Authentication with Devise

https://github.com/plataformatec/devise

After adding the gem to your Gemfile 

	gem 'devise'
  bundle

Execute the following command to install devise to your rails app

	rails generate devise:install
      create  config/initializers/devise.rb
      create  config/locales/devise.en.yml

	Some setup you must do manually if you haven't yet:

	  1. Ensure you have defined default url options in your environments files. Here 
	     is an example of default_url_options appropriate for a development environment 
	     in config/environments/development.rb:

	       config.action_mailer.default_url_options = { :host => 'localhost:3000' }

	     In production, :host should be set to the actual host of your application.

	  2. Ensure you have defined root_url to *something* in your config/routes.rb.
	     For example:

	       root :to => "home#index"

	  3. Ensure you have flash messages in app/views/layouts/application.html.erb.
	     For example:

	       <p class="notice"><%= notice %></p>
	       <p class="alert"><%= alert %></p>

	  4. If you are deploying Rails 3.1 on Heroku, you may want to set:

	       config.assets.initialize_on_precompile = false

	     On config/application.rb forcing your application to not access the DB
	     or load models when precompiling your assets.

Generate models

	rails generate devise User 
      invoke  active_record
      create    db/migrate/20121120054816_devise_create_users.rb
      create    app/models/user.rb
      invoke    test_unit
      create      test/unit/user_test.rb
      create      test/fixtures/users.yml
      insert    app/models/user.rb
       route  devise_for :users

Generate the views

	rails generate devise:views users
		invoke    Devise::Generators::SharedViewsGenerator
        create    app/views/users/shared
        create    app/views/users/shared/_links.erb
        invoke  form_for
        create    app/views/users/confirmations
        create    app/views/users/confirmations/new.html.erb
        create    app/views/users/passwords
        create    app/views/users/passwords/edit.html.erb
        create    app/views/users/passwords/new.html.erb
        create    app/views/users/registrations
        create    app/views/users/registrations/edit.html.erb
        create    app/views/users/registrations/new.html.erb
        create    app/views/users/sessions
        create    app/views/users/sessions/new.html.erb
        create    app/views/users/unlocks
        create    app/views/users/unlocks/new.html.erb
        invoke  erb
        create    app/views/users/mailer
        create    app/views/users/mailer/confirmation_instructions.html.erb
        create    app/views/users/mailer/reset_password_instructions.html.erb
        create    app/views/users/mailer/unlock_instructions.html.erb

We want a hasAndBelongsToMany (HABTM) Role Authorization model
We start by creating a role table

  rails generate model role name:string 
      invoke  active_record
      create    db/migrate/20121120084742_create_roles.rb
      create    app/models/role.rb
      invoke    test_unit
      create      test/unit/role_test.rb
      create      test/fixtures/roles.yml

Then before the rake db:migrate we modify some files

  class UsersHaveAndBelongToManyRoles < ActiveRecord::Migration
      def self.up
          create_table :roles_users, :id => false do |t|
              t.references :role, :user
          end
      end

      def self.down
          drop_table :roles_users
      end
  end

  And your models look like this:

  # User Model
  class User < ActiveRecord::Base
      has_and_belongs_to_many :roles
      ....

  # Role model
  class Role < ActiveRecord::Base
      has_and_belongs_to_many :users
  end 

*we can now run the rake db:migrate command*

Then we need to add a method to check the roles in our User model

  def role?(role)
    return !!self.roles.find_by_name(role.to_s.camelize)
  end

Insert some default roles

  Role.create(:name => 'Admin')
  Role.create(:name => 'Owner')

Execute the command

  rake db:seed



### Authorizations with Cancan

https://github.com/ryanb/cancan

Add the gem to your Gemfile

  gem "cancan"
  bundle

Then execute the command to generate the Ability file

  rails g cancan:ability
    create  app/models/ability.rb


Finally define de authorizations per role in the ability.rb file

  class Ability
    include CanCan::Ability
    def initialize(user)
      user ||= User.new # guest user

          if user.role? :admin
              can :manage, :all
          else
              can :read, :all
          end
    end
  end

Locking down all pages can also be a solution
Just put the following line into your ApplicationController

  check_authorization





