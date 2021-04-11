// This program uses MongoDB to login
//
// References:
//  https://en.wikibooks.org/wiki/JavaScript
//  https://zellwk.com/blog/async-await-express/
//  https://docs.mongodb.com/drivers/node/usage-examples

const express = require("express");
const fs = require("fs");
const { unregisterDecorator } = require("handlebars");
const handlebars = require('handlebars');
const mongodb = require("mongodb")
const bcrypt = require("bcrypt");
const { count } = require("console");
const router = express.Router();

// Requires a Mongo installation to manage the database.
// Use of a Docker container is recommended.
// See https://en.wikiversity.org/wiki/Docker/MongoDB .
// If both the Node website and Mongo are running in containers, 
// use 172.17.0.2 for the mongodb host address.
// If the Node website and/or Mongo are running locally, use 127.0.0.1
// for the mongodb host address.

// const HOST = "mongodb://172.17.0.2";
// mongodb://localhost:27017 for Local server

// Logins Already Created:
// Brendan, Password
// admin, admin
// user, user

const HOST = "mongodb://localhost:27017";
const DATABASE = "pizzaOrder";
const COLLECTION = "users";
const COLLECTIONORDER = "orders";


router.get("/", async (request, response) => {
    let result = "";

    try {
        result = await findCollections();
    } catch (error) {
        result = error;
    }

    let source = fs.readFileSync("./templates/lesson12.html");
    let template = handlebars.compile(source.toString());
    let data = {
        table: result
    }
    result = template(data);
    response.send(result);
});

router.post("/", async (request, response) => {
    let result = "";
    let username = request.body.username;
    let password = request.body.password;
    let createLogin = request.body["createLogin"];
    let updateLogin = request.body["updateLogin"];
    let login = request.body["log-in"];

    await findCollections();

    try {

        if (createLogin) {

            if (!await userExists(username, password)) {
                await insertNewUser(username, password);
                result = "Login and Password Info Recorded.";
            } else {
                result = "User Already Exists.";
            }

        } else if (updateLogin) {

            if (await usernameExists(username)) {
                await updateUser(username, password);
                result = "User information updated.";
            } else {
                result = "User doesn't Exist.";
            }

        } else if (login) {

            if (await userExists(username, password)) {
                result = "User logged in!";
            } else {
                result = "Invalid username or password, please try again.";
            }

        }




    } catch (error) {
        result = error;
    }

    let source = fs.readFileSync("./templates/lesson12.html");
    let template = handlebars.compile(source.toString());
    let data = {
        table: result
    }
    result = template(data);
    response.send(result);
});

async function findCollections() {
    const client = mongodb.MongoClient(HOST);
    await client.connect();

    const database = client.db(DATABASE);

    const collection = database.collection(COLLECTION);
    const collectionOrder = database.collection(COLLECTIONORDER);

    const usersDocument = await getUsers(collection);
    const orderDocuemnt = await getOrders(collectionOrder);


}

async function getUsers(collection) {
    return new Promise(function (resolve, reject) {
        collection.find().toArray(function (err, documents) {
            if (err)
                reject(err);
            else
                resolve(documents);
        });
    });
}

async function getOrders(collectionOrder) {
    return new Promise(function (resolve, reject) {
        collectionOrder.find().toArray(function (err, documents) {
            if (err)
                reject(err);
            else
                resolve(documents);
        });
    });
}

async function userExists (username, password) {
    const client = mongodb.MongoClient(HOST);
    await client.connect();
    const database = client.db(DATABASE);
    const collection = database.collection(COLLECTION);
    const filter = {
        username: username,
        password: password
    };
    const count = await collection.countDocuments(filter);
    await client.close();
    return !!(count);
}

async function usernameExists(username) {
    const client = mongodb.MongoClient(HOST);
    await client.connect();
    const database = client.db(DATABASE);
    const collection = database.collection(COLLECTION);
    const filter = {
        username: username
    };
    const count = await collection.countDocuments(filter);
    await client.close();
    return !!(count);
}


async function insertNewUser(username, password) {
    const client = mongodb.MongoClient(HOST);
    await client.connect();
    const database = client.db(DATABASE);
    const collection = database.collection(COLLECTION);
    const document = {
        username: username,
        password: password
    };
    await collection.insertOne(document);
    await client.close();
}

async function updateUser(username, password) {
    const client = mongodb.MongoClient(HOST);
    await client.connect();
    const database = client.db(DATABASE);
    const collection = database.collection(COLLECTION);

    const filter = {
        username: username
    };

    const update = {
        "$set": {
            "username": username,
            "password": password
        }
    };

    await collection.updateOne(filter, update);
    await client.close();
}





module.exports = router;