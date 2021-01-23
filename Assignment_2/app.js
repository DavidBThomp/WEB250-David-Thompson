// References:
//  https://repl.it/languages/express
//  https://expressjs.com/en/starter/hello-world.html
//  Code from: https://en.wikiversity.org/wiki/Server-Side_Scripting/Introduction/Node.js_(Express)
//  HandleBars: https://handlebarsjs.com/
//  noobcoder1137 Routes Tutorial: https://youtu.be/miXhYmYqle8

// Purpose: 
//  Installation of Express and Handle bars. Then Creates 3 seperate ways to display a page from directory

const express = require("express");
const fs = require("fs");
const handlebars = require('handlebars');
const hello = require("./hello");
const lesson1 = require("./lesson1")

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

app.get('/lesson1', (request, response) => {
    response.send(lesson1.main());
});


app.listen(3000, () => console.log('server started'));