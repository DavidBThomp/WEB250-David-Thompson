// This program creates and displays a temperature database
// with options to insert, update, and delete records.
//
// References:
//  https://en.wikibooks.org/wiki/JavaScript
//  https://zellwk.com/blog/async-await-express/
//  https://github.com/mapbox/node-sqlite3/wiki
//  https://blog.pagesd.info/2019/10/29/use-sqlite-node-async-await/
//  FOR Information on SQL https://www.sqlitetutorial.net/

const express = require("express");
const fs = require("fs");
const handlebars = require('handlebars');
const sqlite3 = require("sqlite3")
const router = express.Router();

const DATABASE = "temperature.db";//Database Name, Created with .open ((name))

router.get("/", async (request, response) => {
    let result = "";

    try {
        await checkDatabase();
        result = await getData();
    } //Checks for existence of Database
    catch(error) {
        result = error;
    }

    let source = fs.readFileSync("./templates/lesson9.html");
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
        let country = request.body.country.trim();
        let temperature = request.body.temperature.trim();
        // Take value input from html input country and temp

        if (!await countryExists(country)) { //If country exists
            await insertCountry(country, temperature) //Insert country with temp
        } else if (temperature != "") { //if temp is not blank
            await updateCountry(country, temperature) // update table with country and temp
        } else { //other wise, country name deletes sql row data
            await deleteCountry(country) //deletes row data if country is only input
        }

        result = await getData();
    }
    catch(error) {
        result = error;
    }

    let source = fs.readFileSync("./templates/lesson9.html");
    let template = handlebars.compile(source.toString());
    let data = {
        table: result
    }
    result = template(data);
    response.send(result);
});

async function checkDatabase() {
    let sql = `
            SELECT COUNT(*) AS Count FROM sqlite_master
            WHERE name = 'Countries';
        `// Takes count of database amount where the name is Countires (temperature is DB, Countries is table)
    let parameters = {};
    let rows = await sqliteAll(sql, parameters);
    if (rows[0].Count > 0) {
        return;
    }
    sql = `
        CREATE TABLE Countries(
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Country TEXT UNIQUE NOT NULL,
            Temperature REAL NOT NULL);
        `// Creates the Table countries, with country and temperature as data
    parameters = {};
    await sqliteRun(sql, parameters);
}

async function getData() {
    let sql = `
            SELECT ID, Country, Temperature FROM Countries;
        `//Selects data from SQlite3 database
    let parameters = {};
    let rows = await sqliteAll(sql, parameters);
    
    let result = "<table><tr><th>ID</th>";
    result += "<th>Country</th>";
    result += "<th>Temperature</th></tr>";
    for (i = 0; i < rows.length; i++) {
        result += "<tr><td>" + rows[i].ID + "</td>"
        result += "<td>" + rows[i].Country + "</td>"
        result += "<td>"+ rows[i].Temperature + "</td></tr>"
    }
     // Takes data from SQLITE and puts into table
    result += "</table>"    
    return result;
}

async function countryExists(country) {
    let sql = `
            SELECT EXISTS(
                SELECT * FROM Countries
                WHERE Country = $country) AS Count;
        ` //Test of existence of rows and gets count
    let parameters = {
        $country: country
    }; // First dictonay for country
    let rows = await sqliteAll(sql, parameters);
    let result = !!rows[0].Count;
    return result;
}

async function insertCountry(country, temperature) {
    let sql = `
            INSERT INTO Countries (Country, Temperature)
            VALUES($country, $temperature);
        ` //Inserts values from table form of values $country and $temperature
    let parameters = {
        $country: country,
        $temperature: temperature
    };
    await sqliteRun(sql, parameters);
}

async function updateCountry(country, temperature) {
    let sql = `
            UPDATE Countries
            SET Temperature = $temperature
            WHERE Country = $country;
        ` // Updates the countries tables with country and temp
    let parameters = {
        $country: country,
        $temperature: temperature
    };
    await sqliteRun(sql, parameters);
}

async function deleteCountry(country) {
    let sql = `
            DELETE FROM Countries
            WHERE Country = $country;
        ` // Deletes country if only country is input
    let parameters = {
        $country: country
    };
    await sqliteRun(sql, parameters);
}



async function sqliteAll(sql, parameters) {
    let promise = new Promise((resolve, reject) => {
        let database = new sqlite3.Database(DATABASE);
        database.serialize();
        database.all(sql, parameters, function(error, rows) {
            if (error)
                reject(error);
            else
                resolve(rows);
        });
        database.close();
    });

    let result = await promise;
    return result;
}

async function sqliteRun(sql, parameters) {
    let promise = new Promise((resolve, reject) => {
        let database = new sqlite3.Database(DATABASE);
        database.serialize();
        database.run(sql, parameters, function(error, rows) {
            if (error)
                reject(error);
            else
                resolve(rows);
        });
        database.close();
    });

    let result = await promise;
    return result;
}

module.exports = router;