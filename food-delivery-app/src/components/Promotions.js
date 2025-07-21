import React from "react";
import './Promotions.css';
import {Link} from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

const Promotions = () =>{

    return(
        <div className="promotions">
            <div className="promotion-card">
                <img src="./images/burger.png" alt="Burger"/>

                <div className="promotion-conent">
                    <div className="promotion-title"> Tasty Thursdays</div>
                    <div className="promotion-discount"> 20% off</div>
                    <Link to="/menu"><button className="order-button" > Order now <FaShoppingCart/></button></Link>
                </div>
            </div>

            <div className="promotion-card">
                <img src="./images/pizza.png" alt="Pizza"/>

                <div className="promotion-conent">
                    <div className="promotion-title"> Pizza Days</div>
                    <div className="promotion-discount"> 15% off</div>
                    <Link to="/menu"><button className="order-button" > Order now <FaShoppingCart/></button></Link>
                </div>
            </div>
        </div>
        
    )
};
export default Promotions;