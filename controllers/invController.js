const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildItemDetailById = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id;
    const vehicleData = await invModel.getInventoryItemById(inv_id);
    const vehicleHTML = await utilities.buildItemDetails(vehicleData);
    let nav = await utilities.getNav();
    res.render("./inventory/vehicle-details", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      vehicleHTML,
    });
  } catch (error) {
    console.error("Error building vehicle detail view");
    next(error);
  }
};

/* ***************************
 *  Build the Management view
 * ************************** */
invCont.buildMgmtView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      flashMessages: req.flash(),
    });
  } catch (error) {
    console.error("Error rendering management view:", error);
    next(error);
  }
};
/* ***************************
 *  Build the Add New Classification View, GET Request
 * ************************** */

invCont.buildAddClassificationView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
    });
  } catch (error) {
    console.error("Error rendering add classification view", error);
    next(error);
  }
};

/* ***************************
 *  POST Request, take data from the User inserted in the New Classification Form
 * ************************** */

invCont.AddNewClassificationFromUser = async function (req, res, next) {
  try {
    const classification_name = req.body.classification_name;
    const newClassification = await invModel.insertNewClassification(
      classification_name
    );
    req.flash(
      "success",
      `The classification "${classification_name}" was successfully added.`
    );
    res.redirect("/inv");
  } catch (error) {
    console.error("Error adding classification:", error);
    req.flash("error", "Failed to add classification. Please try again.");
  }
};

/* ***************************
 *  Build the dropdown in the add new vehicle form
 * ************************** */

invCont.buildAddVehicle = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    let dropdown = await utilities.getClassificationsDropdown();
    res.render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      dropdown,
    });
  } catch (error) {
    console.error("Error rendering add vehicle view", error);
    next(error);
  }
};

module.exports = invCont;
