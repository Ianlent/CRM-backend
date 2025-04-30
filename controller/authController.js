import pool from "../db.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";

const saltRounds = 10;

// Register a new employee user
export const register = async (req, res) => {
	try {
		const { username, phone_number, password } = req.body;

		// Check if username already taken (including deleted accounts)
		const exists = await pool.query(
			`SELECT 1 FROM users WHERE username = $1`,
			[username]
		);
		if (exists.rows.length) {
			return res.status(409).json({ success: false, message: "Username already exists" });
		}

		const user_role = 'employee';

		// Hash password
		const salt = await bcrypt.genSalt(saltRounds);
		const password_hash = await bcrypt.hash(password, salt);

		// Insert user (user_status defaults to 'active')
		const result = await pool.query(
			`INSERT INTO users (username, user_role, phone_number, password_hash)
			VALUES ($1, $2, $3, $4)
			RETURNING
				user_id,
				username,
				user_role,
				phone_number`,
			[username, user_role, phone_number, password_hash]
		);

		const newUser = result.rows[0];
		// Generate JWT (only include safe fields)
		const token = generateToken({
			user_id: newUser.user_id,
			username: newUser.username,
			user_role: newUser.user_role
		});

		return res.status(201).json({ success: true, user: newUser, token });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};

// Authenticate and login user
export const login = async (req, res) => {
	try {
		const { username, password } = req.body;

		// Fetch user with active status and not deleted
		const result = await pool.query(
			`SELECT
				user_id,
				username,
				user_role,
				password_hash
			FROM users
			WHERE username = $1
				AND is_deleted = FALSE
				AND user_status = 'active'`,
			[username]
		);

		if (!result.rows.length) {
			return res.status(401).json({ success: false, message: "Invalid credentials" });
		}

		const user = result.rows[0];
		const match = await bcrypt.compare(password, user.password_hash);
		if (!match) {
			return res.status(401).json({ success: false, message: "Invalid credentials" });
		}

		// Strip out password_hash
		delete user.password_hash;

		// Generate JWT
		const token = generateToken({
			user_id: user.user_id,
			username: user.username,
			user_role: user.user_role,
		});

		return res.status(200).json({ success: true, user, token });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};
