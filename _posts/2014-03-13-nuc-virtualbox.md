---
layout: post
title: "NUC VirtualBox"
description: ""
category: 
tags: []
---
{% include JB/setup %}


Setup the NUC
-------------

* Download Ubuntu Server Iso File
* sudo dd if=ubuntu-12.04.4-server-amd64.iso of=/dev/disk2 bs=8192
* Set the NUC to boot on USB first
* At the Ubuntu boot menu, press ESC to go to GRUB console
* Type the following command 

    cdrom-detect/try-usb=true

* Type exit to go back to the ubuntu boot menu
* Install Ubuntu

**NOTE: If you installed Ubuntu Desktop, I recommend to modify your grub startup settings from "-1" to "5" 
or the VM will be stuck in case the OS had to be forced shutdown.**


Sudoers
=======

Check that SUDOERS is set like this:

    %sudo   ALL=(ALL) NOPASSWD:ALL

and not like this:

    #%sudo  ALL=(ALL:ALL) ALL
    

Install Vagrant
---------------

https://gist.github.com/dergachev/3866825#vagrant-setup

http://www.vagrantup.com/downloads.html

    wget http://download.virtualbox.org/virtualbox/4.3.8/virtualbox-4.3_4.3.8-92456~Ubuntu~precise_i386.deb
    sudo dpkg -i virtualbox-4.3_4.3.8-92456\~Ubuntu\~precise_i386.deb

    sudo apt-get install dpkg-dev virtualbox-dkms
    wget https://dl.bintray.com/mitchellh/vagrant/vagrant_1.5.0_x86_64.deb
    dpkg -i vagrant_1.5.0_x86_64.deb
    sudo apt-get install linux-headers-$(uname -r)
    sudo dpkg-reconfigure virtualbox-dkms
    vagrant box add hashicorp/precise32


VirtualBox setup
----------------

http://amirshk.com/blog/2012/09/28/using-virtualbox-for-virtual-machines/

Add one of the following lines according to your distribution to your /etc/apt/sources.list:

  deb http://download.virtualbox.org/virtualbox/debian saucy contrib
  deb http://download.virtualbox.org/virtualbox/debian raring contrib
  deb http://download.virtualbox.org/virtualbox/debian quantal contrib
  deb http://download.virtualbox.org/virtualbox/debian precise contrib
  deb http://download.virtualbox.org/virtualbox/debian lucid contrib non-free
  deb http://download.virtualbox.org/virtualbox/debian wheezy contrib
  deb http://download.virtualbox.org/virtualbox/debian squeeze contrib non-free

(Up to version 3.2 the packages were located in the non-free section. Starting with version 4.0 they are located in the contrib section.)

The Oracle public key for apt-secure can be downloaded  here. You can add this key with

    wget -q http://download.virtualbox.org/virtualbox/debian/oracle_vbox.asc -O- | sudo apt-key add -
    sudo apt-get update

    sudo apt-get install dkms
    sudo apt-get install virtualbox-4.3

install guest additions in the VM

    NOTE ONLY: sudo apt-get install build-essential linux-headers-`uname -r` dkms

    https://github.com/dotless-de/vagrant-vbguest
    vagrant plugin install vagrant-vbguest

And on the host

    sudo VBoxManage extpack install Oracle_VM_VirtualBox_Extension_Pack-4.2.16-86992.vbox-extpack


Check VM USB Setup
------------------

UPDATE: http://yagamy.logdown.com/tags/vagrant

Add our server user to the vboxusers group
This should enable usb host access

    sudo usermod -aG vboxusers <username> 

Ensure you actually have USB support for your target VM:

    VBoxManage showvminfo "somevm" | grep USB

USB:             enabled

If it’s not set to “enabled” you’ll have to add USB support to your VM.  You’ll need to power off the VM to do this:

    VBoxManage modifyvm "somevm" --usb on --usbehci on

To attach a device that’s plugged into the same system as your VM (in my case, a Sony USB memory stick), grab its UID as follows:

    VBoxManage list usbhost

Sun VirtualBox Command Line Management Interface Version 3.1.4
(C) 2005-2010 Sun Microsystems, Inc.
All rights reserved.

Host USB Devices:
[...]
UUID:               2a2c7255-3b90-448e-aa7a-b1c5710ddd79
VendorId:           0x054c (*054C*)
ProductId:          0x0243 (*0243*)
Revision:           1.0 (0100)
Manufacturer:       Sony
Product:            Storage Media
SerialNumber:       6A08102832911
Address:            0x54c:0x243:256:/pci@0,0/pci108e,5347@2,1
Current State:      Busy

Create a usb filter which will tell VirtualBox to provide the USB device to your virtual machine when it’s detected as plugged in on the host:

    VBoxManage usbfilter add 0 --target "smartofficeVM_default_1395303674511_42792" --name usbstick --vendorid 0403 --productid 6001

Go ahead and power on your Virtual Machine.  You’ll notice that the USB device (if it’s currently plugged in) immediately becomes unavailable on the host.  
You can confirm that it’s attached and that you didn’t make a typo with the vendor and/or product IDs:

    VBoxManage showvminfo "somevm"

[...]
Currently Attached USB Devices:

UUID:               582313d4-1d51-41ea-a053-ba5ac552d2e5
VendorId:           0x054c (054C)
ProductId:          0x0243 (0243)
Revision:           1.0 (0100)
Manufacturer:       Sony
Product:            Storage Media
SerialNumber:       6A08102832911
Address:            0x54c:0x243:256:/pci@0,0/pci108e,5347@2,1


Setup your vagrant VM
-------------------------

