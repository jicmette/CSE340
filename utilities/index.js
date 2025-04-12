const invModel = require("../models/inventory-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Build the vehicle details view HTML
 * ************************************ */
Util.buildItemDetails = async function (vehicleData) {
  let vehicleHTML = `
  <div class="vehicle-detail">
    <h1 class="vehicle-title">${vehicleData.inv_year} ${vehicleData.inv_make} ${
    vehicleData.inv_model
  }</h1>
    <img src="${vehicleData.inv_image}" alt="${vehicleData.inv_make} ${
    vehicleData.inv_model
  } image" />
  <h2>${vehicleData.inv_make} ${vehicleData.inv_model} Details</h3>
    <h3><strong>Price:</strong> $${new Intl.NumberFormat("en-US").format(
      vehicleData.inv_price
    )}</h2>
    <p><strong>Description:</strong> ${vehicleData.inv_description}</p>
    <h3><strong>Color:</strong> ${vehicleData.inv_color}</h3>
    <h3><strong>Miles:</strong> ${new Intl.NumberFormat("en-US").format(
      vehicleData.inv_miles
    )}</h3>
  </div>
  `;
  return vehicleHTML;
};

/* **************************************
 * Build the dropdown for the add vehicles page
 * ************************************ */
Util.getClassificationsDropdown = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let dropdown = '<select id="classification" name="classification_id" required>';
  dropdown +=
    '<option value="" selected>-- Choose a Classification --</option>';
  data.rows.forEach((row) => {
    dropdown += `<option value="${row.classification_id}">${row.classification_name}</option>`;
  });
  dropdown += "</select>";
  return dropdown;
};

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    next();
  }
};

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

/* ****************************************
 *  Check Inventory Access by Roles
 * ************************************ */

Util.checkInventoryAccess = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
      if (err) {
        req.flash("notice", "Your session has expired. Please log in again to continue.");
        res.clearCookie("jwt");
        res.redirect("/account/login");
      }
      res.locals.accountData = accountData;

      const allowedRoles = ["Admin", "Employee"];
      if (!allowedRoles.includes(accountData.account_type)) {
        req.flash ("notice", "You do not have sufficient permission to this resource.");
        res.redirect("/account/login");
      }
      next();
    });
  } else {
    req.flash("notice", "Please log in to access this resource.");
    res.redirect("/account/login");
  }
};


Util.buildClassificationList = async function (selectedId) {
  try {
    let data = await invModel.getClassifications();
    if (!data.rows || data.rows.length === 0) {
      console.error("No classifications found in the database.");
      return '<p class="error">No classifications available.</p>';
    }

    let classificationSelect = `
      <select id="classificationList" name="classification_id" required>
        <option value="" ${
          !selectedId ? "selected" : ""
        }>-- Choose a Classification --</option>
    `;

    data.rows.forEach((row) => {
      classificationSelect += `
        <option value="${row.classification_id}" ${
        row.classification_id === parseInt(selectedId) ? "selected" : ""
      }>${row.classification_name}</option>
      `;
    });

    classificationSelect += "</select>";
    return classificationSelect;
  } catch (error) {
    console.error("Error generating classification list:", error);
    return '<p class="error">Unable to load classifications.</p>';
  }
};
/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */

Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;
