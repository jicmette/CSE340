// Needed Resources
const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");

// Route to build log in view
router.get("/login", accountController.buildLogin);

//Route to build registration view
router.get("/register", accountController.buildRegister);

module.exports = router;
