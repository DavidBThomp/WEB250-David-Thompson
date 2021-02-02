// Converts a Fahrenheit temperature to Celsius using a GET request and
// converts a Celsius temperature to Fahrenheit using a POST request.
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
const { route } = require('./lesson1');
const router = express.Router()

router.get("/", function (request, response) {
    let result = "";

    if (request.query.yards) {
        console.log(request.query.yards);
        result = getYard(request.query.yards);
    }

    //template must always be rendered.
    //I think you need to render here.
    //Use conditions to determine which data values are calculated.
    //Render template once with all values.

    response.send(result);
});

function getYard(yard) {
    console.log(yards);
    let meters = yard * 1.0935;
    result = yard + " yards are " + meters + " meters."

    let source = fs.readFileSync("./templates/lesson3.html");
    let template = handlebars.compile(source.toString());
    let data = {
        yards: result,
        meters: ""
    }

    result = template(data);
    console.log(result);
    return result;
}

module.exports = router;