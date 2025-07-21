import React, { useState, useEffect } from "react";
import './TestimonialSlider.css';

const TestimonialSlider = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    
    useEffect(() => {
        fetch("http://localhost:5000/api/feedback")
            .then(res => res.json())
            .then(data => setTestimonials(data))
            .catch(err => console.error("Error fetching testimonials:", err));
    }, []);

    const handlePrevClick = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
    };

    const handleNextClick = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    };

    return (
        <div className="testimonial-slider">
            <h2>What Says Our Customers</h2>
            <div className="testimonial-container">
                {testimonials.length > 0 ? (
                    testimonials.map((testimonial, index) => (
                        <div key={index} className={`testimonial ${index === currentIndex ? 'active' : ''}`}>
                            <p>{testimonial.comment}</p>
                            <h4>{testimonial.name}</h4>
                            <h5>Rated: {testimonial.rating}</h5>
                        </div>
                    ))
                ) : (
                    <p>No testimonials yet.</p>
                )}
            </div>

            <div className="testimonial-navigation">
                {testimonials.map((testimonial, index) => (
                    <img key={index} src={testimonial.imagePath || "images/default.jpg"} alt={testimonial.name}
                        className={`testimonial-image ${index === currentIndex ? 'active' : ''}`} />
                ))}
            </div>

            <div className="slider-control">
                <button onClick={handlePrevClick}>&lt;</button>
                <button onClick={handleNextClick}>&gt;</button>
            </div>
        </div>
    );
};

export default TestimonialSlider;
