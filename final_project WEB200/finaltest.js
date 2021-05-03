// Program: Listens for clicks on buttons and processes information depending on the fields.
// Then stores the user information into a JSON array. This array can be updated with Pizza information
// and the note and prices from the order.

"use strict";
let userData = [];

window.addEventListener("load", function () {
    document.getElementById("createAccount").addEventListener("click", createCust);
    document.getElementById("order").addEventListener("click", orderClick);
    document.getElementById("login").addEventListener("click", getCust);
});

// Creates the values for 
function createCust() {
    let indexUser = getUserPhone();

    // Create Account Form Validation
    if (document.getElementById("firstName").value.length < 2) {
        document.getElementById("createInfo").innerHTML = "<h2>Please Input Valid First Name</h2>";
        document.getElementById("phone").value = "";
    } else if (document.getElementById("lastName").value.length < 2) {
        document.getElementById("createInfo").innerHTML = "<h2>Please Input Valid Last Name</h2>";
        document.getElementById("phone").value = "";
    } else if (document.getElementById("address").value.length < 6) {
        document.getElementById("createInfo").innerHTML = "<h2>Please Input Valid Address</h2>";
        document.getElementById("phone").value = "";
    } else if (document.getElementById("city").value.length < 2) {
        document.getElementById("createInfo").innerHTML = "<h2>Please Input Valid City</h2>";
        document.getElementById("phone").value = "";
    } else if (document.getElementById("state").value.length < 2 || document.getElementById("state").value.length > 2) {
        document.getElementById("createInfo").innerHTML = "<h2>Please Input Valid State in 2 letter form (example: IL)</h2>";
        document.getElementById("phone").value = "";
    } else if (document.getElementById("postCode").value.length < 5 || document.getElementById("postCode").value.length > 5) {
        document.getElementById("createInfo").innerHTML = "<h2>Please Input Valid USA Postal Code (12345)</h2>";
        document.getElementById("phone").value = "";
    } else if (document.getElementById("email").value.length < 3) {
        document.getElementById("createInfo").innerHTML = "<h2>Please Input Valid Email (ABC@123.org)</h2>";
        document.getElementById("phone").value = "";
    } else if (document.getElementById("phone").value / length < 7) {
        document.getElementById("createInfo").innerHTML = "<h2>Please Input Valid Phone Number (12345678910), no dashes are neeeded</h2>";
        document.getElementById("phone").value = "";
    } else {
        if (indexUser < 0) {

            let dataInput = {
                "firstName": `${document.getElementById("firstName").value}`,
                "lastName": `${document.getElementById("lastName").value}`,
                "email": `${document.getElementById("email").value}`,
                "phone": `${document.getElementById("phone").value}`,
                "location": {
                    "address": `${document.getElementById("address").value}`,
                    "city": `${document.getElementById("city").value}`,
                    "state": `${document.getElementById("state").value}`,
                    "postCode": `${document.getElementById("postCode").value}`
                },
                "pizzas": []
            };

            userData.push(dataInput);

            // Clears inputs
            document.getElementById("firstName").value = "";
            document.getElementById("lastName").value = "";
            document.getElementById("email").value = "";
            document.getElementById("phone").value = "";
            document.getElementById("address").value = "";
            document.getElementById("city").value = "";
            document.getElementById("state").value = "";
            document.getElementById("postCode").value = "";

            document.getElementById("createInfo").innerHTML = "<h2>Account Created.</h2>";


        } else {

            document.getElementById("createInfo").innerHTML = `<h2>Account linked with phone number "${document.getElementById("phone").value}" already exists.</h2>`;
            document.getElementById("phone").value = "";

        }
    }





}

function orderClick() {
    let indexUser = getUserPhone();

    var price;

    if (price === undefined || price === "") {
        price = +0;
    }

    if (indexUser < 0) {
        document.getElementById("orderPizzas").innerHTML = `<h2>Customer doesn't exist for phone number "${document.getElementById("phone1").value}".</h2>`;
        document.getElementById("phone1").value = "";
    } else {

        let size = document.getElementById("size").value;

        if (size === "Small") {
            price += +5.99
        } else if (size === "Medium") {
            price += +7.99
        } else if (size === "Large") {
            price += +9.99
        } else if (size === "X-Large") {
            price += +12.99
        }


        let pepperoni = document.getElementById("pepperoni").checked;
        let bacon = document.getElementById("bacon").checked;
        let sausage = document.getElementById("sausage").checked;
        let pineapple = document.getElementById("pineapple").checked;
        let onions = document.getElementById("onions").checked;
        let olives = document.getElementById("olives").checked;
        let bellpepper = document.getElementById("bellpepper").checked;
        let mushrooms = document.getElementById("mushrooms").checked;

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


        let salad = document.getElementById("salad").checked;
        let wings = document.getElementById("wings").checked;
        let fries = document.getElementById("fries").checked;

        let sides = "";

        if (salad) {
            sides += "salad ";
            price += 5.99;
        }
        if (wings) {
            sides += "wings ";
            price += 3.99;
        }
        if (fries) {
            sides += "fires ";
            price += 4.99;
        }
        if (sides === "") {
            sides += "None";
        }

        sides = sides.trim();

        let notes = document.getElementById("notes").value;
        if (notes === "") {
            notes = `Blank`;
        }

        //Get the amount of pizzas ordered and add one to array in JSON

        let order = {
            "pizza": {
                "topping": `${toppings}`,
                "size": `${size}`,
                "sides": `${sides}`,
                "price": `${price}`,
                "notes": `${notes}`
            },
        }
        userData[indexUser].pizzas.push(order);


        let fullPrice = 0;
        var i;
        for (i = 0; i < userData[indexUser].pizzas.length; i++) {
            price = Number(userData[indexUser].pizzas[i].pizza.price);
            fullPrice += price;
            document.getElementById("orderPizzas").innerHTML = `<h3>You have ordered ${i + 1} Pizzas <br>for phone number "${document.getElementById("phone1").value}".</h3>`;
            document.getElementById("orderPizzas").innerHTML += `<h3>The price for the order is: $${fullPrice.toFixed(2)}.</h3>`;
        }

        // Sets values back to defaults
        document.getElementById("phone1").value = "";
        pepperoni = document.getElementById("pepperoni").checked = false;
        bacon = document.getElementById("bacon").checked = false;
        sausage = document.getElementById("sausage").checked = false;
        pineapple = document.getElementById("pineapple").checked = false;
        onions = document.getElementById("onions").checked = false;
        olives = document.getElementById("olives").checked = false;
        bellpepper = document.getElementById("bellpepper").checked = false;
        mushrooms = document.getElementById("mushrooms").checked = false;

        salad = document.getElementById("salad").checked = false;
        wings = document.getElementById("wings").checked = false;
        fries = document.getElementById("fries").checked = false;

        document.getElementById("notes").value = "";
        document.getElementById("size").value = "Small"

    }

}

