const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};
const accountModel = require("../models/account-model");

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registrationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name.")
      .isLength({ min: 1 })
      .withMessage("Name should be more than 1 character."),

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name.") // on error this message is sent.
      .isLength({ min: 2 })
      .withMessage("Last name should be more than 2 characters."),

    // valid email is required and cannot already exist in the database
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(
          account_email
        );
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email");
        }
      }),
    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 12 })
      .withMessage("Password must be at least 12 characters long.")
      .isStrongPassword({
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render(`/account/update/${account_id}`, {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

/*  **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    // Email is required and must be valid
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email."),

    // Password is required
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ];
};

/* ******************************
 * Check login data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      errors: errors.array(),
      title: "Login",
      nav,
      account_email,
    });
    return;
  }
  next();
};

/* **********************************
 * Update Data Rules
 * ********************************* */
validate.updateRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name.")
      .isLength({ min: 1 })
      .withMessage("Name should be more than 1 character."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name.") 
      .isLength({ min: 2 })
      .withMessage("Last name should be more than 2 characters."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const emailExists = await accountModel.checkExistingEmail(
          account_email, req.params.account_id
        );
        if (emailExists) {
          throw new Error("Email exists. Please log in or use a different email.");
        }
      }),
  ];
};

/* *****************************
 * Check Data and Return Errors or Continue to Update
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  const account_id = req.params.account_id || res.locals.accountData?.account_id;

  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    
    const errorMessages = errors.array().map(error => ({
      msg: error.msg,
      param: error.param
    }));

    return res.render("account/update", {
      errors: errorMessages,
      title: "Edit Account",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    });
  }
  
  next();
};

/* **********************************
 * Password Change Validation Rules
 * ********************************* */
validate.passwordChangeRules = () => {
  return [
    body("current_password")
      .trim()
      .notEmpty()
      .withMessage("Current password is required."),

    body("new_password")
      .trim()
      .notEmpty()
      .withMessage("New password is required.")
      .isLength({ min: 12 })
      .withMessage("New password must be at least 12 characters long.")
      .isStrongPassword({
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("New password must include at least 1 uppercase letter, 1 number, and 1 special character."),
  ];
};

/* *****************************
 * Check Password Change Data and Return Errors or Continue
 * ***************************** */
validate.checkPasswordChangeData = async (req, res, next) => {
  const { current_password, new_password } = req.body;
  const account_id = req.session.accountData?.account_id || res.locals.accountData?.account_id;

  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    
    const errorMessages = errors.array().map(error => ({
      msg: error.msg,
      param: error.param,
    }));

    return res.render("account/update", {
      errors: errorMessages,
      title: "Change Password",
      nav,
      current_password,
      new_password,
      account_id,
    });
  }

  next();
};

module.exports = validate;
