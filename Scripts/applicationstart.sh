#!/bin/bash
. ~/.bashrc

export NODE_ENV=production

cd /var/www/donorschoose/
npm update
npm install
bower install

grunt build --force

cd /var/www/donorschoose/dist/server

echo "Starting NodeJS"
node app.js >> /home/ec2-user/nodelog.log &
echo "NodeJS started"

cd /var/www/donorschoose/
grunt build --force

exit 0

exit