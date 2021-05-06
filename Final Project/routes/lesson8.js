// This program reads JSON data from Wikidata with countries
// and Celsius temperatures. It displays the data in Celsius
// and Fahrenheit sorted in decending order by temperature.
//
// References:
//  https://www.mathsisfun.com/temperature-conversion.html
//  https://en.wikibooks.org/wiki/JavaScript
//  https://www.wikidata.org/wiki/Wikidata:SPARQL_query_service
//  https://hackersandslackers.com/making-api-requests-with-nodejs/
//  https://zellwk.com/blog/async-await-express/

const express = require('express')
const fetch = require('node-fetch');
const fs = require("fs");
const handlebars = require('handlebars');
const router = express.Router()

const URL = "https://query.wikidata.org/sparql";
const QUERY = `
SELECT DISTINCT ?Date ?Storm ?MaximumSustainedWinds
WHERE {
  ?stormItem wdt:P31 wd:Q8092.
  {
    ?stormItem rdfs:label ?Storm.
    FILTER((LANG(?Storm)) = "en")
  }

  ?stormItem wdt:P580 ?Date.
  
  ?stormItem wdt:P2895 ?MaximumSustainedWindsValue .
  ?stormItem p:P2895/psv:P2895 ?maximumSustainedWinds.
  ?maximumSustainedWinds wikibase:quantityUnit ?maximumSustainedWindsUnit.
  {
    ?maximumSustainedWindsUnit rdfs:label ?maximumSustainedWindsLabel.
    FILTER((LANG(?maximumSustainedWindsLabel)) = "en")
    FILTER(CONTAINS(?maximumSustainedWindsLabel, "kilometre per hour"))
  }
  BIND(CONCAT(STR(?MaximumSustainedWindsValue), " km/h") AS ?MaximumSustainedWinds)
}
ORDER BY (?Date)
`;

router.get("/", async function (request, response) {
    result = await getData();

    let source = fs.readFileSync("./templates/lesson8.html");
    let template = handlebars.compile(source.toString());
    let data = {
        table: result
    }
    result = template(data);
    response.send(result);
});

async function getData() {
    try {
        let data = await getRawData(URL, QUERY); 
        // Waits to get data from URL

        let records = getRecords(data);
        // Sorts the info in key,value format

        records.sort(function(a, b) {return b.maximumSustainedWinds - a.maximumSustainedWinds});
        let result = formatTable(records);

        //Sorts table in order of celsius and puts table in the variable
        return result;
    }
    catch(error) {
        return error;
    }
}

async function getRawData(url, query) {
    url += "?query=" + encodeURI(query);
    url += "&format=json";
    //formats the url to download as querty in json format

    return await fetch(url)
        .then(response => response.json());
        //Returns the download information from this query
}

function getRecords(data) {
    let records = [];
    //creates an array fot the records from the data of download
    for (let i = 0; i < data.results.bindings.length; i++) {

        record = getRecord(data.results.bindings[i]);
        // goes through the result of data and 
        // .results shows data from bindings
        // .bindings displays data in the bindings (country and Maxiumum Temp)

        records.push(record);
        // Put values from record below into array
    }
    return records;
}

function getRecord(object) {
    // object is data.results.binding[i]
    
    let date = object.Date.value;
    date = (date.substring(0,10));
    // Extracts the value of Date binding

    let storm = object.Storm.value;
    // Extracts the value of Storm Names

    let maximumSustainedWinds = object.MaximumSustainedWinds.value;
    // Extract the value of Maximum Winds KM/H

    let index = maximumSustainedWinds.indexOf(" km/h");
    if (index < 0) {
        throw "Invalid data format";
    }
    // If a maximumSustainedWinds doesn't have KM/H value doesn't have then invalid

    maximumSustainedWinds = Number(maximumSustainedWinds.substring(0, index));
    // Maximum Winds in number ignoring all else (kn/h)

    let milesPerHour = maximumSustainedWinds * 0.621371;
    milesPerHour = Number(milesPerHour.toFixed(2));
    // Miles Per Hour

    let scale = "";


    if (milesPerHour >= 157) {
        scale = "<td style=\"color:red\">Category Five";
    } else if (milesPerHour < 157 && milesPerHour >= 130) {
        scale = "<td style=\"color:darkorange\">Category Four";
    } else if (milesPerHour < 130 && milesPerHour >= 110) {
        scale = "<td style=\"color:orange\">Category Three";
    } else if (milesPerHour < 110 && milesPerHour >= 96) {
        scale = "<td style=\"color:yellow\">Category Two";
    } else {
        scale = "<td style=\"color:lightyellow\">Category One";
    }

    let record = {}; //Associative array
    record.date = date;
    record.storm = storm;
    record.maximumSustainedWinds = maximumSustainedWinds;
    record.milesPerHour = milesPerHour;
    record.scale = scale;
    // All 5 values in record
    return record;
}

function formatTable(records) {
    let result = "<table><tr><th>Date (YYYY-MM-DD)</th>";
    result += "<th>Storm</th>";
    result += "<th>Maximum Winds (KM/H)</th>";
    result += "<th>Maximum Winds (MP/H)</th>";
    result += "<th>Saffir-Simpson Scale</th></tr>";
    // Top Row of Table

    for (index = 0; index < records.length; index++) {
        let record = records[index];
        result += "<tr><td>" + record.date + "</td>";
        result += "<td>" + record.storm + "</td>";
        result += "<td>" + record.maximumSustainedWinds + " km/h</td>";
        result += "<td>" + record.milesPerHour + " mp/h</td>";
        result += record.scale + "</td></tr>";        
    }
    // Input values for table
    
    result += "</table>";
    // End table

    return result;
}

module.exports = router;