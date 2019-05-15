#!/usr/bin/env bash

APP_PORT=$(grep APP_PORT .env | xargs)
APP_PORT=${APP_PORT#*=}

start "http://localhost:$APP_PORT/?episodeMessage=$*"
