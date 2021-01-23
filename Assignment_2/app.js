// References:
//  https://repl.it/languages/express
//  https://expressjs.com/en/starter/hello-world.html
//  Code from: https://en.wikiversity.org/wiki/Server-Side_Scripting/Introduction/Node.js_(Express)
//  HandleBars: https://handlebarsjs.com/

// Purpose: 
//  Installation of Express and Handle bars. Points to a directory of /static. Requires the file hello. 
//  

const express = require("express");
const fs = require("fs");
const handlebars = require('handlebars');
const hello = require("./hello");

const app = express();
app.use(express.static(__dirname + '/static'));

app.get('/template', (request, response) => {
    let source = fs.readFileSync("./templates/template.html");
    let template = handlebars.compile(source.toString());
    let data = {
        name: "world"
    }
    let result = template(data);    
    response.send(result);
});

app.get('/code', (request, response) => {
    response.send(hello.main());
});

app.listen(3000, () => console.log('server started'));