Create a directory and deploy your custom vagrant VM

    mkdir projectname
    vagrant init hashicorp/precise64


Add your Chef repositories
Create a cookbooks directory and go inside it

    git clone git://github.com/opscode-cookbooks/vim.git
    git clone git://github.com/opscode-cookbooks/zsh.git
    git clone git://github.com/opscode-cookbooks/git.git
    git clone git://github.com/opscode-cookbooks/apt.git
    git clone git://github.com/tiokksar/chef-oh-my-zsh-solo.git
    git clone git://github.com/opscode-cookbooks/openssl.git
    git clone git://github.com/urbandecoder/couchbase.git
    git clone git://github.com/fnichol/chef-rvm.git -> rename chef-rvm folder to rvm


    optional
    git clone git://github.com/getaroom/chef-couchbase.git


edit your Vagrantfile

    # -*- mode: ruby -*-
    # vi: set ft=ruby :

    # Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
    VAGRANTFILE_API_VERSION = "2"

    Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
      config.vm.provider :virtualbox do |vb|
        vb.customize ["modifyvm", :id, "--usb", "on"]
        vb.customize ["modifyvm", :id, "--usbehci", "on"]
        vb.customize ["usbfilter", "add", "0",
            "--target", :id,
            "--name", "usbstick",
            "--vendorid", "0403",
            "--productid", "6001"]
      end

      # Every Vagrant virtual environment requires a box to build off of.
      config.vm.box = "hashicorp/precise64"

      # Create a forwarded port mapping which allows access to a specific port
      # within the machine from a port on the host machine. In the example below,
      # accessing "localhost:8080" will access port 80 on the guest machine.
      config.vm.network "forwarded_port", guest: 3000 , host: 3000

      # Create a public network, which generally matched to bridged network.
      # Bridged networks make the machine appear as another physical device on
      # your network.
      # config.vm.network "public_network", ip: "192.168.4.88"

      config.vbguest.auto_update = true

      # Enable provisioning with chef solo, specifying a cookbooks path, roles
      # path, and data_bags path (all relative to this Vagrantfile), and adding
      # some recipes and/or roles.
      #
      config.vm.provision "chef_solo" do |chef|
        chef.cookbooks_path = "cookbooks"
        #chef.roles_path = "../my-recipes/roles"
        chef.data_bags_path = "databags"
        #chef.add_role "web"

        chef.add_recipe "apt"
        chef.add_recipe "zsh"
        chef.add_recipe "chef-oh-my-zsh-solo"
        chef.add_recipe "vim"
        chef.add_recipe "git"
        chef.add_recipe "rvm::system"
        chef.add_recipe "openssl"
        chef.add_recipe "couchbase"
        chef.add_recipe "couchbase::server"

        # setup users (from data_bags/users/*.json)
        # chef.add_recipe "users::sysadmins" # creates users and sysadmin group
        #chef.add_recipe "users"
        #chef.add_recipe "users::sysadmin_sudo" # adds %sysadmin group to sudoers

        # homesick_agent and its dependencies
        #chef.add_recipe "root_ssh_agent::ppid" # maintains agent during 'sudo su root'
        # chef.add_recipe "ssh_known_hosts"
        # populates /etc/ssh/ssh_known_hosts from data_bags/ssh_known_hosts/*.json

        # You may also specify custom JSON attributes:

        #chef.json = { :users => "admin" }
        chef.json = {
          "couchbase" => {
            "server"=> {
              "password" => "Ken123"
            },
            "buckets" => {
              "bucketname" => {
                "type" => "couchbase",
                "username" => "bucketusername",
                "password" => "bucketpassword",
                "memory_quota_mb" => 300
              }
            }
          },
          "run_list" => ["recipe[couchbase::server]", "recipe[rvm::vagrant]"]
        }

        chef.log_level = :debug
      end
    end

add a user and personalise your shell
-------------------------------------

    sudo useradd admin -m -g admin -s /bin/zsh
    sudo passwd admin
    sudo apt-get install curl
    su admin
    curl -L http://install.ohmyz.sh | sh


Create your couchbase bucket
----------------------------

Go to /opt/couchbase/bin

./couchbase-cli bucket-create -c 127.0.0.1:8091 --bucket=bucketname --bucket-username=bucketusername --bucket-password=bucketpassword --bucket-type=couchbase --bucket-port=11211 --bucket-ramsize=200 --bucket-replica=1 -u Administrator -p Ken123


Add ssh key to access git
-------------------------

    vim id_rsa in ~/.ssh folder
    chmod 600 id_rsa

Add projects

    git clone git@gitlab.domain.com:root/eodriver.git
    git clone git@gitlab.domain.com:root/nfc_framework.git


Install RVM and Ruby 1.9.3
--------------------------

    \curl -sSL https://get.rvm.io | bash
    rvm install 1.9.3
    /bin/zsh --login
    rvm reload
    rvm use 1.9.3
    ruby --version


Couchbase Information
---------------------

Couchbase ports:

  11211, 11210, 11209, 4369,
  8091, 8092 and from 21100 to 21299.

couchbase-cli bucket-list -c 127.0.0.1:8091 -u Administrator -p Ken123

couchbase-cli bucket-delete -c 127.0.0.1:8091 --bucket=bucketname -u Administrator -p Ken123

couchbase-cli bucket-create -c 127.0.0.1:8091 --bucket=test_bucket \
      --bucket-type=couchbase --bucket-port=11211 --bucket-ramsize=300 \
      --bucket-replica=1 -u Administrator -p Ken123


Postgres Identification
-----------------------

    sudo -u postgres psql
    \password plan-service
    \q


