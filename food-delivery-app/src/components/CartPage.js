import { useState, useEffect } from "react";
import "./CartPage.css";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    rating: "",
    comment: "",
    imagePath: "",
  });
  const userId = localStorage.getItem("user_id");
  
  useEffect(() => {
    const fetchCart = async () => {
      if (!userId) {
        console.error("❌ User ID is missing. Cannot fetch cart.");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/orderitems?user_id=${userId}`
        );
        if (!response.ok) throw new Error("Failed to fetch cart items");

        const data = await response.json();

        if (!Array.isArray(data) || data.some((item) => !item.item_id)) {
          console.error("❌ Some cart items are missing an ID!", data);
          return;
        }

        const formattedData = data.map((item) => ({
          ...item,
          price: Number(item.price) || 0,
        }));

        setCartItems(formattedData);
      } catch (error) {
        console.error("❌ Error fetching cart items:", error);
      }
    };

    fetchCart();
  }, [userId]);

  const handleQuantityChange = async (index, delta) => {
    if (!userId) {
      console.error("❌ User ID is missing");
      return;
    }

    const updatedCart = [...cartItems];

    if (!updatedCart[index]) {
      console.error("❌ Invalid cart item at index:", index);
      return;
    }

    const item = updatedCart[index];

    if (!item.item_id) {
      console.error("❌ Item ID is missing!", item);
      return;
    }

    const newQuantity = item.quantity + delta;

    if (newQuantity < 1) {
      return handleRemoveItem(index);
    }

    updatedCart[index].quantity = newQuantity;
    setCartItems(updatedCart);

    try {
      const response = await fetch(
        `http://localhost:5000/api/orderitems/${item.item_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            quantity: newQuantity,
          }),
        }
      );

      const responseData = await response.json();

      if (!response.ok)
        throw new Error(
          responseData.message || "Failed to update item quantity"
        );
    } catch (error) {
      console.error("❌ Error updating item quantity:", error);
    }
  };

  const handleRemoveItem = async (index) => {
    if (!userId) return console.error("❌ User ID is missing");

    const itemToRemove = cartItems[index];
    const updatedCart = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCart);

    try {
      await fetch(
        `http://localhost:5000/api/orderitems/${itemToRemove.item_id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );
    } catch (error) {
      console.error("❌ Error removing item:", error);
    }
  };

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * item.quantity,
    0
  );

  const handlePaymentSubmit = async () => {
    if (!userId) {
      console.error("❌ User ID is missing");
      return;
    }

    const orderData = {
      user_id: userId,
      total_price: totalPrice.toFixed(2),
      payment_info: paymentInfo,
      items: JSON.stringify(cartItems), // Convert cart items to JSON
    };

    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const responseData = await response.json(); // Get the response body

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to submit order");
      }

      // Clear the cart after successful order submission
      setCartItems([]);
      setShowPaymentModal(false);
      setShowFeedbackModal(true);
      setPaymentInfo(""); // Reset payment info input

      // Send request to delete items from OrderItems table after successful checkout
      await fetch(`http://localhost:5000/api/orderitems/clear`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }), // Pass user_id to delete user's items from OrderItems
      });

      alert("Payment successful! Your order has been placed."); // Alert message
    } catch (error) {
      console.error("❌ Error submitting order:", error);
    }
  };

  const handleFeedbackChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      setFormData({ name: "", rating: "", comment: "", imagePath: "" });
      alert("✅ Feedback submitted successfully!");
      setShowFeedbackModal(false);
      
  
      if (!response.ok) {
        console.error("❌ Failed to submit feedback");
        alert("❌ Error submitting feedback, please try again.");
        return;
      }
      
    } catch (error) {
      console.error("❌ Error submitting feedback:", error.message);
    }
  };
  
  return (
    <div className="cart-container">
      <h1 className="cart-title">Your Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <p className="empty-cart">🛒 Your cart is empty.</p>
      ) : (
        <>
          <ul className="cart-items">
            {cartItems.map((item, index) => (
              <li key={item.id} className="cart-item">
                <img
                  src={item.imageURL || "/default-image.jpg"}
                  alt={item.name}
                />
                <div className="cart-item-details">
                  <p className="cart-item-name">{item.name}</p>
                  <p className="cart-item-price">
                    ${(Number(item.price) || 0).toFixed(2)}
                  </p>
                </div>
                <div className="cart-item-quantity">
                  <button onClick={() => handleQuantityChange(index, -1)}>
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(index, 1)}>
                    +
                  </button>
                </div>
                <p
                  className="cart-item-remove"
                  onClick={() => handleRemoveItem(index)}
                >
                  ✕
                </p>
              </li>
            ))}
          </ul>
          <div className="cart-summary">
            <p>Total: ${totalPrice.toFixed(2)}</p>
            <button
              className="cart-checkout"
              onClick={() => setShowPaymentModal(true)}
            >
              Provide Payment Info
            </button>
          </div>
        </>
      )}
      {showPaymentModal && (
        <div className="payment-overlay">
          <div className="payment-modal">
            <h2>Payment</h2>
            <p>Total Price: ${totalPrice.toFixed(2)}</p>
            <input
              type="text"
              placeholder="Enter payment details"
              value={paymentInfo}
              onChange={(e) => setPaymentInfo(e.target.value)}
            />
            <div className="payment-buttons">
              <button
                className="cancel-button"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </button>
              <button className="pay-button" onClick={handlePaymentSubmit}>
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
      {showFeedbackModal && (
        <div className="feedback-overlay">
          <div className="feedback-modal">
            <button
              className="close-feedback"
              onClick={() => setShowFeedbackModal(false)}
            >
              ✕
            </button>
            <h2>Leave Your Feedback</h2>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleFeedbackChange}
                placeholder="Enter your name"
                required
              />
              <select
                id="rating"
                value={formData.rating}
                onChange={handleFeedbackChange}
                required
              >
                <option value="">Select a rating</option>
                <option value="5⭐">5⭐</option>
                <option value="4⭐">4⭐</option>
                <option value="3⭐">3⭐</option>
                <option value="2⭐">2⭐</option>
                <option value="1⭐">1⭐</option>
              </select>
              <textarea
                id="comment"
                value={formData.comment}
                onChange={handleFeedbackChange}
                placeholder="Write your comment here"
                required
              ></textarea>
              <input
                type="text"
                id="imagePath"
                value={formData.imagePath}
                onChange={handleFeedbackChange}
                placeholder="Enter Image Path"
              />
              <button type="submit" onClick={handleFeedbackSubmit}>Submit</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default CartPage;
