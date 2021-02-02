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
        result = getYard(request.query.yards);
    }


    response.send(result);
});

function getYard(yard) {
    let meters = yard * 1.0935;
    result = yard + " yards are " + meters + " meters."

    let source = fs.readFileSync("./templates/lesson3.html");
    let template = handlebars.compile(source.toString());
    let data = {
        yards: result,
        meters: ""
    }

    result = template(data);
    return result;
}

router.get("/", function (request, response) {
    let result = "";

    if (request.query.feet) {
        let feet = request.query.feet;
        let centimeters = feet * 30.48;
        result = feet + " feet are " +
            centimeters + " centimeters";
    }

    let source = fs.readFileSync("./templates/lesson3.html");
    let template = handlebars.compile(source.toString());
    let data = {
        feet: result,
        centimeters: ""
    }
    result = template(data);
    response.send(result);
});

router.post("/", function (request, response) {
    let result = "";

    if (request.body.inches) {
        let inches = request.body.inches;
        let millimeters = inches * 25.4;
        result = inches + " inches is " +
            millimeters + " millimeters.";
    }

    let source = fs.readFileSync("./templates/lesson3.html");
    let template = handlebars.compile(source.toString());
    let data = {
        millimeters: "",
        inches: result
    }
    result = template(data);
    response.send(result);
});

module.exports = router;