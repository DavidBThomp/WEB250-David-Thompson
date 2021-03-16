// This program creates and displays a temperature database
// with options to insert, update, and delete records.
//
// References:
//  https://en.wikibooks.org/wiki/JavaScript
//  https://zellwk.com/blog/async-await-express/
//  https://github.com/mapbox/node-sqlite3/wiki
//  https://blog.pagesd.info/2019/10/29/use-sqlite-node-async-await/
//  FOR Information on SQL https://www.sqlitetutorial.net/

const e = require("express");
const express = require("express");
const fs = require("fs");
const handlebars = require('handlebars');
const {
    request
} = require("http");
const sqlite3 = require("sqlite3");
const {
    resourceLimits
} = require("worker_threads");
const router = express.Router();

const DATABASE = "pizza.db"; //Database Name, Created with .open ((name))

router.get("/", async (request, response) => {
    let result = "";

    try {
        await checkDatabase();
        result = await getData();
    } //Checks for existence of Database
    catch (error) {
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
        let submit = request.body.action;
        let orderFName = request.body.fName;
        let orderLName = request.body.lName;
        let orderPNumber = request.body.phoneNumber;

        if (submit) {
            let custFName = request.body.custFName.trim();
            let custLName = request.body.custLName.trim();
            let address = request.body.address.trim();
            let pNumber = request.body.pNumber.trim();
            if (!await custNameExists(custFName)) { //If customer name exists
                await insertOrderInfo(custFName, custLName, address, pNumber); //Insert name with address and phone number
            } else if (address != "" || pNumber != "" || custLName != "") { //if address or phone numer NOT blank
                await updateOrderInfo(custFName, custLName, address, pNumber); // update table with new phone number and address
            }
            result = await getData(submit, orderFName, orderLName, orderPNumber)
        } else {
            result = await getData(submit, orderFName, orderLName, orderPNumber);
        }
    } catch (error) {
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
        ` // Takes count of database amount where the name is custFName (pizza is DB, custFName is table)
    let parameters = {};
    let rows = await sqliteAll(sql, parameters);
    if (rows[0].Count > 0) {
        return;
    }
    sql = `
        CREATE TABLE pizzaOrder(
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            custFName TEXT NOT NULL,
            custLName TEXT NOT NULL,
            address TEXT NOT NULL,
            pNumber REAL NOT NULL);
        ` // Creates the SQL table ID, custFName, address, and pNumber
    parameters = {};
    await sqliteRun(sql, parameters);
}

async function getData(submit, orderFName, orderLName, orderPNumber) {
    let sql = `
            SELECT ID, custFName, custLName, address, pNumber FROM pizzaOrder
        ` //Selects data from SQlite3 pizza database
    let parameters = {};
    let rows = await sqliteAll(sql, parameters);

    if (orderFName) {
        rows.sort(function (a, b) {
            return b.custFName - a.custFName
        });
    } else if (orderLName) {
        rows.sort(function (a, b) {
            return b.custLName - a.custLName
        });
    } else if (orderPNumber) {
        rows.sort(function (a, b) {
            return b.pNumber - a.pNumber
        });
    } else {
        rows = await sqliteAll(sql, parameters);
    }

    let result = "<table><tr><th>ID</th>";
    result += "<th>First Name</th>";
    result += "<th>Last Name</th>";
    result += "<th>Address</th>";
    result += "<th>Phone Number</th></tr>";

    for (i = 0; i < rows.length; i++) {
        result += "<tr><td>" + rows[i].ID + "</td>"
        result += "<td>" + rows[i].custFName + "</td>"
        result += "<td>" + rows[i].custLName + "</td>"
        result += "<td>" + rows[i].address + "</td>"
        result += "<td>" + rows[i].pNumber + "</td></tr>"
    }
    // Takes data from SQLITE and puts into table
    result += "</table>"
    return result;
}

async function custNameExists(custFName) {
    let sql = `
            SELECT EXISTS(
                SELECT * FROM pizzaOrder
                WHERE custFName = $custFName) AS Count;
        ` //Test of existence of rows and gets count
    let parameters = {
        $custFName: custFName
    }; // First dictonay for custFName
    let rows = await sqliteAll(sql, parameters);
    let result = !!rows[0].Count;
    return result;
}

async function insertOrderInfo(custFName, custLName, address, pNumber) {
    let sql = `
            INSERT INTO pizzaOrder (custFName, custLName, address, pNumber)
            VALUES($custFName, $custLName, $address, $pNumber);
        ` //Inserts values from table form of values $custFName and $temperature
    let parameters = {
        $custFName: custFName,
        $custLName: custLName,
        $address: address,
        $pNumber: pNumber
    };
    await sqliteRun(sql, parameters);
}

async function updateOrderInfo(custFName, custLName, address, pNumber) {
    let sql = `
            UPDATE pizzaOrder
            SET address = $address, 
            pNumber = $pNumber,
            custLName = $custLName;
            WHERE custFName = $custFName;
        ` // Updates the countries tables with phone number and address
    let parameters = {
        $custFName: custFName,
        $custLName: custLName,
        $address: address,
        $pNumber: pNumber
    };
    await sqliteRun(sql, parameters);
}

async function sqliteAll(sql, parameters) {
    let promise = new Promise((resolve, reject) => {
        let database = new sqlite3.Database(DATABASE);
        database.serialize();
        database.all(sql, parameters, function (error, rows) {
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
        database.run(sql, parameters, function (error, rows) {
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