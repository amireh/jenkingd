#!/usr/bin/env bash

JOB="http://jenkins.instructure.com/job/canvas-plugins-core-rails3/2824"

curl http://localhost:8777/job?link=$JOB | json_pp