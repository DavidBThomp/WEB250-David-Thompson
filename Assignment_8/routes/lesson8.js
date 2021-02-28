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
        let records = getRecords(data);
        records.sort(function(a, b) {return b.celsius - a.celsius});
        let result = formatTable(records);
        return result;
    }
    catch(error) {
        return error;
    }
}

async function getRawData(url, query) {
    url += "?query=" + encodeURI(query);
    url += "&format=json";

    return await fetch(url)
        .then(response => response.json());
}

function getRecords(data) {
    let records = [];
    for (let i = 0; i < data.results.bindings.length; i++) {
        record = getRecord(data.results.bindings[i]);
        records.push(record);
    }
    return records;
}

function getRecord(object) {
    let country = object.Country.value;
    let celsius = object.MaximumTemperature.value;
    let index = celsius.indexOf(" °C");
    if (index < 0) {
        throw "Invalid data format";
    }

    celsius = Number(celsius.substring(0, index));
    let fahrenheit = celsius * 9 / 5 + 32;

    let record = {};
    record.country = country;
    record.celsius = celsius;
    record.fahrenheit = fahrenheit;
    return record;
}

function formatTable(records) {
    let result = "<table><tr><th>Country</th>"
    result += "<th>Celsius</th>";
    result += "<th>Fahrenheit</th></tr>";

    for (index = 0; index < records.length; index++) {
        let record = records[index];
        result += "<tr><td>" + record.country + "</td>";
        result += "<td>" + record.celsius.toFixed(1) + "° C</td>";
        result += "<td>" + record.fahrenheit.toFixed(1) + "° F</td></tr>";        
    }

    result += "</table>";
    return result;
}

module.exports = router;