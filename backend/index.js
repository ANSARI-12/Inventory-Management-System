require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const csv = require("csv-parser");
const { Parser } = require("json2csv");
const fs = require("fs");
const bcrypt = require("bcryptjs"); // Auth
const jwt = require("jsonwebtoken"); // Auth
const db = require("./db"); // Database

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || "fallback_dev_key";

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// File Upload Config
const upload = multer({ dest: "uploads/" });

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---

// 1. Register
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Missing fields" });

  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashedPassword],
    function (err) {
      if (err) {
        return res.status(400).json({ error: "Username already exists" });
      }
      res.json({ message: "User registered successfully" });
    }
  );
});

// 2. Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (!user) return res.status(400).json({ error: "User not found" });

      if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign(
          { id: user.id, username: user.username },
          SECRET_KEY,
          { expiresIn: "1h" }
        );
        res.json({ token });
      } else {
        res.status(401).json({ error: "Invalid password" });
      }
    }
  );
});

// --- PRODUCT ROUTES ---

// 3. GET ALL PRODUCTS & SEARCH (Protected)
app.get("/api/products/search", authenticateToken, (req, res) => {
  const { name, category } = req.query;
  let query = "SELECT * FROM products WHERE 1=1";
  let params = [];

  if (name) {
    query += " AND name LIKE ?";
    params.push(`%${name}%`);
  }
  if (category) {
    query += " AND category = ?";
    params.push(category);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 4. MANUAL ADD PRODUCT (Protected)
app.post("/api/products", authenticateToken, (req, res) => {
  const { name, unit, category, brand, stock, status, image } = req.body;
  const sql = `INSERT INTO products (name, unit, category, brand, stock, status, image) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.run(
    sql,
    [name, unit, category, brand, stock, status, image],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: "Product created" });
    }
  );
});

// 5. IMPORT CSV (Protected)
app.post(
  "/api/products/import",
  authenticateToken,
  upload.single("file"),
  (req, res) => {
    const results = [];
    let added = 0;
    let skipped = 0;
    let duplicates = [];

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        const promises = results.map((row) => {
          return new Promise((resolve) => {
            const { name, unit, category, brand, stock, status, image } = row;

            db.get(
              "SELECT id FROM products WHERE name = ? COLLATE NOCASE",
              [name],
              (err, existing) => {
                if (existing) {
                  skipped++;
                  duplicates.push({ name, existingId: existing.id });
                  resolve();
                } else {
                  const sql = `INSERT INTO products (name, unit, category, brand, stock, status, image) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                  db.run(
                    sql,
                    [
                      name,
                      unit,
                      category,
                      brand,
                      stock || 0,
                      status || "In Stock",
                      image,
                    ],
                    function (err) {
                      if (!err) added++;
                      resolve();
                    }
                  );
                }
              }
            );
          });
        });

        Promise.all(promises).then(() => {
          fs.unlinkSync(req.file.path); // Cleanup
          res.json({ added, skipped, duplicates });
        });
      });
  }
);

// 6. EXPORT CSV (Protected)
app.get("/api/products/export", authenticateToken, (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const json2csvParser = new Parser();
    const csvData = json2csvParser.parse(rows);

    res.header("Content-Type", "text/csv");
    res.attachment("products.csv");
    return res.send(csvData);
  });
});

// 7. UPDATE PRODUCT & LOG HISTORY (Protected)
app.put("/api/products/:id", authenticateToken, (req, res) => {
  const { id } = req.params;

  // Validate id is positive integer
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  const { name, unit, category, brand, stock, status, image } = req.body;
  const newStock = parseInt(stock);

  db.get("SELECT * FROM products WHERE id = ?", [id], (err, product) => {
    if (!product) return res.status(404).json({ error: "Product not found" });

    const oldStock = product.stock;
    const sql = `UPDATE products SET name=?, unit=?, category=?, brand=?, stock=?, status=?, image=? WHERE id=?`;

    db.run(
      sql,
      [name, unit, category, brand, newStock, status, image, id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        // Log History if stock changed
        if (oldStock !== newStock) {
          db.run(
            `INSERT INTO inventory_logs (product_id, old_stock, new_stock, changed_by) VALUES (?, ?, ?, ?)`,
            [id, oldStock, newStock, req.user.username]
          );
        }
        res.json({ message: "Updated successfully" });
      }
    );
  });
});

// 8. GET HISTORY (Protected)
app.get("/api/products/:id/history", authenticateToken, (req, res) => {
  const sql =
    "SELECT * FROM inventory_logs WHERE product_id = ? ORDER BY timestamp DESC";
  db.all(sql, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 9. DELETE PRODUCT (Protected)
app.delete("/api/products/:id", authenticateToken, (req, res) => {
  db.run("DELETE FROM products WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted" });
  });
});

// 10. DELETE ALL (Protected)
app.delete("/api/products", authenticateToken, (req, res) => {
  db.run("DELETE FROM products", [], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.run("DELETE FROM inventory_logs", [], (err) => {
      res.json({ message: "All products deleted" });
    });
  });
});

// --- START SERVER ---
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
