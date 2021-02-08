// This program reads a user-selected text file of Storms.
// Converts Winds to MPH and Saffir-Simpson Scale Category
//
// File format:
// Date,Storm,MaximumSustainWinds
// November 3, 1970,1970 Bhola cyclone,240 km/h
//
//  https://www.mathsisfun.com/temperature-conversion.html
//  https://en.wikibooks.org/wiki/JavaScript
//  https://www.npmjs.com/package/express-fileupload

const express = require('express')
const fs = require("fs");
const handlebars = require('handlebars');
const router = express.Router()

router.get("/", function (request, response) {
    let source = fs.readFileSync("./templates/lesson5.html");
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
        result += "<h2>" + file.name + "</h2>"; //Top Title of file uploaded
        result += "<table><tr><th>Date</th><th>Storm</th><th>MaximumSustainWinds</th><th>MilesPerHour</th><th>Saffir-SimpsonScale</th></tr>"; //Provides top 2 Table names
        result += processFile(file) //Runs processFile
    }

    let source = fs.readFileSync("./templates/lesson5.html");
    let template = handlebars.compile(source.toString());
    let data = {
        table: result //Result from table in handlebars template of table
    }
    result = template(data);
    response.send(result);
});

function processFile(file) {
    let text = file.data.toString(); //Converts file data to stirngs
    let lines = text.trim().split("\n"); //New lines after celcius are split in new array
    
    if (lines[0].toLowerCase().indexOf("date") >= 0) {
        lines.shift(); // remove heading line
    } // lines is now an array with all the data in single lines


    let table = [];
    for (let index = 0; index < lines.length; index++) {
        try {
            let array = processLine(lines[index]);
            table.push(array);
        }
        catch(error) {
            return error;
        }
    }

    return result //returns full table
}

function processLine(lines) {
    // Heading already Skipped
    let array = lines.split(",");
    if (array.length < 0) {
        throw "Invalid file format"
    }

    let date = array[0];
    let dateIndex = date.indexOf("T");
    let dateCheck = date.length;
    if (dateCheck < 0) {
        throw "Invalid file format"
    }
    date = (date.substring(0, dateIndex));
    array[0] = date;

    let storm = array[1]; //gets the value storm as values store in the 2nd column of array
    let stormCheck = storm.length;
    if (stormCheck < 0) {
        throw "Invalid file format"
    }


    let winds = array[2]; //Get the value maximumSustatinedWinds as the 3rd column of array
    let windsIndex = winds.indexOf(" ")
    let windsCheck = winds.length;
    if (windsCheck < 0) {
        throw "Invalid file format"
    }
    winds = Number(winds.substring(0, windsIndex));
    array[2] = winds;

    let milesPer = (winds * 0.621371);
    array.push(Number(milesPer.toFixed(2)));
    

    console.log(array);
}

module.exports = router;