---
layout: post
title: "Supervisor virtualenv and init.d"
description: ""
category: 
tags: []
---
{% include JB/setup %}


Virtualenv
----------

Used to isolate a python project from other python projects.
Basic commands are:

    virtualenv <project_name>
    source ./<project_name>/bin/activate
    deactivate

According to the documentation, activate only change the path.
http://www.virtualenv.org/en/latest/#activate-script


Supervisor
----------

Supervisor is used to monitor processes. Basically you launch supervisor, and when a process crashes, it restarts it.

    supervisord
    supervisorctl restart all # For manual restart
    supervisorctl shutdown # For supervisord shutdown

Supervisord uses a configuration file stored in the current folder

    supervisord.conf

A configuration file sample

    [unix_http_server]
    file=/tmp/supervisor.<project_name>.sock   ; (the path to the socket file)
    
    [supervisord]
    logfile=supervisord.log      ; (main log file;default $CWD/supervisord.log)
    logfile_maxbytes=50MB        ; (max main logfile bytes b4 rotation;default 50MB)
    logfile_backups=10           ; (num of main logfile rotation backups;default 10)
    loglevel=info                ; (log level;default info; others: debug,warn,trace)
    pidfile=/tmp/supervisor.<project_name>.pid ; (supervisord pidfile;default supervisord.pid)
    nodaemon=false               ; (start in foreground if true;default false)
    minfds=1024                  ; (min. avail startup file descriptors;default 1024)
    minprocs=200                 ; (min. avail process descriptors;default 200)
    
    [rpcinterface:supervisor]
    supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface
    
    [supervisorctl]
    serverurl=unix:///tmp/supervisor.<project_name>.sock ; use a unix:// URL  for a unix socket
    
    [program:gunicorn]
    command=/home/<user>/envs/<project_name>/bin/gunicorn -c /home/<user>/<project_name>/gunicorn.conf api.wsgi
    directory=/home/<user>/<project_name>/
    user=<user>
    autostart=true
    autorestart=true
    redirect_stderr=true


init.d
------

You want all your project to start automatically on startup right?
we will create a new startup linux task to handle that.

Create a job file for each project

    vim project-job

    #! /bin/bash -e
    
    PROJECT_FOLDER=/home/project
    VIRTUALENV_FOLDER=/home/envs/project/
    SUPERVISORD=${VIRTUALENV_FOLDER}bin/supervisord
    SUPERVISORCTL=${VIRTUALENV_FOLDER}bin/supervisorctl
    OPTS="-c supervisord.conf"
    ACTIVATE=${VIRTUALENV_FOLDER}bin/activate
    
    test -x $SUPERVISORD || exit 0
    
    . /lib/lsb/init-functions
    
        # Activate the virtualenv
    . $ACTIVATE 
    
    case "$1" in
      start)
        log_begin_msg "Starting ${0##*/} daemon manager..."
        cd $PROJECT_FOLDER
        $SUPERVISORD $OPTS || log_end_msg 1
        log_end_msg 0
        ;;
      stop)
        echo -n "Stopping ${0##*/} daemon manager... "
        cd $PROJECT_FOLDER
                $SUPERVISORCTL $OPTS shutdown || log_end_msg 1
        echo
        ;;
      restart)
        echo -n "Restarting ${0##*/} daemon manager... "
        cd $PROJECT_FOLDER
                $SUPERVISORCTL $OPTS restart all || log_end_msg 1
        echo
        ;;
        
      *)
        log_success_msg "Usage: /etc/init.d/${0##*/}
    {start|stop|reload|force-reload|restart}"
        exit 1
    esac
    
    exit 0

*BE CAREFUL: if you are 'supervisoring' a shell script starting a java program (or any other child process), use 'exec' before the command in order to replace the script PID for your child*

move the script to the /etc/init.d/ folder
and add it to the services list

    sudo update-rc.d service_name defaults



