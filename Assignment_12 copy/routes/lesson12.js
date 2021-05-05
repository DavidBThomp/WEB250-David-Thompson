// FINAL PROJECT

// Update the website routing structure to include the pizza order application.
// Update the pizza order application as needed based on your current understanding of server-side scripting and web development best practices.
// Create a database to record pizza order information. Your design should follow best practices for your selected database platform (relational SQL database, document database, or key-value database).
// Provide a way for customers to log in to the pizza order application to display and reorder their previous orders.
// Use a REST API to retrieve sales tax information based on the customer's zip code. Update order information based on the retrieved sales tax.
// Provide a way for staff to log in to the pizza order application and display current orders.
// Provide a way for staff to place, complete, and cancel orders.
// Provide a way for managers to display order and tax summary information.
// Validate all user input using server-side scripts.
// Validate all generated HTML and CSS.
// Record Selenium IDE tests to demonstrate functionality for each page of your website. Include a separate test for each page.
// Create a zip file of your entire website and Dockerfile and update your AWS Elastic Beanstalk web server application and verify that it works correctly.
// Update your git repository by adding a final project folder containing your entire unzipped website content, Dockerfile, and Selenium IDE tests.
// Update the README for your repository to add a paragraph that describes what you learned about server-side scripting in this course. Include how you intend to apply this learning in your world (educational goals, career opportunities, etc.).
// Use grammarly.com to proofread your work

// This program uses MongoDB to login, password encryption, and different page results
//
// References:
//  https://en.wikibooks.org/wiki/JavaScript
//  https://zellwk.com/blog/async-await-express/
//  https://docs.mongodb.com/drivers/node/usage-examples



// TO - DO
// Verify Manager has full control over all forms
// Make sure all pages direct users to correct follow up page
// Add correct information to follow up page

const express = require("express");
const fs = require("fs");
const {
    unregisterDecorator
} = require("handlebars");
const handlebars = require('handlebars');
const mongodb = require("mongodb")
const bcrypt = require("bcrypt");
const {
    count
} = require("console");
const {
    request
} = require("express");
const router = express.Router();


// Requires a Mongo installation to manage the database.
// Use of a Docker container is recommended.
// See https://en.wikiversity.org/wiki/Docker/MongoDB .
// If both the Node website and Mongo are running in containers, 
// use 172.17.0.2 for the mongodb host address.
// If the Node website and/or Mongo are running locally, use 127.0.0.1
// for the mongodb host address.

// const HOST = "mongodb://172.17.0.2";
// const HOST = "mongodb://mongo-server";
// mongodb://localhost:27017 for Local server

const HOST = "mongodb://localhost:27017";
const DATABASE = "pizzaOrder";
const COLLECTION = "users";
const COLLECTIONORDER = "orders";



router.get("/", async (request, response) => {
    let username = request.cookies.username;
    if (username = "j:null") {
        username = null;
    }
    let userid = request.session.userid;
    result = build_form(username, userid);
    response.send(result);
});

