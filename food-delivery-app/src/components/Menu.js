import { useState, useEffect } from "react";
import './Menu.css';

const categories = ['All', 'Burger', 'Pizza', 'Pasta', 'Appetizers'];

const Menu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [quantities, setQuantities] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/items')
            .then(response => response.json())
            .then(data => {
                setMenuItems(data);
                setQuantities(data.map(() => 1));//by default
            })
            .catch(error => console.error('Error fetching menu items:', error));
    }, []);

    const filteredItems = activeCategory === 'All' ? menuItems : menuItems.filter(item => item.category === activeCategory);
//aam tshuf l category la kel item bet2arena bel active category ===..?

    const getUserId = () => {
        const user_id = localStorage.getItem("user_id");
        return user_id ? parseInt(user_id, 10) : null; 
    };//hon aam ntabe2a waeta l user bddo yaaml add to cart
    
    const handleAddToCart = async (item_id, quantity, price) => {
        const user_id = getUserId();
    
        try {
            const response = await fetch("http://localhost:5000/api/add-to-cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id, item_id, quantity, price }),
            });

            const errorData = await response.json();
            
            if (!user_id) {
                if(!response.ok){
                alert("❌ Please log in And set your address to add items to your cart.");
                return;
                }
            }

            if (!user_id) {
                alert("❌ Please log in to add items to your cart.");
                return;
            }

            if (!response.ok) {
                alert(`❌ ${errorData.error || "Something went wrong."}`);
                return;
            }//hay eza msh hatit address
    
            alert("✅ Item added to cart!");
        } catch (error) {
            alert("❌ Network error: Could not connect to the server.");
        }
    };
        
    const handleQuantityChange = (index, type) => {
        setQuantities(prev => prev.map((qty, i) =>
            i === index ? (type === "increment" ? qty + 1 : Math.max(qty - 1, 1)) : qty 
        ));//btestaaml l prev and maps over kel qty
    }; //l i hiye l position tabaa l item in the quantities that needs to be updated

    return (
        <div className="menu">
            <h2>Our Menu</h2>
            <div className="menu-categories">
                {categories.map(category => (
                    <button
                        key={category}
                        className={activeCategory === category ? 'active' : ''}
                        onClick={() => setActiveCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="menu-items">
                {filteredItems.map((item, index) => (
                    <div className="menu-card" key={item.id}>
                        <img src={item.imageURL} alt={item.name} />
                        <div className="menu-card-content">
                            <h3>{item.name}</h3>
                            <div className="Menu-card-price">${item.price}</div>
                            <div className="quantity-controls">
                                <button onClick={() => handleQuantityChange(index, "decrement")}>-</button>
                                <span>{quantities[index]}</span>
                                <button onClick={() => handleQuantityChange(index, "increment")}>+</button>
                            </div>
                            <button className="order-button" onClick={() => handleAddToCart(item.id, quantities[index], item.price)}>Add to Cart</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Menu;
