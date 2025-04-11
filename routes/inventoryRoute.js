// Needed Resources
const express = require("express");
const router = new express.Router();
const inventoryValidate = require("../utilities/inventory-validation");
const invController = require("../controllers/invController");
const utilities = require("../utilities/index");
const { getInventoryByClassificationId } = require("../models/inventory-model");

//Public Routes
// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
// Route to build vehicle detail view
router.get("/detail/:inv_id", invController.buildItemDetailById);


//Employee and Admin Routes
// Route to management view
router.get("/", utilities.checkInventoryAccess, invController.buildMgmtView);

// Route to Add Classification view
router.get("/add-classification", utilities.checkInventoryAccess, utilities.handleErrors(invController.buildAddClassificationView));

// Route to add a new classification from the user
router.post(
  "/add-classification",
  inventoryValidate.classificationRules(),
  inventoryValidate.checkClassificationData,
  invController.addNewClassificationFromUser
);

// Route to Add Vehicle view
router.get("/add-inventory", utilities.checkInventoryAccess, utilities.handleErrors(invController.buildAddVehicle));

// Route to add a new vehicle
router.post(
  "/add-inventory",
  inventoryValidate.vehicleRules(),
  inventoryValidate.checkVehicleData,
  invController.addNewVehicleFromUser
);

router.get(
  "/getInventory/:classification_id",
  utilities.checkInventoryAccess, utilities.handleErrors(invController.getInventoryJSON)
);

router.get(
  "/edit/:inv_id", utilities.checkInventoryAccess,
  utilities.handleErrors(invController.buildEditView)
);

//Route to update a vehicle data
router.post(
  "/update",
  inventoryValidate.vehicleRules(),
  inventoryValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

//Route to delete confirmation route
router.get("/delete/:inv_id", utilities.checkInventoryAccess, utilities.handleErrors(invController.deleteView));

//Route to process the delete inventory request
router.post("/delete", utilities.checkInventoryAccess, utilities.handleErrors(invController.deleteItem));


module.exports = router;
