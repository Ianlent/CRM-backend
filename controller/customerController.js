import pool from "../db.js";


export const getAllCustomers = async (req, res) => {
	try {
		const result = await pool.query(
			`SELECT 
				customer_id, first_name, last_name, phone_number, address, points
			FROM customers
			WHERE is_deleted = FALSE
			ORDER BY customer_id ASC`
		);
		return res.status(200).json({ success: true, data: result.rows });
	} catch (err) {
		console.error(err.message);
		return res
			.status(500)
			.json({ success: false, message: "Internal Server Error" });
	}
};

export const  getCustomerById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await pool.query(
			`SELECT 
				customer_id, first_name, last_name, phone_number, address, points
			FROM customers
			WHERE customer_id = $1 AND is_deleted = FALSE`,
			[id]
		);
		if (result.rows.length === 0) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}
		return res.status(200).json({ success: true, data: result.rows[0] });
	} catch (err) {
		console.error(err.message);
		return res
			.status(500)
			.json({ success: false, message: "Internal Server Error" });
	}
}

export const getCustomerByPhoneFirstLast = async (req, res) => {
	try {
		let { phone_number = "", first_name = "", last_name="" } = req.body;

		phone_number = phone_number || "";
		first_name = first_name || "";
		last_name = last_name || "";

		const sql = `
		SELECT
			customer_id,
			first_name,
			last_name,
			phone_number,
			address,
			points
		FROM customers
		WHERE lower(phone_number)	LIKE lower($1 || '%')
			AND lower(first_name)	LIKE lower($2 || '%')
			AND lower(last_name)	LIKE lower($3 || '%')
			AND is_deleted = FALSE
		ORDER BY first_name, last_name
		LIMIT 50;
	`;

		const result = await pool.query(sql, [phone_number, first_name, last_name]);
		if (result.rows.length === 0) {
			return res
				.status(200)
				.json({ success: true, data: result.rows, canCreate: true });
		}
		return res.status(200).json(
			{ success: true, data: result.rows }
		)
	} catch (err) {
		console.error(err.message);
		return res
			.status(500)
			.json({ success: false, message: "Internal Server Error" });
	}
}

export const createCustomer = async (req, res) => {
	try {
		const { first_name, last_name, phone_number, address } = req.body;
		const result = await pool.query(
			`INSERT INTO customers (first_name, last_name, phone_number, address)
			VALUES ($1, $2, $3, $4)
			RETURNING 
				customer_id, first_name, last_name, phone_number, address, points`,
			[first_name, last_name, phone_number || null, address]
		);
		return res.status(201).json({ success: true, data: result.rows[0] });
	} catch (err) {
		console.error(err.message);
		return res
			.status(500)
			.json({ success: false, message: "Internal Server Error" });
	}
}

export const updateCustomerByID = async (req, res) => {
	try {
		const { id } = req.params;
		const { first_name, last_name, phone_number, address, points } = req.body;

		let fields = [];
		let values = [];
		let idx = 1;

		if (first_name) {
			fields.push(`first_name = $${idx++}`);
			values.push(first_name);
		}
		if (last_name) {
			fields.push(`last_name = $${idx++}`);
			values.push(last_name);
		}
		if (typeof phone_number !== "undefined") {
			fields.push(`phone_number = $${idx++}`);
			values.push(phone_number || null);
		}
		if (address) {
			fields.push(`address = $${idx++}`);
			values.push(address);
		}
		if (typeof points !== "undefined") {
			fields.push(`points = $${idx++}`);
			values.push(points);
		}

		if (fields.length === 0) {
			return res.status(400).json({ success: false, message: "No fields to update" });
		}

		values.push(id);

		const sql = `
			UPDATE customers SET ${fields.join(", ")}
			WHERE customer_id = $${idx} AND is_deleted = FALSE
			RETURNING customer_id, first_name, last_name, phone_number, address, points
		`;

		const result = await pool.query(sql, values);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Customer not found or deleted" });
		}

		return res.status(200).json({ success: true, data: result.rows[0] });
	} catch (err) {
		console.error(err.message);
		return res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};

export const deleteCustomerByID = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await pool.query(
			`UPDATE customers
			SET is_deleted = TRUE
			WHERE customer_id = $1 AND is_deleted = FALSE
			RETURNING customer_id`,
			[id]
		);
		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Customer not found or already deleted" });
		}
		return res.status(204).send();
	} catch (err) {
		console.error(err.message);
		return res
			.status(500)
			.json({ success: false, message: "Internal Server Error" });
	}
};