router.post("/", async (request, response) => {
    let result = "";
    let userid = "";
    let username = request.body.username;
    let password = request.body.password;

    // let userid = request.session.userid;

    // Buttons
    let createLogin = request.body["createLogin"];
    let deleteLogin = request.body["deleteLogin"];
    let login = request.body["log-in"];
    let logout = request.body["log-out"];
    let forgetme = request.body["forget-me"];
    let reload = request.body["reload"];
    let order = request.body["order"];
    let getAccount = request.body["getAccount"];
    let getAllAccounts = request.body["getAllAccounts"];
    let updateAccount = request.body["updateLogin"];

    let inputConfirmed = "";


    await findCollections();

    try {

        if (await findBaseUsers() === null) {
            await insertBaseUsers();
        }

        if (await findBaseOrders() === null) {
            let user = await findBaseUser(username);
            await insertBaseOrders(user);
        }

        if (createLogin) {
            let phone = request.body.phone;
            if (!await phoneExists(phone)) {
                let generatedHashedPassword = generateHashedPassword(password);
                let status = request.body.status;
                let fName = request.body.fName;
                let lName = request.body.lName;
                let address = request.body.address;
                let city = request.body.city;
                let state = request.body.state;
                let postCode = request.body.postCode;
                let email = request.body.email;

                let defaultstatus = "customer";

                if (status != null) {
                    defaultstatus = status;
                }

                await insertNewUser(username, generatedHashedPassword, fName, lName, address, city, state, postCode, email, phone, defaultstatus);

                inputConfirmed = "Login and Password info recorded, please login again.";

                let sessionID = request.session.userid;
                username = request.cookies.username;
                userid = sessionID;
                result = build_formManager(username, userid, inputConfirmed);
                response.send(result);

            } else {
                inputConfirmed = "Phone Number already linked to existing account, please contact admin for help.";
                let sessionID = request.session.userid;
                username = request.cookies.username;
                userid = sessionID;
                result = build_formManager(username, userid, inputConfirmed);
                response.send(result)
            }

        } else if (getAllAccounts) {

            let allUsers = await getAllAccountsInfo();

            var i;
            for (i = 0; i < allUsers.length; i++) {
                inputConfirmed += (`${allUsers[i].phone},`);
            }

            username = request.cookies.username;
            let sessionID = request.session.userid;
            userid = sessionID;
            result = build_formManager(username, userid, inputConfirmed);
            response.send(result);

        } else if (getAccount) {
            phone = request.body.phoneGet;
            if (await phoneExists(phone)) {
                let user = await findSingleUserPhone(phone);
                inputConfirmed = `<p> ${user.fName}, ${user.lName}</p>`
                let sessionID = request.session.userid;
                username = request.cookies.username;
                userid = sessionID;
                result = build_formManager(username, userid, inputConfirmed);
                response.send(result);
            }
        } else if (deleteLogin) {
            let phone = request.body.phone;
            if (await phoneExists(phone)) {
                await deleteUser(phone);
                inputConfirmed = `Account assocaited with phone number: "${phone}" deleted.`;

                result = build_formManager(username, userid, inputConfirmed);
                response.send(result)

                // Keep manager logged in
            } else {
                inputConfirmed = `Account assocaited with phone number: "${phone}" doesn't exist.`;
                result = build_formManager(username, userid, inputConfirmed);
                response.send(result)
            }
        } else if (order) {

            username = request.cookies.username;
            let user = await findSingleUser(username);

            phone = request.body.phoneOrder;


            if ( (phone === "") || (phone === null) || (phone === undefined) ) {
                phone = user.phone;
            }

            let salad = request.body.salad;
            let wings = request.body.wings;
            let fries = request.body.fries;


            let size = request.body.size;

            var price = 0;
            if (size === "Small") {
                price += +5.99
            } else if (size === "Medium") {
                price += +7.99
            } else if (size === "Large") {
                price += +9.99
            } else if (size === "X-Large") {
                price += +12.99
            }

            let pepperoni = request.body.pepperoni;
            let bacon = request.body.bacon;
            let sausage = request.body.sausage;
            let pineapple = request.body.pineapple;
            let onions = request.body.onions;
            let olives = request.body.olives;
            let bellpepper = request.body.bellpepper;
            let mushrooms = request.body.mushrooms;

            let notes = request.body.notes;
            notes = notes.trim();

            let sides = "";


            if (salad) {
                sides += "Salad ";
                price += 5.99;
            }
            if (wings) {
                sides += "Wings ";
                price += 3.99;
            }
            if (fries) {
                sides += "Fries ";
                price += 4.99;
            }
            if (sides === "") {
                sides += "None";
            }

            sides = sides.trim();

            let toppings = "";

            if (pepperoni) {
                toppings += "Pepperoni ";
                price += 0.99;
            }
            if (bacon) {
                toppings += "Bacon ";
                price += 0.99;
            }
            if (sausage) {
                toppings += "Sausage ";
                price += 0.99;
            }
            if (pineapple) {
                toppings += "Pineapple ";
                price += 0.99;
            }
            if (onions) {
                toppings += "Onions ";
                price += 0.99;
            }
            if (olives) {
                toppings += "Olives ";
                price += 0.99;
            }
            if (bellpepper) {
                toppings += "Bellpepper ";
                price += 0.99;
            }
            if (mushrooms) {
                toppings += "Mushrooms ";
                price += 0.99;
            }

            if (toppings === "") {
                toppings += "None";
            }

            toppings = toppings.trim();

            let userid = request.session.userid;




            await insertNewOrder(userid, toppings, size, sides, price, notes, phone);

            // response.send();



        } else if (updateAccount) {

            if (await phoneExists(phone)) {

                let generatedHashedPassword = generateHashedPassword(password);
                let status = request.body.status;
                let fName = request.body.fName;
                let lName = request.body.lName;
                let address = request.body.address;
                let city = request.body.city;
                let state = request.body.state;
                let postCode = request.body.postCode;
                let email = request.body.email;


                let defaultstatus = "customer";

                if (status != null) {
                    defaultstatus = status;
                }

                await updateUser(username, generatedHashedPassword, fName, lName, address, city, state, postCode, email, phone, defaultstatus);

                inputConfirmed = `User login for phone number ${phone} has been updated.`;
                let sessionID = request.session.userid;
                username = request.cookies.username;
                userid = sessionID;
                result = build_form(username, userid, inputConfirmed);
                response.cookie("username", username);
                response.send(result);
            } else {
                inputConfirmed = "Phone number doesn't exits."
                let sessionID = request.session.userid;
                username = request.cookies.username;
                userid = sessionID;
                result = build_form(username, userid, inputConfirmed);
                response.cookie("username", username);
                response.send(result);
            }

        } else if (login) {


            let user = await findSingleUser(username);
            if (await usernameExists(username)) {
                if (await authenticateUser(username, password)) {

                    if (request.session.page_views) {
                        request.session.page_views++;
                        inputConfirmed = ("You successfully logged in " + request.session.page_views + " times");
                    } else if (request.session.page_views = 1) {
                        inputConfirmed = ("Welcome to this page for the first time!");
                    }

                    let userid = user._id;
                    let status = user.status;
                    request.session.userid = userid;

                    if (status === "employee") {
                        result = build_formEmployee(username, userid, inputConfirmed);
                    } else if (status === "manager") {
                        result = build_formManager(username, userid, inputConfirmed);
                    } else if (status === "customer") {
                        result = build_formCustomer(username, userid, inputConfirmed);
                    }


                    response.cookie("username", username);
                    response.send(result);
                } else {

                    if (request.session.fail_views) {
                        request.session.fail_views++;
                        inputConfirmed = "Invalid password, please try again. There have been " + request.session.fail_views + " failed login attempts."
                    } else if (request.session.fail_views = 1) {
                        inputConfirmed = ("Welcome to this fail login attempt page for the first time!");
                    }

                    result = build_form(username, userid, inputConfirmed);
                    response.cookie("username", username);
                    response.send(result);
                }
            } else {
                let inputConfirmed = "Invalid username, please try again.";
                username = null;
                result = build_form(username, userid, inputConfirmed);
                response.cookie("username", username);
                response.send(result)
            }

        } else if (logout) {

            request.session.destroy();
            let username = request.cookies.username;
            let userid = null;
            result = build_form(username, userid, inputConfirmed);
            response.send(result);

        } else if (forgetme) {

            request.session.destroy();
            result = build_form(null, null);
            response.cookie("username", "", {
                expires: 0
            });
            response.send(result);

        } else if (reload) {

            response.redirect(request.originalUrl);

        } else if (order) {

        }

    } catch (error) {
        result = error;
    }
});

