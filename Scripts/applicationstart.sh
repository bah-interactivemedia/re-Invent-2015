#!/bin/bash
. ~/.bashrc

cd /var/www/donorschoose/Source/
npm update
npm install
bower install
grunt build
cd /var/www/donorschoose/Source/dist/server
export NODE_ENV=test
nodejs app.js >> /home/ubuntu/gruntlog/nodelog.log &
exit 0