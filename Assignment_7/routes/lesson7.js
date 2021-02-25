// This program reads a user-selected text file of countries
// and Celsius temperatures. It displays the data in Celsius
// and Fahrenheit sorted in descending order by temperature.
//
// File format:
// Country,MaximumTemperature
// Bulgaria,45.2 °C
// Canada,45 °C
//
//  https://www.mathsisfun.com/temperature-conversion.html
//  https://en.wikibooks.org/wiki/JavaScript
//  https://www.npmjs.com/package/express-fileupload

const express = require('express')
const fs = require("fs");
const handlebars = require('handlebars');
const router = express.Router()

router.get("/", function (request, response) {
    let source = fs.readFileSync("./templates/lesson7.html");
    let template = handlebars.compile(source.toString());
    let data = {
        table: ""
    }
    result = template(data);
    response.send(result);
});

router.post("/", function (request, response) {
    let result = "";

    if (!request.files || Object.keys(request.files).length == 0) {
        result = "No file selected"
    } else {
        let file = request.files.file;
        result += "<h2>" + file.name + "</h2>";
        result += processFile(file); //Goes to processFile
    }

    let source = fs.readFileSync("./templates/lesson7.html");
    let template = handlebars.compile(source.toString());
    let data = {
        table: result
    }
    result = template(data);
    response.send(result);
});

function processFile(file) {
    let text = file.data.toString();
    let lines = text.trim().split("\n");
    if (lines[0].toLowerCase().indexOf("country") >= 0) {
        // remove heading line
        lines.shift();
    }

    let table = [];
    for (let index = 0; index < lines.length; index++) {
        try {
            let record = processLine(lines[index]);
            table.push(record);
        }
        catch(error) {
            return error;
        }
    }

    table.sort(function(a, b) {return b.celsius - a.celsius});
    result = formatTable(table);
    return result
}

function processLine(line) {
    let record = {}; //This is where records begin (Tables with dictanary)
    let array = line.split(",");
    if (array.length != 2) {
        throw "Invalid file format"
    }

    record.country = array[0]; //Country will be  array [0] AKA the first results
    let celsius = array[1]; // Celsius is the result of array [1]
    let index = celsius.indexOf(" °C");  // Take out anything beyond this
    if (index < 0) {
        throw "Invalid file format";
    }

    celsius = Number(celsius.substring(0, index)); //Trim Celc and make a number
    record.celsius = celsius; //Celsius will now be array[1]
    let fahrenheit = celsius * 9 / 5 + 32;
    record.fahrenheit = fahrenheit; //Fahrenheit will now be dict
    return record;
}

function formatTable(table) {
    let result = "<table><tr><th>Country</th>"
    result += "<th>Celsius</th>";
    result += "<th>Fahrenheit</th></tr>";

    for (index = 0; index < table.length; index++) {
        let record = table[index];
        result += "<tr><td>" + record.country + "</td>";
        result += "<td>" + record.celsius.toFixed(1) + "° C</td>";
        result += "<td>" + record.fahrenheit.toFixed(1) + "° F</td></tr>";        
    }

    result += "</table>";
    return result;
}

module.exports = router;