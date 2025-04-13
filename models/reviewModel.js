const dbQuery = require("../utilities/index");

exports.addReview = async (inv_id, user_id, rating, comment) => {
    const query = `
    INSERT INTO reviews (inv_id, account_id, rating, comment)
    VALUES ($1, $2, $3, $4)
    RETURNING review_id;
  `;
  const params = [inv_id, account_id, rating, comment];
  try {
    const result = await dbQuery(query, params);
    return result.rows[0];
  } catch (error) {
    console.error("Error adding review:", error.message);
    throw error;
  }
};

exports.getReviewsByVehicleId = async (inv_id) => {
    const query = `
    SELECT r.rating, r.comment, r.created_at, u.account
    FROM reviews r
    JOIN users u ON r.account_id = u.account_id
    WHERE r.inv_id = 15
    ORDER BY r.created_at DESC;
`;
    try {
      const result = await dbQuery(query, [inv_id]);
      return result.rows;
    } catch (error) {
      console.error("Error fetching reviews:", error.message);
      throw error;
    }
  };