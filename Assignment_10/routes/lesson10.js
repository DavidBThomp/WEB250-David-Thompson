// This program creates and displays a temperature database
// with options to insert, update, and delete records.
//
// References:
//  https://en.wikibooks.org/wiki/JavaScript
//  https://zellwk.com/blog/async-await-express/
//  https://docs.mongodb.com/drivers/node/usage-examples

const e = require("express");
const express = require("express");
const fs = require("fs");
const handlebars = require('handlebars');
const mongodb = require("mongodb")
const router = express.Router();

// Requires a Mongo installation to manage the database.
// Use of a Docker container is recommended.
// See https://en.wikiversity.org/wiki/Docker/MongoDB .
// If both the Node website and Mongo are running in containers, 
// use 172.17.0.2 for the mongodb host address.
// If the Node website and/or Mongo are running locally, use 127.0.0.1
// for the mongodb host address.

// const HOST = "mongodb://172.17.0.2";
const HOST = "mongodb://localhost:27017";
const DATABASE = "pizzaOrder";
const COLLECTION = "orders";

router.get("/", async (request, response) => {
    let result = "";

    try {
        result = await getData();
    } catch (error) {
        result = error;
    }

    let source = fs.readFileSync("./templates/lesson10.html");
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
        // Button Information
        let submit = request.body.action;
        let update = request.body.update;
        let order = request.body.order;

        if (submit) {
            // Customer Info
            let firstName = request.body.firstName.trim();
            let lastName = request.body.lastName.trim();
            let address = request.body.address.trim();
            let phoneNumber = request.body.phoneNumber.trim();
            console.log(firstName, lastName, address, phoneNumber);
            await custInfoExists(firstName, lastName, address, phoneNumber);
            await insertCustInfo(firstName,lastName,address,phoneNumber);
        } else if (update) {
            // Customer Info
            let firstName = request.body.firstName.trim();
            let lastName = request.body.lastName.trim();
            let address = request.body.address.trim();
            let phoneNumber = request.body.phoneNumber.trim();
            await updateCustInfo(firstName,lastName,address,phoneNumber);
        }
        result = await getData();
    } catch (error) {
        result = error;
    }

    let source = fs.readFileSync("./templates/lesson10.html");
    let template = handlebars.compile(source.toString());
    let data = {
        table: result
    }
    result = template(data);
    response.send(result);
});

async function getData() {
    const client = mongodb.MongoClient(HOST);
    await client.connect();
    const database = client.db(DATABASE);
    const collection = database.collection(COLLECTION);
    const documents = await getDocuments(collection);

    let result = "<table><tr><th>ID</th>";
    result += "<th>First Name</th>";
    result += "<th>Last Name</th>";
    result += "<th>Address</th>";
    result += "<th>Phone Number</th></tr>";
    for (i = 0; i < documents.length; i++) {
        result += "<tr><td>" + documents[i]._id + "</td>";
        result += "<td>" + documents[i].firstName + "</td>";
        result += "<td>" + documents[i].lastName + "</td>";
        result += "<td>" + documents[i].address + "</td>";
        result += "<td>" + documents[i].phoneNumber + "</td></tr>";
    }
    result += "</table>";
    await client.close();
    return result;
}

async function getDocuments(collection) {
    return new Promise(function (resolve, reject) {
        collection.find().toArray(function (err, documents) {
            if (err)
                reject(err);
            else
                resolve(documents);
        });
    });
}

async function custInfoExists(firstName,lastName,address,phoneNumber) {
    const client = mongodb.MongoClient(HOST);
    await client.connect();
    const database = client.db(DATABASE);
    const collection = database.collection(COLLECTION);
    const filter = {
        firstName: firstName,
        lastName: lastName,
        address: address,
        phoneNumber: phoneNumber
    };
    const count = await collection.countDocuments(filter);
    await client.close();
    return !!(count);
}

async function insertCustInfo(firstName,lastName,address,phoneNumber) {
    const client = mongodb.MongoClient(HOST);
    await client.connect();
    const database = client.db(DATABASE);
    const collection = database.collection(COLLECTION);
    const document = {
        firstName: firstName,
        lastName: lastName,
        address: address,
        phoneNumber: phoneNumber
    };
    await collection.insertOne(document);
    await client.close();
}

async function updateCustInfo(firstName,lastName,address,phoneNumber) {
    const client = mongodb.MongoClient(HOST);
    await client.connect();
    const database = client.db(DATABASE);
    const collection = database.collection(COLLECTION);
    const filter = {
        firstName: firstName
    };
    const update = {
        "$set": {
            "lastName": lastName,
            "address": address,
            "phoneNumber": phoneNumber,
        }
    };
    await collection.updateOne(filter, update);
    await client.close();
}

module.exports = router;