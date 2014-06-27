#!/usr/bin/env bash

JOB="http://jenkins.instructure.com/job/canvas-sel-a-core/2969/"

curl http://localhost:8777/job?link=$JOB | json_pp