function build_formCustomer(username, userid, inputConfirmed) {
    let cookie = !!username;
    let session = !!userid;
    if (username && userid) {
        welcome = "Welcome back " + username + "! You are logged in."
    } else if (username) {
        welcome = "Welcome back " + username + "! Please log in.";
    } else {
        welcome = "Welcome! Please log in.";
    }

    let source = fs.readFileSync("./templates/lesson12customer.html");
    let template = handlebars.compile(source.toString());
    let data = {
        cookie: cookie,
        session: session,
        welcome: welcome,
        username: username,
        table: inputConfirmed
    }
    result = template(data);
    return result;
}

function build_formEmployee(username, userid, inputConfirmed) {
    let cookie = !!username;
    let session = !!userid;
    if (username && userid) {
        welcome = "Welcome back " + username + "! You are logged in."
    } else if (username) {
        welcome = "Welcome back " + username + "! Please log in.";
    } else {
        welcome = "Welcome! Please log in.";
    }

    let source = fs.readFileSync("./templates/lesson12employee.html");
    let template = handlebars.compile(source.toString());
    let data = {
        cookie: cookie,
        session: session,
        welcome: welcome,
        username: username,
        table: inputConfirmed
    }
    result = template(data);
    return result;
}

function build_formManager(username, userid, inputConfirmed) {
    let cookie = !!username;
    let session = !!userid;
    if (username && userid) {
        welcome = "Welcome back " + username + "! You are logged in."
    } else if (username) {
        welcome = "Welcome back " + username + "! Please log in.";
    } else {
        welcome = "Welcome! Please log in.";
    }

    let source = fs.readFileSync("./templates/lesson12manager.html");
    let template = handlebars.compile(source.toString());
    let data = {
        cookie: cookie,
        session: session,
        welcome: welcome,
        username: username,
        table: inputConfirmed
    }
    result = template(data);
    return result;
}

