const mysql = require("mysql2");

class DbService {
    static instance = null;

    static getDbServiceInstance() {
        return this.instance ?? (this.instance = new DbService());
    }

    constructor() {
        this.db = mysql.createPool({
            host: process.env.HOST,
            user: process.env.USER,
            password: process.env.PASSWORD,
            database: process.env.DATABASE,
            port: process.env.DB_PORT,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        this.db.getConnection((err) => {
            if (err) {
                console.error("Database connection failed:", err);
                return;
            }
            console.log("Connected to MySQL database.");
        });
    }

    query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.query(sql, params, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    getAllData() {
        const sql = "SELECT * FROM items";
        return this.query(sql);
    }
}

module.exports = DbService;
