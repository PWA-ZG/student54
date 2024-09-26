require('dotenv').config();
const basicAuth = require('express-basic-auth');
const password = process.env.OWNER_PASSWORD;
const options = {
    users: {
        'admin': password
    },
    challenge: true,
    unauthorizedResponse: "Unauthorized"
}

module.exports = function() {
    return basicAuth(options);
}