// Also does this have to be async? Nothing awaiting...
function build_form(username, userid, inputConfirmed) {
    let cookie = !!username;
    let session = !!userid;
    if (username && userid) {
        welcome = "Welcome back " + username + "! You are logged in."
    } else if (username) {
        welcome = "Welcome back " + username + "! Please log in.";
    } else {
        welcome = "Welcome! Please log in.";
    }

    let source = fs.readFileSync("./templates/lesson12.html");
    let template = handlebars.compile(source.toString());
    let data = {
        cookie: cookie,
        session: session,
        welcome: welcome,
        username: username,
        table: inputConfirmed
    }
    result = template(data);
    return result;
}

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

async function phoneExists(phone) {
    const client = mongodb.MongoClient(HOST);
    await client.connect();
    const database = client.db(DATABASE);
    const collection = database.collection(COLLECTION);
    const filter = {
        phone: phone
    };
    const count = await collection.countDocuments(filter);
    await client.close();
    return !!(count);
}

async function insertNewOrder(userid, toppings, size, sides, price, notes, phone) {
    const client = mongodb.MongoClient(HOST);
    await client.connect();
    const database = client.db(DATABASE);
    const collection = database.collection(COLLECTIONORDER);
    const document = {
        users_id: `${userid}`,
        topping: toppings,
        size: size,
        side: sides,
        price: price.toFixed(2),
        notes: notes,
        phone: phone
    };
    await collection.insertOne(document);
    await client.close();
}


async function insertNewUser(username, generatedHashedPassword, fName, lName, address, city, state, postCode, email, phone, defaultstatus) {
    const client = mongodb.MongoClient(HOST);
    await client.connect();
    const database = client.db(DATABASE);
    const collection = database.collection(COLLECTION);
    const document = {
        username: username,
        password: generatedHashedPassword,
        fName: fName,
        lName: lName,
        address: address,
        city: city,
        state: state,
        postalCode: postCode,
        email: email,
        phone: phone,
        status: defaultstatus
    };
    await collection.insertOne(document);
    await client.close();
}

async function findBaseOrders() {
    const client = mongodb.MongoClient(HOST);
    await client.connect();
    const database = client.db(DATABASE);
    const collection = database.collection(COLLECTIONORDER);

    const filter = {
        topping: "pepperoni"
    };

    let baseOrder = await collection.findOne(filter);
    await client.close();
    return baseOrder;
}

async function insertBaseOrders(user) { // Clean up and make insert multiple orders
    const client = mongodb.MongoClient(HOST);
    await client.connect();
    const database = client.db(DATABASE);
    const collection = database.collection(COLLECTIONORDER);
    const order = {
        users_id: `${user._id}`,
        topping: "pepperoni",
        size: "small",
        side: "fries",
        price: "5.99",
        notes: "base notes",
        phone: "base phone"
    };

    await collection.insertOne(order);
    await client.close();
}

async function findBaseUsers() {
    const client = mongodb.MongoClient(HOST);
    await client.connect();
    const database = client.db(DATABASE);
    const collection = database.collection(COLLECTION);

    const filter = {
        username: "employee"
    };

    let baseUser = await collection.findOne(filter);
    await client.close();
    return baseUser;
}

