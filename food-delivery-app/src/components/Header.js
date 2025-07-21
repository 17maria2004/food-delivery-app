import React from "react";
import {Link} from "react-router-dom";
import {Carousel} from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import './Header.css';

const Header = () =>{
    return(
        <header className="header">
            <div className="header-content">
                <Carousel 
                    showThumbs = {false}
                    showStatus = {false}
                    infiniteLoop
                    autoPlay
                    interval={3000}
                    showArrows = {false}
                >
                    <div className="slider-text">
                        <h2>Fast Food Restaurant</h2>
                        <p>Fresh, hot, and ready to satisfy your cravings!</p>

                        <Link to="/menu"><button className="order-button" > Order now</button></Link>
                    </div>

                    <div className="slider-text">
                        <h2>Best Burgers in Town</h2>
                        <p>Fresh, hot, and ready to satisfy your cravings!</p>

                        <Link to="/menu"><button className="order-button" > Order now</button></Link>
                    </div>

                    <div className="slider-text">
                        <h2>Delicious Meals</h2>
                        <p>Fresh, hot, and ready to satisfy your cravings!</p>

                        <Link to="/menu"><button className="order-button" > Order now</button></Link>
                    </div>

                </Carousel>
            </div>
        </header>
    )
}
export default Header;