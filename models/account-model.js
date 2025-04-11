const pool = require("../database/index.js");

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password
) {
  try {
    const sql =
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    return await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    ]);
  } catch (error) {
    return error.message;
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);
    return email.rowCount;
  } catch (error) {
    return error.message;
  }
}

/* *****************************
 * Return account data using email address
 * ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1",
      [account_email]
    );
    return result.rows[0];
  } catch (error) {
    return new Error("No matching email found");
  }
}

/* *****************************
 * Update the information of the user
 * ***************************** */
async function updateUser(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = `UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *;`;

    const values = [account_firstname, account_lastname, account_email, account_id];
    const result = await pool.query(sql, values)
    return result.rows[0];
  } catch (error) {
    console.error("Error updating user", error);
    throw new Error("Database update failed");
  }
}

/* *****************************
 * Fetch password to change it
 * ***************************** */
async function getAccountById(account_id) {
  const sql = `
    SELECT account_id, account_firstname, account_lastname, account_email, account_password
    FROM account
    WHERE account_id = $1;
  `;
  const values = [account_id];
  const result = await pool.query(sql, values);
  return result.rows[0];
}


/* *****************************
 * Update password
 * ***************************** */
async function updatePassword(account_id, hashedPassword) {
  const sql = `
    UPDATE account
    SET password = $1
    WHERE account_id = $2;
  `;
  const values = [hashedPassword, account_id];
  const result = await pool.query(sql, values);
  return result.rowCount > 0; // Returns true if the update succeeded
}

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, updateUser, getAccountById, updatePassword };
