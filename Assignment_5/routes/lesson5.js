// This program reads a user-selected text file of Celsius
// temperatures and converts the temperatures to Fahrenheit.
//
// File format:
// Country,MaximumTemperature,3rdOption
// Bulgaria,45.2 °C,3rdOption1
// Canada,45 °C,3rdOption2
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
    let result = "<table><tr><th>Celsius</th><th>Fahrenheit</th></tr>"; //Provides top 2 Table names
    let text = file.data.toString(); //Converts file data to stirngs
    let lines = text.trim().split("\n"); //New lines after celcius are split in new array

    // forEach doesn't return a value. Using global.forEach instead.
    global.forEach = "";

    lines.forEach(processLine); //calls to process each line in array

    result += global.forEach; //adds each global foreach from processLine
    delete global.forEach; 

    result += "</table>"; //Ends table
    return result //returns full table
}

function processLine(line) {
    // skip heading
    let index = line.indexOf("Country,MaximumTemperature"); //returns first occurance of string entered* b 
    if (index >= 0) {
        return;
    }

    // find temperature
    let start = line.indexOf(","); //Find the first string of "," 
    let end = line.indexOf("°C"); //finds the first string of "°C"
    if (start < 0 || end < 0) { //If , or degree C is not found, then the file is invalid
        global.forEach += "Invalid file format";
        return
    } //If invalid then reutrn invalid file format, if valid keeps going
    let celsius = Number(line.substring(start + 1, end)); //Starts at the "," and takes anything between that and the end, which is the end of the number
    let fahrenheit = celsius * 9 / 5 + 32;  //Maths to get Fahrenheit

    global.forEach += "<tr><td>" + celsius + "</td>"; //Adds each array to table element
    global.forEach += "<td>" + fahrenheit.toFixed(1) + "</td></tr>"; //adds each fahrenheit element to table
}

module.exports = router;