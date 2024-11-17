import React, { useContext, useEffect, useState } from "react";
import "./style.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setProducts } from "../../components/redux/reducers/product/product";
import { addToCart } from "../../components/redux/reducers/product/product";

export const Home = () => {
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const products = useSelector((state) => {
    console.log();

    return state.product.products;
  });

  const getAllProducts = async () => {
    try {
      const result = await axios.get("http://localhost:5000/products/");
      console.log(result);

      if (result.data.success) {
        const allProducts = result.data.result;
        // console.log(products);

        dispatch(setProducts(allProducts));
      } else {
        throw Error;
      }
    } catch (error) {
      if (!error.response.data.success) {
        return setMessage(error.response.data.message);
      }
      setMessage("Error happened while Get Data, please try again");
    }
  };
  //////////////////////////////////////////////
  const addToMyCart = (productId) => {

    axios.get(`http://localhost:5000/products/${productId}`)
    .then((response)=>{
        dispatch(addToCart(response.data.product));

      console.log(response.data)

    })
    .catch((error)=>{
      console.log(err)

    })

    
  };
console.log(products)

  /////////////////////////////////////////////

  useEffect(() => {
    getAllProducts();
  }, []);

  const showAllProducts = products?.map((product, index) => {
    return (
      <div key={index} className="product-card">
        <div className="product-info">
          <h3 className="product-title">{product.title}</h3>
          <p className="product-description">{product.description}</p>
          <div className="product-price">{product.price} JD</div>
          <button onClick={()=>{addToMyCart(product.id)}} className="add-to-cart-btn">Add to Cart</button>
        </div>
      </div>
    );
  });


  return <div className="container">{showAllProducts}</div>;
};
