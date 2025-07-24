const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const DbService = require("./dbService");
const bcrypt = require("bcryptjs");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const dbService = DbService.getDbServiceInstance();

app.get("/api/orderitems", async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const result = await dbService.query(
      "SELECT oi.item_id, oi.user_id, oi.quantity, oi.price, i.name, i.imageURL FROM OrderItems oi JOIN Items i ON oi.item_id = i.id WHERE oi.user_id = ?;",
      [user_id],
    );

    res.json(result);
  } catch (error) {
    console.error("❌ Error fetching order items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/orders", async (req, res) => {
  const { user_id, total_price, payment_info, items } = req.body;

  if (!user_id || !total_price || !payment_info || !items) {
    console.error("❌ Missing required fields:", { user_id, total_price, payment_info, items });
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const query = `
      INSERT INTO Orders (user_id, total_price, payment_info, items) 
      VALUES (?, ?, ?, ?)
    `;
    
    const result = await dbService.query(query, [user_id, total_price, payment_info, items]);
    
    res.status(201).json({ message: "Order placed successfully" });
  } catch (error) {
    console.error("❌ Database query error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.delete("/api/orderitems/clear", (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  dbService.query(
    "DELETE FROM OrderItems WHERE user_id = ?",
    [user_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error clearing cart items", error: err });
      }
      res.json({ message: "All items removed from cart" });
    }
  );
});

app.get("/api/items", async (req, res) => {
  try {
    const items = await dbService.getAllData();
    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error.message);
    res.status(500).send("Error fetching items");
  }
});

app.get("/api/get-user/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
      const [user] = await dbService.query("SELECT address FROM users WHERE id = ?", [user_id]);

      if (user.length === 0) {
          return res.status(404).json({ error: "User not found" });
      }

      res.json(user[0]);
  } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});



app.delete("/api/orderitems/:item_id", async (req, res) => {
  const { item_id } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const result = await dbService.query(
      "DELETE FROM OrderItems WHERE item_id = ? AND user_id = ?",
      [item_id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found or already removed" });
    }

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.put("/api/orderitems/:item_id", async (req, res) => {
  const { item_id } = req.params;
  const { user_id, quantity } = req.body;

  if (!user_id || quantity === undefined) {
    return res.status(400).json({ message: "Missing user_id or quantity" });
  }

  try {
    if (quantity < 1) {
      const deleteQuery = "DELETE FROM orderitems WHERE item_id = ? AND user_id = ?";
      const deleteResult = await dbService.query(deleteQuery, [item_id, user_id]);

      if (deleteResult.affectedRows === 0) {
        return res.status(404).json({ message: "Item not found or already removed" });
      }

      return res.json({ message: "Item removed from cart" });
    }

    const updateQuery = "UPDATE orderitems SET quantity = ? WHERE item_id = ? AND user_id = ?";
    const result = await dbService.query(updateQuery, [quantity, item_id, user_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Quantity updated successfully" });
  } catch (error) {
    console.error("❌ Database error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";

  try {
    const result = await dbService.query(sql, [email]);
    if (result.length === 0)
      return res.status(401).json({ error: "Email not found, Please Consider Signing Up!" });

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    res.json({
      message: "Login successful",
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/add-to-cart", async (req, res) => {
  let { user_id, item_id, quantity, price } = req.body;

  if (!user_id || !item_id || !quantity || !price) {
    return res.status(400).json({ error: "All fields are required." });
  }

  user_id = parseInt(user_id, 10);

  try {
    const userCheckQuery = "SELECT address FROM users WHERE id = ?";
    const result = await dbService.query(userCheckQuery, [user_id]); 

    const rows = Array.isArray(result) ? result : result[0];

    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: "Invalid user ID. Please log in again." });
    }

    const userAddress = rows[0]?.address;

    if (!userAddress) {
      return res.status(400).json({ error: "You must add an address before adding items to your cart." });
    }

    const existingItemQuery = "SELECT * FROM OrderItems WHERE user_id = ? AND item_id = ?";
    const existingItemResult = await dbService.query(existingItemQuery, [user_id, item_id]);

    const existingItem = Array.isArray(existingItemResult) ? existingItemResult : existingItemResult[0];

    if (existingItem.length > 0) {
      await dbService.query(
        "UPDATE OrderItems SET quantity = quantity + ? WHERE user_id = ? AND item_id = ?",
        [quantity, user_id, item_id]
      );
    } else {
      await dbService.query(
        "INSERT INTO OrderItems (user_id, item_id, quantity, price) VALUES (?, ?, ?, ?)",
        [user_id, item_id, quantity, price]
      );
    }

    res.status(200).json({ message: "✅ Item added to cart successfully." });
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

app.post("/api/feedback", async (req, res) => {
  const { name, rating, comment, imagePath } = req.body;

  if (!name || !rating || !comment) {
    return res.status(400).json({ message: "⚠️ Name, rating, and comment are required" });
  }

  try {
    const sql = "INSERT INTO feedback (name, rating, comment, imagePath) VALUES (?, ?, ?, ?)";
    await dbService.query(sql, [name, rating, comment, imagePath]);

    res.status(201).json({ message: "✅ Feedback submitted successfully!" });
  } catch (err) {
    console.error("❌ Error inserting feedback:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


app.get("/api/feedback", async (req, res) => {

  try {
    const sql = "SELECT * FROM feedback";
    const feedback = await dbService.query(sql);
    res.json(feedback);
  } catch (error) {
    console.error("❌ Error fetching feedback:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/cart-count", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const result = await dbService.query(
      "SELECT COUNT(*) as count FROM orderitems WHERE user_id = ?",
      [userId]
    );
    const count = result[0]?.count || 0;
    res.json({ count });
  } catch (error) {
    console.error("Error fetching cart count:", error);
    res.status(500).json({ error: "Server error while fetching cart count" });
  }
});

app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const checkUserSql = "SELECT * FROM users WHERE email = ?";
    const insertUserSql = "INSERT INTO users (email, password) VALUES (?, ?)";

    const existingUser = await dbService.query(checkUserSql, [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    await dbService.query(insertUserSql, [email, hashedPassword]);
    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/place-order", async (req, res) => {
  const { name, phoneNumber, email, address } = req.body;

  if (!name || !phoneNumber || !email || !address) {
    console.error("Missing required fields:", {
      name,
      phoneNumber,
      email,
      address,
    });
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const checkUserQuery = "SELECT * FROM users WHERE email = ?";
    const users = await dbService.query(checkUserQuery, [email]);

    if (!users || users.length === 0) {
      return res
        .status(404)
        .json({ error: "Email Not Found, Please Sign Up!" });
    }

    const updateUserQuery = `
      UPDATE users 
      SET name = ?, phoneNumber = ?, address = ? 
      WHERE email = ?`;
    
    await dbService.query(updateUserQuery, [name, phoneNumber, address, email]);

    res.status(200).json({ message: "User details updated successfully." });
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err.message });
  }
});


const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
