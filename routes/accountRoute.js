// Needed Resources
const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");

// Route to build log in view
router.get("/login", accountController.buildLogin);

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

//Route for accounts management view
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagementView)
);

//Route to build registration view
router.get("/register", accountController.buildRegister);

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

//Route to edit account view
router.get("/update/:account_id", utilities.handleErrors(accountController.buildEditAccountView));

//Process the account updated data
router.post("/update/:account_id", regValidate.updateRules(), regValidate.checkUpdateData, utilities.handleErrors(accountController.updateAccount));

// Logout Route CHECK
router.get("/logout", utilities.handleErrors(accountController.accountLogout))

//Rute to change password
router.post(
  "/change-password", regValidate.passwordChangeRules(),
  regValidate.checkPasswordChangeData,
  accountController.changePassword
);


module.exports = router;