async function insertBaseUsers() { // Clean up and make insert multiple users
    const client = mongodb.MongoClient(HOST);
    await client.connect();
    const database = client.db(DATABASE);
    const collection = database.collection(COLLECTION);
    const employee = {
        username: "employee",
        password: "$2b$10$3a/yKpp2TDIkCl8MbQe1nelRhJDox0TleZodsQXcKq2yRQV4BDCPu",
        fName: "firstName employee",
        lName: "lastName employee",
        address: "123 Employee Ave",
        city: "Employee City",
        state: "Employee State",
        postalCode: "123456",
        email: "employee@gmail.com",
        phone: "12345678910",
        status: "employee"
    };

    const manager = {
        username: "manager",
        password: "$2b$10$hx9gYevjOrJSCgytWB8GWOPhU5IkF4sQSZVJafyFJfIv1nIMWkh7G",
        fName: "firstName manager",
        lName: "lastName manager",
        address: "123 Manager Ave",
        city: "Manager City",
        state: "Manager State",
        postalCode: "123456",
        email: "Manager@gmail.com",
        phone: "12345678910",
        status: "manager"
    };

    const customer = {
        username: "customer",
        password: "$2b$10$Ue/NxrUKcDjx7VYz38RKSuIweaemYH8g52qops.iJfyaGrDh7LAv.",
        fName: "firstName customer",
        lName: "lastName customer",
        address: "123 Customer Ave",
        city: "Customer City",
        state: "Customer State",
        postalCode: "123456",
        email: "customer@gmail.com",
        phone: "12345678910",
        status: "customer"
    }


    await collection.insertOne(employee);

    await collection.insertOne(manager);

    await collection.insertOne(customer);

    await client.close();
}

async function updateUser(username, generatedHashedPassword, fName, lName, address, city, state, postCode, email, phone, defaultstatus) {
    const client = mongodb.MongoClient(HOST);
    await client.connect();
    const database = client.db(DATABASE);
    const collection = database.collection(COLLECTION);

    const filter = {
        phone: phone
    };

    const update = {
        "$set": {
            "username": username,
            "password": generatedHashedPassword,
            "fName": fName,
            "lName": lName,
            "address": address,
            "city": city,
            "state": state,
            "postalCode": postCode,
            "email": email,
            "phone": phone,
            "status": defaultstatus
        }
    };

    await collection.updateOne(filter, update);
    await client.close();
}

async function findSingleUser(username) {
    const client = mongodb.MongoClient(HOST);
    await client.connect();
    const database = client.db(DATABASE);
    const collection = database.collection(COLLECTION);

    const filter = {
        username: username
    };

    let user = await collection.findOne(filter);
    await client.close();
    return user;
}

async function findSingleUserPhone(phone) {
    const client = mongodb.MongoClient(HOST);
    await client.connect();
    const database = client.db(DATABASE);
    const collection = database.collection(COLLECTION);

    const filter = {
        phone: phone
    };

    let user = await collection.findOne(filter);
    await client.close();
    return user;
}

async function findBaseUser(username) {
    const client = mongodb.MongoClient(HOST);
    await client.connect();
    const database = client.db(DATABASE);
    const collection = database.collection(COLLECTION);

    const filter = {
        username: "customer"
    };

    let user = await collection.findOne(filter);
    await client.close();
    return user;
}


async function deleteUser(phone) {
    const client = mongodb.MongoClient(HOST);
    await client.connect();
    const database = client.db(DATABASE);
    const collection = database.collection(COLLECTION);

    const filter = {
        phone: phone
    };

    await collection.deleteOne(filter);
    await client.close();
}

async function getAllAccountsInfo() {
    const client = mongodb.MongoClient(HOST);
    await client.connect();
    const database = client.db(DATABASE);
    const collection = database.collection(COLLECTION);

    const filter = {};

    let allUsers = await collection.find(filter).toArray();
    await client.close();
    return allUsers;
}

// Use this function to generate hashed passwords to save in 
// the users list or a database.
// Does this have to be async or will run instantly due to hoisting?       -----------------------------------------------------------------
function generateHashedPassword(password) {
    let salt = bcrypt.genSaltSync();
    generatedHashedPassword = bcrypt.hashSync(password, salt);
    return generatedHashedPassword;
}

async function authenticateUser(username, password) {

    let user = await findSingleUser(username);
    let hashedCorrectPassword = user.password;

    if (bcrypt.compareSync(password, hashedCorrectPassword)) {

        return true;

    } else {

        return null;

    }
}

module.exports = router;