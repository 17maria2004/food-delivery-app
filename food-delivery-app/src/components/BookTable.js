import React, { useState } from "react";
import "./BookTable.css";

const Address = () => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        //Uses spread syntax (...formData) to keep previous values and only update the changed field.
    };

    const getUserId = () => {
        const user_id = localStorage.getItem("user_id");
        return user_id ? parseInt(user_id, 10) : null; 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const user_id = getUserId();
        if (!user_id) {
            alert("❌ Please log in to add Address.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/place-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Address Added Successfully ");
            } else {
                alert(data.error || "Failed to add address");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="book-table-section">
            <div className="form-container">
                <h2>Add Address</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="name" placeholder="Your Name" required onChange={handleChange} />
                    <input type="tel" name="phoneNumber" placeholder="Phone Number" required onChange={handleChange} />
                    <input type="email" name="email" placeholder="Your Email" required onChange={handleChange} />
                    <textarea name="address" placeholder="Delivery Address" rows="3" required onChange={handleChange}></textarea>
                    <button type="submit">Submit</button>
                </form>
            </div>
            <div className="map-container">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d6624.855839362478!2d35.52922938721924!3d33.878631472740615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2slb!4v1736581119645!5m2!1sen!2slb"
                    width="100%"
                    height="100%"
                    allowFullScreen=""
                    aria-hidden="false"
                    tabIndex="0"
                ></iframe>
            </div>
        </div>
    );
};

export default Address;
