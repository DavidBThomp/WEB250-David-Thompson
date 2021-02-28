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
SELECT DISTINCT ?Country ?MaximumTemperature WHERE {
  ?countryItem wdt:P31 wd:Q6256;
    p:P6591 ?maximumTemperatureRecord.
  ?maximumTemperatureRecord psv:P6591 ?maximumTemperatureValue.
  ?maximumTemperatureValue wikibase:quantityAmount ?maximumTemperatureQuantity;
    wikibase:quantityUnit ?temperatureUnit.
  {
    ?countryItem rdfs:label ?Country.
    FILTER((LANG(?Country)) = "en")
  }
  {
    ?temperatureUnit wdt:P5061 ?unitSymbol.
    FILTER((LANG(?unitSymbol)) = "en")
    FILTER(CONTAINS(?unitSymbol, "C"))
  }
  BIND(CONCAT(STR(?maximumTemperatureQuantity), " ", ?unitSymbol) AS ?MaximumTemperature)
}
ORDER BY (?Country)
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

        records.sort(function(a, b) {return b.celsius - a.celsius});
        let result = formatTable(records);

        //Sorts table in order of celsius and puts table in the variable result
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
    
    let country = object.Country.value;
    // Extracts the value of country binding

    let celsius = object.MaximumTemperature.value;
    // Extracts the value of Maximum Temperature Binding

    let index = celsius.indexOf(" °C");
    if (index < 0) {
        throw "Invalid data format";
    }
    // If a celsius value doesn't have then invalid

    celsius = Number(celsius.substring(0, index));
    // Celsius in number ignoring all else

    let fahrenheit = celsius * 9 / 5 + 32;
    // Fahrenheit Temp

    let record = {}; //Associative array
    record.country = country;
    record.celsius = celsius;
    record.fahrenheit = fahrenheit;
    // All 3 values in record
    return record;
}

function formatTable(records) {
    let result = "<table><tr><th>Country</th>"
    result += "<th>Celsius</th>";
    result += "<th>Fahrenheit</th></tr>";
    // Top Row of Table

    for (index = 0; index < records.length; index++) {
        let record = records[index];
        result += "<tr><td>" + record.country + "</td>";
        result += "<td>" + record.celsius.toFixed(1) + "° C</td>";
        result += "<td>" + record.fahrenheit.toFixed(1) + "° F</td></tr>";        
    }
    // Input values for table
    
    result += "</table>";
    // End table

    return result;
}

module.exports = router;