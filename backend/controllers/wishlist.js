const pool = require("../models/db");

const addTowishlist = async (req, res) => {
  const userId = req.token.userId;
  const { productId } = req.body;

  try {
    const productQuery = "SELECT * FROM products WHERE id = $1";
    const productResult = await pool.query(productQuery, [productId]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const checkQuery =
      "SELECT * FROM wishlists WHERE user_id = $1 AND product_id = $2";
    const checkResult = await pool.query(checkQuery, [userId, productId]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Product is already in your wishlist.",
      });
    }

    const insertQuery =
      "INSERT INTO wishlists (user_id, product_id) VALUES ($1, $2)";
    await pool.query(insertQuery, [userId, productId]);

    res.status(200).json({
      success: true,
      message: "Product added to wishlist successfully.",
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

const removeFromwishlist = async (req, res) => {
  const userId = req.token.userId;
  const { productId } = req.params;

  try {
    const checkQuery =
      "SELECT * FROM wishlists WHERE user_id = $1 AND product_id = $2";
    const checkResult = await pool.query(checkQuery, [userId, productId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found in your wishlist.",
      });
    }

    const deleteQuery =
      "DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2";
    await pool.query(deleteQuery, [userId, productId]);

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist successfully.",
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

const getwishlist = async (req, res) => {
  const userId = req.token.userId;

  try {
    const query = `
        SELECT *
        FROM wishlists w
        JOIN products p ON w.product_id = p.id
        WHERE w.user_id = $1
      `;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Your wishlist is empty.",
        wishlists: [],
      });
    }

    res.status(200).json({
      success: true,
      wishlists: result.rows,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

const clearWishlist = async (req, res) => {
  const userId = req.token.userId;

  try {
    const checkQuery = "SELECT * FROM wishlists WHERE user_id = $1";
    const checkResult = await pool.query(checkQuery, [userId]);

    if (checkResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your wishlist is already empty.",
      });
    }

    const deleteQuery = "DELETE FROM wishlists WHERE user_id = $1";
    await pool.query(deleteQuery, [userId]);

    res.status(200).json({
      success: true,
      message: "Your wishlist has been cleared successfully.",
    });
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

const getWishlistCount = async (req, res) => {
  const userId = req.token.userId;

  try {
    const countQuery =
      "SELECT COUNT(*) FROM wishlists WHERE user_id = $1 AND is_deleted = false";
    const result = await pool.query(countQuery, [userId]);

    const count = result.rows[0].count;

    res.status(200).json({
      success: true,
      message: "Wishlist count fetched successfully.",
      count: parseInt(count), 
    });
  } catch (error) {
    console.error("Error fetching wishlist count:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

module.exports = {
  addTowishlist,
  removeFromwishlist,
  getwishlist,
  clearWishlist,
  getWishlistCount,
};
