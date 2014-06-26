#!/usr/bin/env bash

JOB="http://jenkins.instructure.com/job/canvas-plugins-core/2747/"
curl http://localhost:8777/job/log?link=$JOB