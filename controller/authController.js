import pool from "../db.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";
const saltRound = 10;

export const register = async (req, res) => {
	try {
		const { username, user_role, phone_number, password } = req.body;

		// Check if user already exists
		const userExists = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
		if (userExists.rows.length > 0) {
			return res.status(409).json({ success: false, message: "Username already exists" });
		}

		// Hash the password
		const salt = bcrypt.genSaltSync(saltRound);
		const hashedPassword = bcrypt.hashSync(password, salt);

		// Insert the new user
		const result = await pool.query(
			"INSERT INTO users (username, user_role, phone_number, password_hash) VALUES ($1, $2, $3, $4) RETURNING *",
			[username, user_role, phone_number, hashedPassword]
		);

		const newUser = result.rows[0];
		delete newUser.password_hash;

		const token = generateToken(newUser);

		return res.status(201).json({ success: true,
			user: newUser,
			token
		});
	} catch (err) {
		console.error(err.message);
		return res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};


export const login = async (req, res) => {
	try {
		const { username, password } = req.body;
		const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

		if (result.rows.length === 0) {
			return res.status(401).json({ success: false, message: "Invalid credentials" });
		}

		const user = result.rows[0];
		const isMatch = await bcrypt.compare(password, user.password_hash);
		if (!isMatch) {
			return res.status(401).json({ success: false, message: "Invalid credentials" });
		}

		delete user.password_hash;

		const token = generateToken(user);

		return res.status(200).json({ success: true, user, token });
	} catch (err) {
		console.error(err.message);
		return res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};
