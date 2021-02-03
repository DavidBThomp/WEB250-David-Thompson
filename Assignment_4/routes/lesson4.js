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


    let inputNumber = Number(request.query.number);

    if (inputNumber) {
        result = processNumber(inputNumber);
    }
    else {
        result = template();
    }
    response.send(result);
});


function processNumber(inputNumber) {
    let runningTotal =+ inputNumber;
    console.log(runningTotal);

    let result = (`Input Number: ${inputNumber}
    Running Total: ${runningTotal}`);
    
    
    /*let result = "<table><tr><th>Celsius</th><th>Fahrenheit</th></tr>";
    let celsius = start;
    while (celsius <= stop) {
        let fahrenheit = celsius * 9 / 5 + 32;
        result += "<tr><td>" + celsius + "</td>";
        result += "<td>" + fahrenheit.toFixed(1) + "</td></tr>";
        celsius += increment;
    }
    result += "</table>";
    */
    
    let source = fs.readFileSync("./templates/lesson4.html");
    let template = handlebars.compile(source.toString());
    let data = {
        average: result
    }

    result = template(data);
    return result;
}


module.exports = router;