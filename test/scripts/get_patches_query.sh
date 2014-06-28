#!/usr/bin/env bash

curl -s http://localhost:8777/patches?query=status:open+ownerin:tbd | json_pp