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
 *  Build vehicle detail view with reviews
 * ************************** */
invCont.buildItemDetailById = async function (req, res, next) {
  const inv_id = req.params.inv_id;

  try {
    const vehicle = await invModel.getInventoryItemById(inv_id);
    if (!vehicle) {
      req.flash("error", "Vehicle not found.");
      return res.redirect("/inv");
    }

    const vehicleHTML = await utilities.buildItemDetails(vehicle);

    const reviews = await invModel.getReviewsByVehicleId(inv_id);

    let nav = await utilities.getNav();

    res.render("./inventory/vehicle-details", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleHTML,
      reviews,
      vehicle,
    });
  } catch (error) {
    console.error("Error fetching vehicle details or reviews:", error.message);
    req.flash("error", "Failed to load vehicle details.");
    res.redirect("/inv");
  }
};


/* ***************************
 *  Add reviews to the database
 * ************************** */
invCont.addReview = async function (req, res, next) {
  const inv_id = req.params.inv_id;
  const { rating, comment } = req.body;
  
  const account_id = req.session.accountData?.account_id;

  console.log("Session Data:", account_id);
  
  if (!account_id) {
    req.flash("error", "You must be logged in to submit a review");
    return res.redirect(`/account`);
  }

  try {
    await invModel.addReview(inv_id, account_id, rating, comment);
    req.flash("success", "Review added successfully!");
    res.redirect(`/account`);

  } catch (error) {
    console.error("Review error:", error);
    req.flash("error", "Failed to add review");
    res.redirect(`/account`);
  }
}

/* ***************************
 *  Build the Management view
 * ************************** */
invCont.buildMgmtView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList();
    res.render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      flashMessages: req.flash(),
      classificationSelect,
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
      flashMessages: req.flash(),
    });
  } catch (error) {
    console.error("Error rendering add classification view", error);
    next(error);
  }
};

/* ***************************
 *  POST Request, take data from the User inserted in the New Classification Form
 * ************************** */

invCont.addNewClassificationFromUser = async function (req, res, next) {
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
    req.flash("error", "Failed to add classification. Please try again."); // Generic error message
    res.redirect("/add-classification"); // Redirect back to the form
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
      flashMessages: req.flash(),
    });
  } catch (error) {
    console.error("Error rendering add vehicle view", error);
    next(error);
  }
};

/* ***************************
 *  POST request, take data from the user to add a new vehicle
 * ************************** */
invCont.addNewVehicleFromUser = async function (req, res, next) {
  try {
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    } = req.body;

    const newVehicle = await invModel.insertNewVehicle({
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    }); // Pass data to the model
    req.flash(
      "success",
      `The vehicle "${inv_make} ${inv_model}" was successfully added.`
    );
    res.redirect("/inv");
  } catch (error) {
    console.error("Error adding vehicle:", error);
    req.flash("error", "Failed to add vehicle. Please try again.");
    res.redirect("/add-inventory");
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getInventoryItemById(inv_id);
  const classificationSelect = await utilities.buildClassificationList(
    itemData.classification_id
  );
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
  });
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      inv_id,
    } = req.body;

    // Validation: Check if classification_id is present
    if (!classification_id) {
      req.flash("error", "Classification ID is required.");
      return res.redirect(`/inventory/edit/${inv_id}`); // Redirect back to the edit form
    }

    const updateResult = await invModel.updateInventory(
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      inv_id
    );

    if (updateResult) {
      const itemName = `${inv_make} ${inv_model}`;
      req.flash("notice", `The ${itemName} was successfully updated.`);
      return res.redirect("/inv");
    } else {
      const classificationSelect = await utilities.buildClassificationList(classification_id);
      const itemName = `${inv_make} ${inv_model}`;
      req.flash("notice", "Sorry, the update failed.");

      return res.status(501).render("inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationSelect,
        classification_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        inv_id,
      });
    }
  } catch (error) {
    console.error("Error in updateInventory controller:", error);
    return next(error);
  }
};
/* ***************************
 *  Delete confirmation view
 * ************************** */

invCont.deleteView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryItemById(inv_id)

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: `Delete ${itemName}`,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteItem = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id);
  let nav = await utilities.getNav()
  console.log("DELETE VIEW:", inv_id);

  const deleteResult = await invModel.deleteInventoryItem(inv_id)
  console.log("DELETE RESULT: ", deleteResult)

  if (deleteResult) {
    req.flash("success", "The deletion was successful.");
    res.redirect("/inv/");
  } else {
    req.flash("error", "Sorry, the delete failed.");
    res.redirect(`/inv/delete/${inv_id}`);
  }
}

module.exports = invCont;
