const pool = require("../database/index.js");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
  }
}

/* ***************************
 *  Get he id from the inventory table
 * ************************** */
async function getInventoryItemById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    );
    return data.rows[0];
  } catch (error) {
    console.error("Error fetching inventory item id");
  }
  throw error;
}

/* ***************************
 *  Inserts new classification to the database
 * ************************** */
async function insertNewClassification(classification_name) {
  try {
    const sql = `INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *`;
    const data = await pool.query(sql, [classification_name]);

    console.log("New classification inserted:", data.rows[0]);
    return data.rows[0];
  } catch (error) {
    console.error("Error inserting new classification:", error);
    throw error;
  }
}

async function insertNewVehicle(vehicleData) {
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
    } = vehicleData;

    const sql = `
      INSERT INTO public.inventory
      (classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING inv_id`;

    const data = await pool.query(sql, [
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
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("Error inserting new vehicle:", error);
    throw error;
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET classification_id = $1, inv_make = $2, inv_model = $3, inv_description = $4, inv_image = $5, inv_thumbnail = $6, inv_price = $7, inv_year = $8, inv_miles = $9,  inv_color = $10 WHERE inv_id = $11 RETURNING *";
    const data = await pool.query(sql, [
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
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("Model Error:", error);
    throw error;
  }
}


/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = "DELETE FROM inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    new Error("Delete Inventory Error")
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryItemById,
  insertNewClassification,
  insertNewVehicle,
  updateInventory, deleteInventoryItem,
};
