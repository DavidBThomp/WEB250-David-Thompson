# References:
#   https://code.visualstudio.com/docs/containers/quickstart-node
#   https://docs.docker.com/develop/develop-images/dockerfile_best-practices/
#   Code From: https://en.wikiversity.org/wiki/Docker/Express

FROM node:alpine
WORKDIR /usr/src/app

RUN npm install express
COPY . .

EXPOSE 3000
CMD ["node", "app.js"]
