const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

router.post("/vehicles/:inv_id/review", reviewController.addReview);
router.get("/vehicles/:inv_id", reviewController.getVehicleDetailsWithReviews);

module.exports = router;