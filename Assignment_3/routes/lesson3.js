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
    let source = fs.readFileSync("./templates/lesson3.html");
    let template = handlebars.compile(source.toString());
    let result = template();

    if (request.query.yards) {
        result = getYard(request.query.yards);
    } else if (request.query.feet) {
        result = getFeet(request.query.feet);
    } else if (request.query.inches) {
        result = getInches(request.query.inches)
    } else {
        result += "<p> Please insert valid data.</p>"
    }
    response.send(result);
});

function getYard(yard) {
    let meters = yard * 1.0935;
    let yardValue = yard + " yards are " + meters + " meters.";

    let source = fs.readFileSync("./templates/lesson3.html");
    let template = handlebars.compile(source.toString());
    let data = {
        yards: yardValue,
        meters: ""
    }

    result = template(data);
    return result;
}

function getFeet(feet) {
    let centimeters = feet * 30.48;
    let feetValue = feet + " feet are " + centimeters + " centimeters";

    let source = fs.readFileSync("./templates/lesson3.html");
    let template = handlebars.compile(source.toString());
    let data = {
    feets: feetValue,
    centimeters: ""
    }

    result = template(data);
    return result;
}

function getInches(inches) {
    let millimeters = inches * 25.4;
    let inchesValue = inches + " inches is " + millimeters + " millimeters.";

    let source = fs.readFileSync("./templates/lesson3.html");
    let template = handlebars.compile(source.toString());
    let data = {
    inches: inchesValue,
    millimeters: ""
    }

    result = template(data);
    return result;
}

module.exports = router;