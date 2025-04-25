import pool from '../db.js';

export const getAllDiscounts = async (req, res) => {
	try {
		const { page = 1, limit = 10 } = req.query;
		const offset = (page - 1) * limit;

		const result = await pool.query(`
			SELECT discount_id, required_points, discount_type, amount, created_at, updated_at
			FROM discounts
			WHERE is_deleted = FALSE
			ORDER BY created_at DESC
			LIMIT $1 OFFSET $2;
		`, [limit, offset]);

		const countResult = await pool.query(
			`SELECT COUNT(*) FROM discounts WHERE is_deleted = FALSE;`
		);
		const totalCount = parseInt(countResult.rows[0].count);

		return res.status(200).json({
			success: true,
			data: result.rows,
			pagination: {
				total_record: totalCount,
				page: parseInt(page),
				limit: parseInt(limit),
			}
		});
	} catch (err) {
		console.error(err.message);
		return res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};

export const getDiscountById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await pool.query(`
			SELECT discount_id, required_points, discount_type, amount, created_at, updated_at
			FROM discounts
			WHERE discount_id = $1 AND is_deleted = FALSE;
		`, [id]);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Discount not found" });
		}

		return res.status(200).json({ success: true, data: result.rows[0] });
	} catch (err) {
		console.error(err.message);
		return res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};


export const createDiscount = async (req, res) => {
	try {
		const { required_points, discount_type, amount } = req.body;
		const result = await pool.query(`
			INSERT INTO discounts (required_points, discount_type, amount)
			VALUES ($1, $2, $3)
			RETURNING discount_id, required_points, discount_type, amount, created_at, updated_at;
		`, [required_points, discount_type, amount]);

		return res.status(201).json({ success: true, data: result.rows[0] });
	} catch (err) {
		console.error(err.message);
		return res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};

export const updateDiscountById = async (req, res) => {
	try {
		const { id } = req.params;
		const { required_points, discount_type, amount } = req.body;

		let fields = [];
		let values = [];
		let idx = 1;

		if (required_points !== undefined) {
			fields.push(`required_points = $${idx++}`);
			values.push(required_points);
		}
		if (discount_type !== undefined) {
			fields.push(`discount_type = $${idx++}`);
			values.push(discount_type);
		}
		if (amount !== undefined) {
			fields.push(`amount = $${idx++}`);
			values.push(amount);
		}

		if (fields.length === 0) {
			return res.status(400).json({ success: false, message: "No fields to update" });
		}

		fields.push(`updated_at = now()`);
		values.push(id);

		const sql = `
			UPDATE discounts SET ${fields.join(", ")}
			WHERE discount_id = $${idx} AND is_deleted = FALSE
			RETURNING discount_id, required_points, discount_type, amount, created_at, updated_at;
		`;

		const result = await pool.query(sql, values);
		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Discount not found or deleted" });
		}

		return res.status(200).json({ success: true, data: result.rows[0] });
	} catch (err) {
		console.error(err.message);
		return res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};


// Soft delete a discount by ID
export const deleteDiscountById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await pool.query(`
			UPDATE discounts
			SET is_deleted = TRUE, updated_at = now()
			WHERE discount_id = $1;
		`, [id]);

		if (result.rowCount === 0) {
			return res.status(404).json({ success: false, message: "Discount not found" });
		}

		return res.status(200).json({ success: true, message: "Discount deleted successfully" });
	} catch (err) {
		console.error(err.message);
		return res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};