function getCust() {
    let indexUser = getUserPhone();

    if (indexUser < 0) {
        document.getElementById("CustomerData").innerHTML = `<h2>Phone number: "${document.getElementById("phone2").value}" doesn't exist, please create an account and try again.</h2>`;
        document.getElementById("phone2").value = "";
    } else {
        document.getElementById("CustomerData").innerHTML = `<h2>Customer Information:</h2>`;
        document.getElementById("CustomerData").innerHTML += `<h3>First Name: ${userData[indexUser].firstName}</h3>`;
        document.getElementById("CustomerData").innerHTML += `<h3>Last Name: ${userData[indexUser].lastName}</h3>`;
        document.getElementById("CustomerData").innerHTML += `<h3>Phone Number: ${userData[indexUser].phone}</h3>`;
        document.getElementById("CustomerData").innerHTML += `<h3>Address: ${userData[indexUser].location.address}, ${userData[indexUser].location.city}, ${userData[indexUser].location.state}</h3><br><br>`;
        document.getElementById("CustomerData").innerHTML += `<h2>Pizza's Ordered:</h2>`;

        // Read out Pizzas and Toppings
        var i;
        for (i = 0; i < userData[indexUser].pizzas.length; i++) {
            document.getElementById("CustomerData").innerHTML += `<h3>Pizza #${i + 1}</h3>`;
            document.getElementById("CustomerData").innerHTML += `<h3>Size: ${userData[indexUser].pizzas[i].pizza.size}</h3>`;
            document.getElementById("CustomerData").innerHTML += `<h3>Toppings: ${userData[indexUser].pizzas[i].pizza.topping}</h3>`;
            document.getElementById("CustomerData").innerHTML += `<h3>Sides: ${userData[indexUser].pizzas[i].pizza.sides}</h3>`;
            document.getElementById("CustomerData").innerHTML += `<h3>Notes for order: "${userData[indexUser].pizzas[i].pizza.notes}".</h3><br>`;
        }


        let orderPrice1 = orderPrice();
        // document.getElementById("CustomerData").innerHTML += `<h3>Price: ${userData[indexUser].pizzas[i].pizza.price}</h3><br><br>`
        document.getElementById("CustomerData").innerHTML += `<br><h2>You have ordered ${i} Pizzas for phone number "${document.getElementById("phone2").value}".</h2>`;
        document.getElementById("CustomerData").innerHTML += `<h2>Price: $${orderPrice1.toFixed(2)}</h2>`;
        document.getElementById("CustomerData").innerHTML += `<h2>Price + Tax : $${(orderPrice1 * 1.1).toFixed(2)}</h2><br><br>`;


        document.getElementById("phone2").value = "";
    }
}

// Gets order Price 
function orderPrice() {
    let indexUser = getUserPhone();
    let orderPrice1 = 0;
    var i;
    for (i = 0; i < userData[indexUser].pizzas.length; i++) {
        let price = Number(userData[indexUser].pizzas[i].pizza.price);
        orderPrice1 += price;
    }
    console.log(orderPrice1);
    return orderPrice1;
}


// Checks if the customer exists, and if so their index number in userdata

function getUserPhone() {
    let login = "";

    let login1 = document.getElementById("phone").value;
    let login2 = document.getElementById("phone1").value;
    let login3 = document.getElementById("phone2").value;

    if (login1 === "" && login2 === "") {
        login = login3;
    } else if (login2 === "" && login3 === "") {
        login = login1;
    } else if (login1 === "" && login3 === "") {
        login = login2;
    } else {
        document.getElementById("CustomerData").innerHTML = "<h2>Only 1 phone field may have a value at a time, please try again.<h2>";
        document.getElementById("createInfo").innerHTML = "<h2>Only 1 phone field may have a value at a time, please try again.<h2>";
        document.getElementById("orderPizzas").innerHTML = "<h2>Only 1 phone field may have a value at a time, please try again.<h2>";
    }

    let phoneNumbers = [];
    var i;
    for (i = 0; i < userData.length; i++) {
        phoneNumbers.push(userData[i].phone);
    }

    // Checks Phone Numbers against customer input login phone number
    let indexUser = phoneNumbers.indexOf(login);

    // if (indexUser< 0) {
    //     console.log("Customer not real");
    // } else {
    //     console.log("Customer real");
    // }

    return indexUser;

}
