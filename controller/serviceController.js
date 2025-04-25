import pool from "../db.js";

// GET all services with optional pagination
export const getAllServices = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT
         service_id,
         service_name,
         service_unit,
         service_price_per_unit
       FROM services
       WHERE is_deleted = FALSE
       ORDER BY service_id
       LIMIT $1 OFFSET $2;`,
      [limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM services WHERE is_deleted = FALSE;`
    );
    const totalCount = parseInt(countResult.rows[0].count, 10);

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        total_records: totalCount,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      }
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getServicesByName = async (req, res) => {
	try {
		const { name = '', page = 1, limit = 10 } = req.query;
		const offset = (page - 1) * limit;
	
		const searchTerm = `%${name}%`;
	
		const result = await pool.query(
			`SELECT
				service_id,
				service_name,
				service_unit,
				service_price_per_unit
			FROM services
			WHERE is_deleted = FALSE AND service_name ILIKE $1
			ORDER BY service_id
			LIMIT $2 OFFSET $3;`,
			[searchTerm, limit, offset]
		);
	
		const countResult = await pool.query(
			`SELECT COUNT(*) FROM services WHERE is_deleted = FALSE AND service_name ILIKE $1;`,
			[searchTerm]
		);
		const totalCount = parseInt(countResult.rows[0].count, 10);
	
		return res.status(200).json({
				success: true,
				data: result.rows,
				pagination: {
				total_records: totalCount,
				page: parseInt(page, 10),
				limit: parseInt(limit, 10),
			}
		});
		} catch (err) {
			console.error(err.message);
			return res.status(500).json({ success: false, message: "Internal Server Error" });
		}
	};
// GET a single service by ID
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT
         service_id,
         service_name,
         service_unit,
         service_price_per_unit
       FROM services
       WHERE service_id = $1
         AND is_deleted = FALSE;`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// CREATE a new service
export const createService = async (req, res) => {
  try {
    const { service_name, service_unit, service_price_per_unit } = req.body;
    const result = await pool.query(
      `INSERT INTO services (service_name, service_unit, service_price_per_unit)
       VALUES ($1, $2, $3)
       RETURNING
         service_id,
         service_name,
         service_unit,
         service_price_per_unit;`,
      [service_name, service_unit, service_price_per_unit]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// UPDATE a service by ID (partial)
export const updateServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const { service_name, service_unit, service_price_per_unit } = req.body;

    let fields = [];
    let values = [];
    let idx = 1;

    if (service_name !== undefined) {
      fields.push(`service_name = $${idx++}`);
      values.push(service_name);
    }
    if (service_unit !== undefined) {
      fields.push(`service_unit = $${idx++}`);
      values.push(service_unit);
    }
    if (service_price_per_unit !== undefined) {
      fields.push(`service_price_per_unit = $${idx++}`);
      values.push(service_price_per_unit);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    // always update the updated_at timestamp
    fields.push(`updated_at = now()`);

    values.push(id);

    const sql = `
      UPDATE services
      SET ${fields.join(', ')}
      WHERE service_id = $${idx}
        AND is_deleted = FALSE
      RETURNING
        service_id,
        service_name,
        service_unit,
        service_price_per_unit;
    `;

    const result = await pool.query(sql, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Service not found or deleted" });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// DELETE (soft-delete) a service by ID
export const deleteServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE services
       SET is_deleted = TRUE
       WHERE service_id = $1;`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    return res.status(200).json({ success: true, message: "Service deleted successfully" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
