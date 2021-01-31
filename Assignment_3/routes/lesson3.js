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
const router = express.Router()

router.get("/", function (request, response) {
    let result = "";
    if (request.query.yards) {
        let yards = request.query.yards;
        let meters = yards * 1.093613;
        result = yards + " yards are " +
            meters + " meters";
    }

    let source = fs.readFileSync("./templates/lesson3.html");
    let template = handlebars.compile(source.toString());
    let data = {
        yards: result,
        meters: ""
    }
    result = template(data);
    response.send(result);
});


// router.POST("/", function (request, response) {
//     let result = "";

//     if (request.body.feet) {
//         let feet = request.body.feet;
//         let centimeters = feet * 30.48;
//         result = feet + " foot is " +
//             centimeters + " centimeters.";
//     }

//     let source = fs.readFileSync("./templates/lesson3.html");
//     let template = handlebars.compile(source.toString());
//     let data = {
//         centimeters: "",
//         feet: result
//     }
//     result = template(data);
//     response.send(result);
// });

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