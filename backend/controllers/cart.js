
const pool = require("../models/db");


const addToCart = async (req, res) => {
  const quantity=1

    const userId = 1// req.token.userId;
    const  productId = req.params.id;
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
        "SELECT * FROM cart WHERE user_id = $1 AND product_id = $2";
      const checkResult = await pool.query(checkQuery, [userId, productId]);
      if (checkResult.rows.length > 0) {
        const addMore =
        "UPDATE cart SET quantity = quantity + 1 WHERE user_id = $1 AND product_id = $2";
         await pool.query(addMore, [userId, productId]);

        return res.status(200).json({
          success: false,
          message: "Product is is increased in your cart.",
        });
      }
      const insertQuery =
        "INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)";
      await pool.query(insertQuery, [userId, productId, quantity]);
      res.status(200).json({
        success: true,
        message: "Product added to cart successfully.",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({
        success: false,
        message: "Server error. Please try again later.",
      });
    }
  };
 

const removeFromCart=async(req,res)=>{
  const userId =1// req.token.userId;
  const  productId = req.params.id;
  try {
    const checkQuery =
      "SELECT * FROM cart WHERE user_id = $1 AND product_id = $2";
    const checkResult = await pool.query(checkQuery, [userId, productId]);
    if (checkResult.rows[0].quantity === 1) {
      const deleteItem =
      "delete from cart  WHERE user_id = $1 AND product_id = $2";
       await pool.query(deleteItem, [userId, productId]);

      return res.status(200).json({
        success: false,
        message: "item deleted sucsessfully.",
      });
    }
    else if(checkResult.rows[0].quantity > 1){
    const increaseQuery =
    "UPDATE cart SET quantity = quantity - 1 WHERE user_id = $1 AND product_id = $2";
    await pool.query(increaseQuery, [userId, productId]);
    res.status(200).json({
      success: true,
      message: "Product decreased successfully.",
    })};
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};





const getCartItems=(req,res)=>{
    const user_id=7;
    

    // const user_id = u_id//req.token.userId;
 
     const query = `SELECT * FROM cart WHERE user_id=$1 ;`;
     const data = [user_id];
     pool
       .query(query, data)
       .then((result) => {
         console.log(result.rows)
         res.status(200).json({
           success: true,
           message: "cart selected successfully",
           result: result.rows,
         });
       })
       .catch((err) => {
         res.status(500).json({
           success: false,
           message: "Server error",
           err: err,
         });
       });
 


};
module.exports = {addToCart,removeFromCart,getCartItems};
