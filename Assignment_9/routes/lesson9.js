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

const DATABASE = "pizza.db";//Database Name, Created with .open ((name))

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
        let custName = request.body.custName.trim();
        let address = request.body.address.trim();
        let pNumber = request.body.pNumber.trim();
        // Take value input from html input (Customer Name, Address, and Phone Number)

        if (!await countryExists(custName)) { //If country exists
            await insertCountry(custName, address, pNumber) //Insert country with temp
        } else if (address != "" || pNumber != "") { //if temp is not blank
            await updateCountry(custName, address, pNumber) // update table with country and temp
        } else { //other wise, country name deletes sql row data
            await deleteCountry(custName) //deletes row data if country is only input
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
            WHERE name = 'pizzaOrder';
        `// Takes count of database amount where the name is custName (pizza is DB, custName is table)
    let parameters = {};
    let rows = await sqliteAll(sql, parameters);
    if (rows[0].Count > 0) {
        return;
    }
    sql = `
        CREATE TABLE pizzaOrder(
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            custName TEXT UNIQUE NOT NULL,
            address TEXT NOT NULL,
            pNumber REAL NOT NULL);
        `// Creates the SQL table ID, custName, address, and pNumber
    parameters = {};
    await sqliteRun(sql, parameters);
}

async function getData() {
    let sql = `
            SELECT ID, custName, address, pNumber FROM pizzaOrder;
        `//Selects data from SQlite3 pizza database
    let parameters = {};
    let rows = await sqliteAll(sql, parameters);

    let result = "<table><tr><th>ID</th>";
    result += "<th>custName</th>";
    result += "<th>address</th>";
    result += "<th>pNumber</th></tr>";
    for (i = 0; i < rows.length; i++) {
        result += "<tr><td>" + rows[i].ID + "</td>"
        result += "<td>" + rows[i].custName + "</td>"
        result += "<td>" + rows[i].address + "</td>"
        result += "<td>"+ rows[i].pNumber + "</td></tr>"
    }
     // Takes data from SQLITE and puts into table
    result += "</table>"    
    return result;
}

async function countryExists(custName) {
    let sql = `
            SELECT EXISTS(
                SELECT * FROM pizzaOrder
                WHERE custName = $custName) AS Count;
        ` //Test of existence of rows and gets count
    let parameters = {
        $custName: custName
    }; // First dictonay for custName
    let rows = await sqliteAll(sql, parameters);
    let result = !!rows[0].Count;
    return result;
}

async function insertCountry(custName, address, pNumber) {
    let sql = `
            INSERT INTO pizzaOrder (custName, address, pNumber)
            VALUES($custName, $address, $pNumber);
        ` //Inserts values from table form of values $custName and $temperature
    let parameters = {
        $custName: custName,
        $address: address,
        $pNumber: pNumber
    };
    await sqliteRun(sql, parameters);
}

async function updateCountry(custName, address, pNumber) {
    let sql = `
            UPDATE pizzaOrder
            SET address = $address, 
            pNumber = $pNumber
            WHERE custName = $custName;
        ` // Updates the countries tables with country and temp
    let parameters = {
        $custName: custName,
        $address: address,
        $pNumber: pNumber
    };
    await sqliteRun(sql, parameters);
}

async function deleteCountry(custName) {
    let sql = `
            DELETE FROM pizzaOrder
            WHERE custName = $custName;
        ` // Deletes name if only country is input
    let parameters = {
        $custName: custName,
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