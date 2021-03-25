// This program creates and displays a temperature database
// with options to insert, update, and delete records.
//
// References:
//  https://en.wikibooks.org/wiki/JavaScript
//  https://zellwk.com/blog/async-await-express/
//  https://www.npmjs.com/package/redis

const { NODATA } = require("dns");
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
    let submit = request.body.submit;
    let update = request.body.update;



    try {
        client = redis.createClient({host: HOST, db: DATABASE})
        
        if (submit) {
            let username = request.body.username.trim();
            let password = request.body.password.trim();
        if (await userExists(username)) { // Check if username exists
            result = await getDataSingleUser(username);
        } else {
            result = await NoUser();
        }
    } else if (update) {
        console.log("Update Info")
    }
        //     await insertCountry(country, temperature) //Insert country into database
        // } else if (temperature != "") { // if temperture is not  empty, update country
        //     await updateCountry(country, temperature) //update country temp
        // } else { //if country with no temp, delete country
        //     await deleteCountry(country)
        // }


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
    let result = "<table><tr><th>User</th>";
    result += "<th>Password</th></tr>";
    let users = "";
    users = await getUsers();
    users.sort();

    for (i = 0; i < users.length; i++) {
        let user = users[i];
        let passwords = await getUsers();
        result += "<tr><td>" + user + "</td>";
        result += "<td>"+ passwords + "</td></tr>";
    }
    result += "</table>";
    return result;
}

async function NoUser() {
    let result = "No users found for this username or password.";
    return result;
}

async function userExists(username) {
    return new Promise(function(resolve, reject) {
        client.exists(username, function(err, key) {
         if (err)
             reject(err);
         else
             resolve(key); //If the Country already Exists, key returns as 1(True)
         });
     });
}

// async function insertCountry(country, temperature) {
//     return new Promise(function(resolve, reject) {
//         client.set(country, temperature, function(err, key) { //Client.set puts the country name in, replaces existing set key
//          if (err)
//              reject(err);
//          else
//              resolve(key);
//              console.log(key);
//          });
//      });
//  }

//  async function updateCountry(country, temperature) {
//     return new Promise(function(resolve, reject) {
//         client.set(country, temperature, function(err, key) {
//          if (err)
//              reject(err);
//          else
//              resolve(key);
//          });
//      });
// }

async function getDataSingleUser(username) {
    let result = "<h2>Username and password exists</h2>"
    result += "<table><tr><th>User</th>";
    result += "<th>Password</th></tr>";
    let users = "";
    users = await getSingleUser(username);

    for (i = 0; i < users.length; i++) {
        let user = users[i];
        let password = await getUser(username); //
        result += "<tr><td>" + user + "</td>";
        result += "<td>"+ password + "</td></tr>";
    }
    result += "</table>";
    return result;
}

async function getSingleUser(username) {
    return new Promise(function(resolve, reject) {
        client.keys(username, function(err, key) {
         if (err)
             reject(err);
         else
             resolve(key);
         });
     });
}

async function getUsers() {
    return new Promise(function(resolve, reject) {
       client.keys("*", function(err, keys) { //gets all key values from database
        if (err)
            reject(err);
        else
            resolve(keys);
        });
    });
}

async function getUser(username) {
    return new Promise(function(resolve, reject) {
       client.get(username, function(err, key) { //gets the value of key -- example being key of Russia, gets the value of 23 temp
        if (err)
            reject(err);
        else
            resolve(key);
        });
    });
}

module.exports = router;