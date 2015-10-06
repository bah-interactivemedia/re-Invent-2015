#!/bin/bash
. ~/.bashrc

cd /var/www/donorschoose/
npm update
npm install
bower install
grunt build --force
cd /var/www/donorschoose/dist/server
export NODE_ENV=production
node app.js >> /home/ec2-user/nodelog.log &
exit 0