import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import "./cart.css";

const Cart = () => {
  const [total, setTotal] = useState(0);
  const [myCart, setMyCart] = useState([]);
  const token = useSelector((state) => state.auth.token);
  const uId = useSelector((state) => state.auth.userId);
  
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    axios
      .get(`http://localhost:5000/cart`, { headers })
      .then((response) => {
        setMyCart(response.data.result);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const totalAmount = myCart?.reduce((acc, elem) => acc + elem.price * elem.quantity, 0);

  return (
    <div className="myCart">
      <table className="cartTable">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {myCart?.map((elem, index) => (
            <tr key={index}>
              <td>{elem.title}</td>
              <td>{elem.price}</td>
              <td>{elem.quantity}</td>
              <td>{elem.price * elem.quantity}.00</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h1>Total: {totalAmount}</h1>
    </div>
  );
};

export default Cart;