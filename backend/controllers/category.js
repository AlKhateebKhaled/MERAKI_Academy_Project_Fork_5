const e = require("express");
const pool = require("../models/db.js");
const cloudinary = require("cloudinary").v2;
const { uploadToCloudinary } = require("../services/cloudinary");

const createCategory = async (req, res) => {
  const { name, description, category_image } = req.body;
  // console.log(name, description, category_image);

  const query = `INSERT INTO categories (name, description,category_image)VALUES($1,$2,$3)RETURNING *`;
  // console.log(query);

  const data = [name, description, category_image];
  try {
    const result = await pool.query(query, data);
    //console.log(result);

    res.json({
      success: true,
      message: "Category Added",
      category: result.rows[0],
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server error",
      err: error,
    });
  }
};

const updateCategory = async (req, res) => {
  const catId = req.params.catId;
  const { name, description, category_image } = req.body;
  const query = `UPDATE categories SET name= COALESCE($1,name),description = COALESCE($2,description),category_image=COALESCE($3,category_image) WHERE id = ${catId} RETURNING *;`;

  const data = [name, description, category_image];
  try {
    const result = await pool.query(query, data);

    if (result.rows.length !== 0) {
      res.json({
        success: true,
        message: "Category Updated",
        category: result.rows[0],
      });
    } else {
      throw new Error("Error happened while updating Category");
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server error",
      err: error,
    });
  }
};

const removeCategory = async (req, res) => {
  const catId = req.params.catId;
  const query = `DELETE FROM categories WHERE id = $1 RETURNING *;`;
  console.log("catId: ", catId);

  try {
    const result = await pool.query(query, [catId]);
    console.log("result: ", result);

    if (result.rowCount > 0) {
      res.json({
        success: true,
        message: "Category Deleted",
        deletedCategory: result.rows[0],
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      err: error.message,
    });
  }
};

const getAllCategory = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const size = parseInt(req.query.size) || 10;
  const offset = (page - 1) * size;

  const query = `
    SELECT * FROM categories 
    ORDER BY created_at DESC 
    LIMIT $1 OFFSET $2;
  `;
  const countQuery = `SELECT COUNT(*) FROM categories;`;

  try {
    const result = await pool.query(query, [size, offset]);

    const countResult = await pool.query(countQuery);
    const totalCategories = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      message: "All Categories",
      category: result.rows,
      totalCategories: totalCategories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      err: error.message,
    });
  }
};

const uploadCategoryImage = async (req, res) => {
  const admin_id = req.token.userId;
  console.log("Admin uploading category image...");

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file provided. Please upload an image.",
    });
  }

  const fileSizeLimit = 5 * 1024 * 1024;
  const allowedTypes = ["image/jpeg", "image/png"];

  if (req.file.size > fileSizeLimit) {
    return res
      .status(400)
      .json({ success: false, message: "File is too large" });
  }

  if (!allowedTypes.includes(req.file.mimetype)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid file type" });
  }

  try {
    const uploadResponse = await uploadToCloudinary(req.file.buffer);
    const categoryImageUrl = uploadResponse.url;

    console.log("Uploaded category image URL:", categoryImageUrl);

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      url: categoryImageUrl,
    });
  } catch (error) {
    console.error("Error uploading category image:", error);
    return res.status(500).json({
      success: false,
      message: "Error uploading category image.",
      err: error.message,
    });
  }
};

module.exports = {
  createCategory,
  updateCategory,
  removeCategory,
  getAllCategory,
  uploadCategoryImage,
};
