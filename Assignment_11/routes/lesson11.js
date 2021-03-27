// This program creates and displays a temperature database
// with options to insert, update, and delete records.
//
// References:
//  https://en.wikibooks.org/wiki/JavaScript
//  https://zellwk.com/blog/async-await-express/
//  https://www.npmjs.com/package/redis

const {
    NODATA
} = require("dns");
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
        client = redis.createClient({
            host: HOST,
            db: DATABASE
        })
        let result = await getData();
    } catch (error) {
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
    let alldata = request.body.alldata;
    let alldatakeys = request.body.alldatakeys;



    try {
        client = redis.createClient({
            host: HOST,
            db: DATABASE
        })


        
        if (submit) {
            let username = request.body.username.trim();
            let password = request.body.password.trim(); //Not actually validating
            if (await userExists(username, password)) { // Check if username exists
                result = await getDataSingleUser(username);
            } else {
                result = await NoUser();
            }

        } else if (update) {
            let username = request.body.oldUsername.trim();
            let newPassword = request.body.newPassword.trim();
            let firstName = request.body.firstName.trim();
            let lastName = request.body.lastName.trim();
            let status = request.body.status;
            await insertUserKey(username, newPassword)
            await insertUserHash(username, newPassword, firstName, lastName, status);
            result = "<h2>Information updated.</h2>"
        } else if (alldata) {
            let username = request.body.allDataUser;
            result = await getDataFullHash(username);
        } else if (alldatakeys) {
            result = await getData();
        }
    } catch (error) {
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
    let result = "<table><tr><th>Users</th></tr>";
    let users = "";
    users = await getUsers();
    users.sort();

    for (i = 0; i < users.length; i++) {
        let user = users[i];
        result += "<tr><td>" + user + "</td></tr>";
    }
    result += "</table>";
    return result;
}

async function NoUser() {
    let result = "No users found for this username or password.";
    return result;
}

async function userExists(username, password) {
    return new Promise(function (resolve, reject) {
        client.exists(username, function (err, key) {
            if (err)
                reject(err);
            else
                resolve(key); //If the Country already Exists, key returns as 1(True)
        });
    });
}

async function insertUserKey(username, newPassword) {
        return new Promise(function(resolve, reject) {
            client.set(username, newPassword, function(err, key) {
             if (err)
                 reject(err);
             else
                 resolve(key);
             });
         });
    }

    async function getDataFullHash(username) {
        let result = "<h2>User Data</h2>"
        result += "<table><tr><th>User</th>";
        result += "<th>Password</th>";
        result += "<th>First Name</th>";
        result += "<th>Last Name</th>";
        result += "<th>Status</th></tr>";
        let users = "";
        users = await getSingleHash(username);  
        let password = (users["field1"]);
        let firstName = (users["field2"]);
        let lastName = (users["field3"]);
        let status = (users["field4"]);

        result += "<tr><td>" + username + "</td>";
        result += "<td>" + password + "</td>";
        result += "<td>" + firstName + "</td>";
        result += "<td>" + lastName + "</td>";
        result += "<td>" + status + "</td></tr>";
        result += "</table>";
        return result;
    }

    async function getSingleHash(username) {
        return new Promise(function (resolve, reject) {
            client.hgetall(username + "1",  function (err, key) {
                if (err)
                    reject(err);
                else
                    resolve(key);
            });
        });
    }

async function insertUserHash(username, newPassword, firstName, lastName, status) {
    return new Promise(function(resolve, reject) {
        client.hdel(username + "1", "field1", "field2", "field3", "field4");
        client.hmset(username + "1", "field1", newPassword, "field2", firstName, "field3", lastName, "field4", status, function(err, key) {
         if (err)
             reject(err);
         else
             resolve(key);
         });
     });
 }

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
        result += "<td>" + password + "</td></tr>";
    }
    result += "</table>";
    return result;
}

async function getSingleUser(username) {
    return new Promise(function (resolve, reject) {
        client.keys(username, function (err, key) {
            if (err)
                reject(err);
            else
                resolve(key);
        });
    });
}

async function getUsers() {
    return new Promise(function (resolve, reject) {
        client.keys("*", function (err, key) { //gets all key values from database
            if (err)
                reject(err);
            else
                resolve(key);
        });
    });
}

async function getUser(username) {
    return new Promise(function (resolve, reject) {
        client.get(username, function (err, key) { //gets the value of key -- example being key of Russia, gets the value of 23 temp
            if (err)
                reject(err);
            else
                resolve(key);
        });
    });
}

module.exports = router;