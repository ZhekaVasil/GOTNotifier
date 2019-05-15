#!/usr/bin/env bash
appPort=`./jq.exe '.appPort' config.json`
echo $appPort
start "http://localhost:$appPort/?episodeMessage=$*"
