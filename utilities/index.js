const invModel = require("../models/inventory-model");
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
 * Build the classification view HTML
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
  let dropdown = '<select id="classification" name="classification" required>';
  dropdown +=
    '<option value="" selected>-- Choose a Classification --</option>'; // Default option
  data.rows.forEach((row) => {
    dropdown += `<option value="${row.classification_id}">${row.classification_name}</option>`;
  });
  dropdown += "</select>";
  return dropdown;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */

Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;
