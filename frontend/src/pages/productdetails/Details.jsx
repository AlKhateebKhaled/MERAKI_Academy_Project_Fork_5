import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./details.css";
import Modal from "../modal/Modal";
import Breadcrumb from "../../components/Breadcrumb";
import { addToCart } from "../../components/redux/reducers/cart";

const Details = () => {
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth.userId);
  const userName = useSelector((state) => state.auth.userName);
  const headers = { Authorization: `Bearer ${token}` };
  const Navigate = useNavigate();
  const { pId } = useParams();
  const [product, setProduct] = useState({});
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [newComment, setNewComment] = useState("");
  const [editingReview, setEditingReview] = useState(null);
  const [editComment, setEditComment] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [avgrate, setAvgrate] = useState();
  //comment

  const cart = useSelector((state) => state.cart.cart || []);
  const count = useSelector((state) => state.cart.count);

  const dispatch = useDispatch();

  useEffect(() => {
    axios.get(`http://localhost:5000/products/${pId}`).then((response) => {
      setProduct(response.data.product);
    });
    axios.get(`http://localhost:5000/review/${pId}`).then((response) => {
      const allReview = response.data.reviews;
      setReviews(allReview);
      setAvgrate(response.data.average_rating);
    });
  }, [pId, reviews]);

  useEffect(() => {
    console.log("Cart state updated:", cart);
    console.log("Total unique items updated:", count);
  }, [cart, count]);

  const addCart = () => {
    if (!token) {
      Navigate("/users/login");
      return;
    }

    axios
      .post(`http://localhost:5000/cart/${pId}`, { quantity }, { headers })
      .then((response) => {
        if (response.data.success) {
          const product = response.data.product;
          console.log("Product added to cart:", product);

          dispatch(
            addToCart({
              id: product.id,
              title: product.title,
              price: product.price,
              quantity: parseInt(product.quantity, 10),
            })
          );

          console.log("Cart state after adding:", cart);
          console.log("Total unique items in cart:", count);
        } else {
          console.warn(response.data.message);
        }
      })
      .catch((error) => {
        console.error("Error adding to cart:", error);
      });
  };

  const deleteReview = (reviewId) => {
    axios
      .delete(`http://localhost:5000/review/${reviewId}`, { headers })
      .then((response) => {
        setReviews((prevReviews) =>
          prevReviews.filter((review) => review.id !== reviewId)
        );
        setModalMessage(response.data.message);
      })
      .catch((err) => {
        console.error("Error deleting review:", err);
        setModalMessage("Failed to delete review.");
      });
  };

  const createReview = () => {
    if (!token) {
      setModalMessage("Need to login first ");
      setModalVisible(true);
    } else if (newComment.trim() && rating > 0) {
      axios
        .post(
          `http://localhost:5000/review/${pId}`,
          { rating, comment: newComment },
          { headers }
        )
        .then((response) => {
          console.log(response.data);
          const newReview = response.data.result;
          setReviews([...reviews, newReview]);
          setNewComment("");
          setRating(0);
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      setModalMessage("Please provide a valid rating and comment!");
      setModalVisible(true);
    }
  };
  const closeModal = () => {
    setModalVisible(false); // This function hides the modal
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setEditComment(review.comment);
    setEditRating(review.rating);
  };

  const handleUpdate = (reviewId) => {
    if (editComment.trim() && editRating > 0) {
      axios
        .put(
          `http://localhost:5000/review/${reviewId}`,
          { rating: editRating, comment: editComment },
          { headers }
        )
        .then((response) => {
          setReviews(
            reviews?.map((review) =>
              review.id === reviewId ? response.data : review
            )
          );
          setEditingReview(null);
          setEditComment("");
          setEditRating(0);
          setModalMessage(response.data.message);
        })

        .catch((error) => {
          console.error(error);
        });
    } else {
      setModalMessage("Enter A valid input");
    }
  };

  const toggleShowAllComments = () => {
    setShowAllComments(!showAllComments);
  };

  return (
    <>
      <Breadcrumb />

      <div className="details-container">
        <div className="productpage">
          <div className="productimage">
            <img
              src={
                product.product_image || "https://via.placeholder.com/600x600"
              }
              alt={product.title}
              className="zoomable-image"
              onMouseMove={(e) => {
                const { left, top, width, height } =
                  e.target.getBoundingClientRect();
                const x = ((e.clientX - left) / width) * 100;
                const y = ((e.clientY - top) / height) * 100;
                e.target.style.transformOrigin = `${x}% ${y}%`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transformOrigin = "center";
              }}
            />
          </div>

          <div className="product-main">
            {/* Product Details */}
            <div className="product-info-container">
              <h1 className="product-title">{product.title}</h1>

              {/* Product Rating */}
              <div className="product-rating-container">
                <div className="product-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`star-icon ${
                        avgrate >= star ? "fas fa-star" : "far fa-star"
                      }`}
                    ></i>
                  ))}
                </div>
              </div>

              <p className="product-price">{product.price} JD</p>
              <p className="product-description">{product.description}</p>

              <div className="product-seller">
                <strong>Added by: </strong>
                <Link
                  to={`/users/${product.seller_id}`}
                  className="seller-link"
                >
                  {product.user_name}
                </Link>
              </div>

              <div className="add-to-cart-section">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  className="quantity-input"
                />
                <button className="add-to-cart-button" onClick={addCart}>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="product-reviews-section">
        <h2 className="product-reviews-title">Customer Reviews</h2>

        <div className="product-reviews-new-review-container">
          <h3 className="product-reviews-new-review-title">Write a Review</h3>
          <div className="product-reviews-rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                className={`product-reviews-star ${
                  rating >= star ? "product-reviews-star-filled" : ""
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your experience..."
            className="product-reviews-new-review-textarea"
          />
          <button
            onClick={createReview}
            className="product-reviews-submit-review-button"
          >
            Submit
          </button>
        </div>

        <div className="product-reviews-cards">
          {reviews.length > 0 ? (
            reviews
              .slice(0, showAllComments ? reviews.length : 5)
              .map((review) => (
                <div className="product-reviews-card" key={review.id}>
                  <div className="product-reviews-card-header">
                    <div className="product-reviews-user-info">
                      {review.profile_image ? (
                        <img
                          src={review.profile_image}
                          alt={review.user_name}
                          className="product-reviews-profile-image"
                        />
                      ) : (
                        <i className="fas fa-user-circle product-reviews-profile-icon"></i>
                      )}
                      <span className="product-reviews-author">
                        {review.user_name}
                      </span>
                    </div>
                    <span className="product-reviews-date">
                      {new Date(review.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="product-reviews-card-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`product-reviews-star-icon ${
                          review.rating >= star ? "fas fa-star" : "far fa-star"
                        }`}
                      ></i>
                    ))}
                  </div>
                  <p className="product-reviews-card-comment">
                    {review.comment}
                  </p>

                  {review.user_id === parseInt(userId) && (
                    <div className="product-reviews-card-actions">
                      <button
                        className="product-reviews-edit-review-button"
                        onClick={() => handleEdit(review)}
                      >
                        Edit
                      </button>
                      <button
                        className="product-reviews-delete-review-button"
                        onClick={() => deleteReview(review.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}

                  {editingReview?.id === review?.id && (
                    <div className="product-reviews-edit-review-container">
                      <div className="product-reviews-rating-input">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            onClick={() => setEditRating(star)}
                            className={`product-reviews-star ${
                              editRating >= star
                                ? "product-reviews-star-filled"
                                : ""
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        placeholder="Edit your review..."
                        className="product-reviews-edit-review-textarea"
                      />
                      <div className="product-reviews-edit-actions">
                        <button
                          onClick={() => handleUpdate(review.id)}
                          className="product-reviews-update-review-button"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => setEditingReview(null)}
                          className="product-reviews-cancel-edit-button"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
          ) : (
            <p className="product-reviews-no-reviews-message">
              No reviews yet. Be the first to review!
            </p>
          )}
        </div>

        {reviews.length > 5 && (
          <button
            onClick={toggleShowAllComments}
            className="product-reviews-toggle-button"
          >
            {showAllComments ? "Show Less" : "Show All"}
          </button>
        )}

        <Modal
          isOpen={modalVisible}
          autoClose={closeModal}
          message={modalMessage}
        />
      </div>
    </>
  );
};

export default Details;
