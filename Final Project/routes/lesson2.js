// This module returns a rendered template.
//
// References:
//  https://expressjs.com/en/starter/hello-world.html
//  https://expressjs.com/en/guide/routing.html
//  https://www.npmjs.com/package/handlebars
//  https://handlebarsjs.com/guide

const express = require('express')
const fs = require("fs");
const handlebars = require('handlebars');
const os = require("os");

const router = express.Router()
router.get("/", function (request, response) {
    let source = fs.readFileSync("./templates/lesson2.html");
    let dateTime = new Date();
    let host = os.hostname();
    let plat = os.platform();
    let vers = `Version: ${process.version}`;
    let template = handlebars.compile(source.toString());
    let data = {
        name: "world",
        date: dateTime,
        host: host,
        os: plat,
        lang: vers,
    }
    let result = template(data);    
    response.send(result);
});

module.exports = router;