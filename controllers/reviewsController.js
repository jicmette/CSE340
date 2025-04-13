const vehicleModel = require("../models/vehicleModel");
const reviewModel = require("../models/reviewModel");

exports.addReview = async (req, res) => {
  const { rating, comment } = req.body;
  const vehicle_id = req.params.inv_id;
  const user_id = req.session.account_id; 

  try {
    await reviewModel.addReview(inv_id_id, user_id, rating, comment);
    req.flash("success", "Review added successfully!");
    res.redirect(`/vehicles/${inv_id}`);
  } catch (error) {
    console.error("Error adding review:", error.message);
    req.flash("error", "Failed to add review.");
    res.redirect(`/vehicles/${inv_id}`);
  }
};

exports.getVehicleDetailsWithReviews = async (req, res) => {
  const vehicle_id = req.params.inv_id;

  try {
    const vehicle = await vehicleModel.getVehicleById(inv_id);
    const reviews = await reviewModel.getReviewsByVehicleId(inv_id);

    res.render("/inv/detail", {
      vehicle,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching vehicle details or reviews:", error.message);
    req.flash("error", "Failed to load vehicle details.");
    res.redirect("/vehicles");
  }
};