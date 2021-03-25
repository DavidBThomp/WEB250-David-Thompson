// This program creates and displays a temperature database
// with options to insert, update, and delete records.
//
// References:
//  https://en.wikibooks.org/wiki/JavaScript
//  https://zellwk.com/blog/async-await-express/
//  https://www.npmjs.com/package/redis

const express = require("express");
const fs = require("fs");
const handlebars = require('handlebars');
const redis = require("redis")
const router = express.Router();

// Requires a Redis installation to manage the database.
// Use of a Docker container is recommended.
// See https://en.wikiversity.org/wiki/Docker/Redis .
// If both the Node website and Redis are running in containers, 
// use 172.17.0.2 for the Redis host address.
// If the Node website and/or Redis are running locally, use 127.0.0.1
// for the Redis host address.

// const HOST = "172.17.0.2";
const HOST = "127.0.0.1";
const DATABASE = 0;

// Redis client
let client = null;

router.get("/", async (request, response) => {
    let result = "";

    try {
        client = redis.createClient({host: HOST, db: DATABASE})
        let result = await getData();
    }
    catch(error) {
        result = error;
    }

    let source = fs.readFileSync("./templates/lesson11.html");
    let template = handlebars.compile(source.toString());
    let data = {
        table: result
    }
    result = template(data);
    response.send(result);
});

router.post("/", async (request, response) => {
    let result = "";

    try {
        client = redis.createClient({host: HOST, db: DATABASE})
        let country = request.body.country.trim();
        let temperature = request.body.temperature.trim();

        if (!await countryExists(country)) { // Check if country Exists
            await insertCountry(country, temperature) //Insert country into database
        } else if (temperature != "") { // if temperture is not  empty, update country
            await updateCountry(country, temperature) //update country temp
        } else { //if country with no temp, delete country
            await deleteCountry(country)
        }

        result = await getData();
    }
    catch(error) {
        result = error;
    }

    let source = fs.readFileSync("./templates/lesson11.html");
    let template = handlebars.compile(source.toString());
    let data = {
        table: result
    }
    result = template(data);
    response.send(result);
});

async function getData() {
    let result = "<table><tr><th>Country</th>";
    result += "<th>Temperature</th></tr>";
    let countries = await getCountries(); //gets all key values from database
    countries.sort(); // sorts data
    for (i = 0; i < countries.length; i++) {
        let country = countries[i];
        let temperature = await getCountry(country); //
        result += "<tr><td>" + country + "</td>";
        result += "<td>"+ temperature + "</td></tr>";
    }
    result += "</table>";
    return result;
}

async function countryExists(country) {
    return new Promise(function(resolve, reject) {
        client.exists(country, function(err, key) {
         if (err)
             reject(err);
         else
             resolve(key); //If the Country already Exists, key returns as 1(True)
         });
     });
}

async function insertCountry(country, temperature) {
    return new Promise(function(resolve, reject) {
        client.set(country, temperature, function(err, key) { //Client.set puts the country name in, replaces existing set key
         if (err)
             reject(err);
         else
             resolve(key);
             console.log(key);
         });
     });
 }

 async function updateCountry(country, temperature) {
    return new Promise(function(resolve, reject) {
        client.set(country, temperature, function(err, key) {
         if (err)
             reject(err);
         else
             resolve(key);
         });
     });
}

async function deleteCountry(country) {
    return new Promise(function(resolve, reject) {
        client.del(country, function(err, key) { // deletes country (Key)
         if (err)
             reject(err);
         else
             resolve(key);
         });
     });
}

async function getCountries() {
    return new Promise(function(resolve, reject) {
       client.keys("*", function(err, keys) { //gets all key values from database
        if (err)
            reject(err);
        else
            resolve(keys);
        });
    });
}

async function getCountry(country) {
    return new Promise(function(resolve, reject) {
       client.get(country, function(err, key) { //gets the value of key -- example being key of Russia, gets the value of 23 temp
        if (err)
            reject(err);
        else
            resolve(key);
        });
    });
}

module.exports = router;