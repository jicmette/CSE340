const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    });
  }
}

async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("./account/login.ejs", {
    title: "Login",
    nav: nav,
    errors: null,
  });
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect("/account/");
    } else {
      req.flash(
        "message notice",
        "Please check your credentials and try again."
      );
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error("Access Forbidden");
  }
}


/* ****************************************
 *  Process logout
 * ************************************ */

async function accountLogout(req, res) {
  res.clearCookie("jwt");
  res.locals.loggedin = 0;
  res.locals.accountData = "";
  req.flash("notice", "You are now logged out.");
  res.redirect("/");
}

/* ****************************************
 *  Build account management view
 * ************************************ */
async function buildAccountManagementView(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("account/account-management", {
      title: "Account Management",
      nav,
      //accountData: req.session.accountData,
      flashMessages: req.flash(),
    });
  } catch (error) {
    console.error("Error rendering the accunt management view");
    next(error);
  }
}

/* ****************************************
 *  Build edit accout information
 * ************************************ */
async function buildEditAccountView(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("account/update",{
      title: "Edit Account",
      nav,
      flashMessages: req.flash(),
    });
  } catch (error) {
    console.error("Error rendering the edit account view");
    next(error);
  }
}

/* ****************************************
 * Update Account data
 * ************************************ */
async function updateAccount(req, res, next) {
  try {
    const { account_firstname, account_lastname, account_email } = req.body;
    const account_id = req.params.account_id || res.locals.accountData.account_id;

    if (!account_id) {
      req.flash("error", "Invalid account ID.");
      return res.redirect("/account");
    }

    const updateAccount = await accountModel.updateUser(account_id, account_firstname, account_lastname, account_email);

    if (!updateAccount) {
      req.flash("error", "Failed to update account.");
      return res.redirect("/account");
    }

    req.session.accountData = {
      ...(req.session.accountData || {}),
      account_firstname,
      account_lastname,
      account_email,
    };

    const newToken = jwt.sign(
      {
        account_id,
        account_firstname,
        account_lastname,
        account_email,
      },
      process.env.ACCESS_TOKEN_SECRET, 
      { expiresIn: "1h" }
    );

    res.cookie("jwt", newToken, { httpOnly: true, secure: true });

    req.flash("success", "Account updated successfully.");
    res.redirect(`/account`);
  } catch (error) {
    console.error("Error updating account:", error.message);
    req.flash("error", "Error updating account.");
    next(error);
  }
}

/* ****************************************
 * Change Password
 * ************************************ */
async function changePassword(req, res, next) {
  try {
    const { current_password, new_password } = req.body;

    const account_id = req.session.accountData?.account_id || req.body.account_id;

    if (!account_id) {
      req.flash("error", "No account ID found. Please log in.");
      return res.redirect("/account");
    }

    if (!req.session.accountData?.account_id && req.body.account_id) {
      req.session.accountData = {
        ...req.session.accountData,
        account_id: req.body.account_id,
      };
    }

    // Fetch user data from the database
    const user = await accountModel.getAccountById(account_id);
    if (!user) {
      req.flash("error", "Account not found.");
      return res.redirect("/account");
    }

    // Verify current password
    const isMatch = await bcrypt.compare(current_password, user.account_password);
    if (!isMatch) {
      req.flash("error", "Current password is incorrect.");
      return res.redirect(`/account`);

    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    const passwordUpdateSuccess = await accountModel.updatePassword(account_id, hashedPassword);

    if (passwordUpdateSuccess) {
      req.session.accountData.account_password = hashedPassword;

      req.flash("success", "Password updated successfully.");
      return res.redirect("/account");
    } else {
      req.flash("error", "Failed to update the password. Please try again.");
      return res.redirect("/account");
    }
  } catch (error) {
    console.error("Error updating password for account ID:", account_id, "-", error.message);
    req.flash("error", "An unexpected error occurred. Please try again later.");
    return next(error);
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagementView, accountLogout, buildEditAccountView, updateAccount, changePassword
};
