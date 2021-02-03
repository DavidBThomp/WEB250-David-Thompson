// Demonstrates conditions, while loops and for loops using
// Celsius and Fahrenheit temperature conversion tables.
//
// References:
//  https://www.mathsisfun.com/temperature-conversion.html
//  https://en.wikibooks.org/wiki/JavaScript
//  https://stackabuse.com/get-query-strings-and-parameters-in-express-js/
//  https://flaviocopes.com/express-forms/
//  https://expressjs.com/en/guide/routing.html

const express = require('express')
const fs = require("fs");
const handlebars = require('handlebars');
const router = express.Router()

router.get("/", function (request, response) {
    let source = fs.readFileSync("./templates/lesson4.html");
    let template = handlebars.compile(source.toString());
    let data = {
        table: ""
    }
    result = template(data);
    response.send(result);
});

router.post("/", function (request, response) {
    let start = Number(request.body.start);
    let stop = Number(request.body.stop);
    let increment = Number(request.body.increment);
    let submit = request.body.submit;

    let result = "";
    if (submit == "Celsius") {
        result = processCelsius(start, stop, increment);
    }
    else if (submit == "Fahrenheit") {
        result = processFahrenheit(start, stop, increment);
    }
    else {
        result = "Unexpected submit value: " + submit;
    }

    let source = fs.readFileSync("./templates/lesson4.html");
    let template = handlebars.compile(source.toString());
    let data = {
        table: result
    }
    result = template(data);
    response.send(result);
});

function processCelsius(start, stop, increment) {
    let result = "<table><tr><th>Celsius</th><th>Fahrenheit</th></tr>";
    let celsius = start;
    while (celsius <= stop) {
        let fahrenheit = celsius * 9 / 5 + 32;
        result += "<tr><td>" + celsius + "</td>";
        result += "<td>" + fahrenheit.toFixed(1) + "</td></tr>";
        celsius += increment;
    }
    result += "</table>";
    return result;
}

function processFahrenheit(start, stop, increment) {
    let result = "<table><tr><th>Fahrenheit</th><th>Celsius</th></tr>";
    for (let fahrenheit = start; fahrenheit <= stop; fahrenheit += increment) {
        let celsius = (fahrenheit - 32) * 5 / 9;
        result += "<tr><td>" + fahrenheit + "</td>";
        result += "<td>" + celsius.toFixed(1) + "</td></tr>";
    }
    result += "</table>";
    return result;
}

module.exports = router;