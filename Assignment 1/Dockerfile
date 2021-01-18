// References:
//   https://repl.it/languages/express
//   https://expressjs.com/en/starter/hello-world.html
//   A carbon copy from https://en.wikiversity.org/wiki/Server-Side_Scripting/Introduction/Node.js_(Express)

FROM node:alpine
WORKDIR /usr/src/app

RUN npm install express
COPY . .

EXPOSE 3000
CMD ["node", "app.js"]
