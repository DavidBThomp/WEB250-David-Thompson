// Displays "Hello code world!"
//
// References:
//  https://expressjs.com/en/starter/hello-world.html
//  https://expressjs.com/en/guide/routing.html

const express = require('express')
const router = express.Router()

router.get("/", function (request, response) {
    response.send('Hello David!');
});

module.exports = router;
