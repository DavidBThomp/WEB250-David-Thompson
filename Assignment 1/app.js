// References:
//   https://repl.it/languages/express
//   https://expressjs.com/en/starter/hello-world.html
//   Code from: https://en.wikiversity.org/wiki/Server-Side_Scripting/Introduction/Node.js_(Express)

const express = require('express');
const app = express();

app.get('/', (request, response) => {
    response.send('Hello David!');
});

app.listen(3000, () => console.log('server started'))
