const utilities = require("../utilities");

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  const accountHTML = await utilities.buildLogInView();
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    accountHTML,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  const registerHTML = await utilities.buildRegisterView();
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    registerHTML,
    errors: null,
  });
}

module.exports = { buildLogin, buildRegister };
