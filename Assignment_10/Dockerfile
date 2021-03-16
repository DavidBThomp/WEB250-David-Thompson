# References:
#   https://code.visualstudio.com/docs/containers/quickstart-node
#   https://docs.docker.com/develop/develop-images/dockerfile_best-practices/
#   Code From: https://en.wikiversity.org/wiki/Docker/Express
#   HandleBars template processor: https://harper.blackboard.com/webapps/discussionboard/do/message?action=list_messages&course_id=_145932_1&nav=discussion_board&conf_id=_174615_1&forum_id=_254198_1&message_id=_4762685_1

# Purpose: 
#   Installs express over port 3000, expecting file app.js

#   Installing NPM for VSC Testing: 
#   npm install express --save
#   npm install handlebars
#   npm install express-fileupload
#   npm install node-fetch
#   npm install sqlite3
#   npm install mongodb
#   Be in working directory and use "node app"

#   Docker Testing Instructions: 
#   touch {filename}
#   edit file in docker
#   docker build -t express-server .
#   docker run -d -p 3000:3000 --name=express-server express-server

FROM node:alpine
WORKDIR /usr/src/app

RUN npm install express handlebars os express-fileupload node-fetch sqlite3 mongodb
COPY . .

EXPOSE 3000
CMD ["node", "app.js"]


#   If a container fails use: docker logs express-server