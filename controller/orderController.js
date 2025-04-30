import pool from "../db.js";
import dotenv from "dotenv";
dotenv.config();
const magnificationFactor = process.env.MAGNIFICATION_FACTOR;

export const getAllOrders = async (req, res) => {
	try {
		const { page = 1, limit = 10 } = req.query;
		const offset = (page - 1) * limit;
		const result = await pool.query(
			`
			SELECT 
				o.order_id,
				o.customer_id,
				o.order_date,
				o.handler_id,
				o.order_status,
				o.discount_id,
				d.discount_type,
				d.amount AS discount_amount,
				SUM(os.total_price) AS total_order_price
			FROM orders o
			LEFT JOIN order_service os ON o.order_id = os.order_id
			LEFT JOIN discounts d ON o.discount_id = d.discount_id
			WHERE o.is_deleted = FALSE
			GROUP BY o.order_id, o.customer_id, o.order_date, o.handler_id, o.order_status, o.discount_id, d.discount_type, d.amount
			ORDER BY o.order_date DESC
			LIMIT $1 OFFSET $2;
		`,
			[limit, offset]
		);
		const countResult = await pool.query(`
			SELECT COUNT(*) FROM orders WHERE is_deleted = FALSE;
		`);
		const totalCount = parseInt(countResult.rows[0].count);

		res.status(200).json({
			success: true,
			data: result.rows,
			pagination: {
				total_record: totalCount,
				page: parseInt(page),
				limit: parseInt(limit),
			},
		});
	} catch (err) {
		res.status(500).json({ error: "Failed to fetch orders" });
	}
};

export const getCurrentOrdersForHandler = async (req, res) => {
	const { handler_id } = req.params;
	const user_id = req.user?.user_id;
	try {
		if (user_id !== handler_id && req.user?.user_role !== "admin") {
			return res.status(401).json({ success: false, message: "Unauthorized" });
		}

		// Check if handler_id exists
		const handlerCheckResult = await pool.query(
			`SELECT 1 FROM users WHERE user_id = $1`, [handler_id]
		);
		if (handlerCheckResult.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Handler not found" });
		}

		const result = await pool.query(
			`
			SELECT 
				o.order_id,
				o.customer_id,
				o.order_date,
				o.handler_id,
				o.order_status,
				o.discount_id,
				d.discount_type,
				d.amount AS discount_amount,
				SUM(os.total_price) AS total_order_price
			FROM orders o
			LEFT JOIN order_service os ON o.order_id = os.order_id
			LEFT JOIN discounts d ON o.discount_id = d.discount_id
			WHERE o.is_deleted = FALSE AND o.handler_id = $1 AND o.order_status NOT IN ('completed', 'cancelled')
			GROUP BY o.order_id, o.customer_id, o.order_date, o.handler_id, o.order_status, o.discount_id, d.discount_type, d.amount
			ORDER BY o.order_date DESC;
		`,
			[handler_id]
		);

		if (result.rows.length === 0) {
			return res.status(200).json({ success: true, data: [], message: 'No orders found being processed by the handler' });
		}

		res.status(200).json({ success: true, data: result.rows });
	} catch(err) {
		res.status(500).json({ error: "Failed to fetch orders" });
	}
}

export const getOrdersByDateRange = async (req, res) => {
	const { start, end } = req.query;
	if (!start && !end) {
		return res
			.status(400)
			.json({ success: false, message: "Start or end date is required." });
	}
	let startDate = start ? new Date(start) : null;
	let endDate = end ? new Date(end) : null;
	if (startDate > endDate) {
		return res
			.status(400)
			.json({
				success: false,
				message: "Start date cannot be after end date.",
			});
	}
	if ((startDate && isNaN(startDate)) || (endDate && isNaN(endDate))) {
		return res
			.status(400)
			.json({ success: false, message: "Invalid date format." });
	}
	if (startDate && !endDate) {
		endDate = new Date();
	}
	if (!startDate && endDate) {
		startDate = new Date("1970-01-01");
	}
	startDate.setHours(0, 0, 0, 0);
	endDate.setHours(23, 59, 59, 999);
	try {
		const result = await pool.query(
			`
			SELECT 
				o.order_id,
				o.customer_id,
				o.order_date,
				o.handler_id,
				o.order_status,
				o.discount_id,
				d.discount_type,
				d.amount AS discount_amount,
				SUM(os.total_price) AS total_order_price
			FROM orders o
			LEFT JOIN order_service os ON o.order_id = os.order_id
			LEFT JOIN discounts d ON o.discount_id = d.discount_id
			WHERE o.is_deleted = FALSE AND o.order_date BETWEEN $1 AND $2
			GROUP BY o.order_id, o.customer_id, o.order_date, o.handler_id, o.order_status, o.discount_id, d.discount_type, d.amount
			ORDER BY o.order_date DESC;
		`,
			[startDate, endDate]
		);
		res.status(200).json({ success: true, data: result.rows });
	} catch (err) {
		res.status(500).json({ error: "Failed to fetch orders" });
	}
};

export const getOrderDetailsById = async (req, res) => {
	const { id } = req.params;
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		const orderResult = await client.query(
			`SELECT
				o.order_id,
				o.customer_id,
				o.order_date,
				o.handler_id,
				o.order_status,
				o.discount_id,
				d.discount_type,
				d.amount AS discount_amount,
				SUM(os.total_price) AS total_order_price
			FROM orders o
			LEFT JOIN order_service os ON o.order_id = os.order_id
			LEFT JOIN discounts d ON o.discount_id = d.discount_id
			WHERE o.is_deleted = FALSE AND o.order_id = $1
			GROUP BY o.order_id, o.customer_id, o.order_date, o.handler_id, o.order_status, o.discount_id, d.discount_type, d.amount
			`,
			[id]
		);

		if (orderResult.rows.length === 0)
			return res.status(404).json({ error: "Order not found" });

		const servicesResult = await client.query(
			`SELECT os.service_id, s.service_name, os.number_of_unit, os.total_price AS service_total_price
			FROM order_service os
			LEFT JOIN services s ON os.service_id = s.service_id
			WHERE os.order_id = $1`,
			[id]
		);

		res.json({
			...orderResult.rows[0],
			services: servicesResult.rows,
		});
	} catch (err) {
		console.log(err);
		await client.query("ROLLBACK");
		res.status(500).json({ error: "Failed to fetch order" });
	} finally {
		client.release();
	}
};

export const createOrder = async (req, res) => {
	const { customer_id, handler_id, discount_id, services } = req.body;
	const client = await pool.connect();

	try {
		// Begin transaction
		await client.query("BEGIN");

		// 1. Check if a discount is applied
		if (discount_id) {
			// 1.1 fetch customer's points
			const customerRes = await client.query(
				`SELECT points FROM customers WHERE customer_id = $1 FOR UPDATE`,
				[customer_id]
			);
			if (customerRes.rowCount === 0) {
				throw new Error("Customer not found");
			}

			const customerPoints = customerRes.rows[0].points;

			// 1.2 fetch discount's required points
			const discountRes = await client.query(
				`SELECT required_points FROM discounts WHERE discount_id = $1 AND is_deleted = FALSE`,
				[discount_id]
			);
			if (discountRes.rowCount === 0) {
				throw new Error("Discount not found");
			}
			const requiredPoints = discountRes.rows[0].required_points;
			console.log("required points" + requiredPoints);

			// 1.3 compare
			if (customerPoints < requiredPoints) {
				throw new Error("Customer does not have enough points for discount");
			}
			// 1.4 subtract customer points
			await client.query(
				`UPDATE customers SET points = points - $1 WHERE customer_id = $2`,
				[requiredPoints, customer_id]
			);
		}
		// 2. Insert the order
		const orderRes = await client.query(
			`INSERT INTO orders (customer_id, handler_id, discount_id)
			VALUES ($1, $2, $3)
			RETURNING order_id, customer_id, order_date, handler_id, order_status, discount_id`,
			[customer_id, handler_id, discount_id || null]
		);

		const order_id = orderRes.rows[0].order_id;

		// 3. Insert each service into order_service table
		for (const svc of services) {
			// 3.1 Check if service exists
			const serviceRes = await client.query(
				`SELECT 1 FROM services WHERE service_id = $1 AND is_deleted = FALSE`,
				[svc.service_id]
			);

			// 3.2 If service does not exist, throw error
			if (serviceRes.rowCount === 0) {
				throw new Error(`Service with ID ${svc.service_id} does not exist`);
			}

			// 3.3 Insert service into order_service
			await client.query(
				`INSERT INTO order_service (order_id, service_id, number_of_unit, total_price)
				SELECT $1, $2, $3, $3 * s.service_price_per_unit
				FROM services s
				WHERE s.service_id = $2`,
				[order_id, svc.service_id, svc.number_of_unit]
			);
		}

		// Commit transaction
		await client.query("COMMIT");

		// Respond with the created order
		res.status(201).json({ message: "Order created", order: orderRes.rows[0] });
	} catch (err) {
		// Rollback transaction in case of error
		await client.query("ROLLBACK");

		// Log error for debugging purposes
		console.error("Error creating order:", err);

		// Return error response
		res
			.status(500)
			.json({ error: "Failed to create order", details: err.message });
	} finally {
		// Release the database client
		client.release();
	}
};

export const updateOrderStatus = async (req, res) => {
	const { id } = req.params;
	const { order_status } = req.body;
	const user_role = req.user?.user_role;
	try {
		// 1. Check if order exists and is not deleted
		const pastStatus = await pool.query(
			`SELECT order_status FROM orders WHERE order_id = $1 AND is_deleted = FALSE`,
			[id]
		)

		if (pastStatus.rows.length === 0) {
			return res.status(404).json({ error: "Order not found or already deleted" });
		}

		// 2. Check if order is already closed and allow admin bypass
		if (
			user_role !== "admin" &&
			(pastStatus.rows[0].order_status === "completed" || pastStatus.rows[0].order_status === "cancelled")
		) {
			return res.status(401).json({ success: false, message: "Unauthorized to change order status, order is already closed" });
		}

		// 3. Update order
		const result = await pool.query(
			`UPDATE orders SET
				order_status = $1
			WHERE order_id = $2
			RETURNING order_id, order_status`,
			[order_status, id]
		);
	
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Order not found" });
		}
	
		res.json({ message: "Order status updated", order: result.rows[0] });
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ error: "Failed to update order status" });
	}
}


export const updateOrderByID = async (req, res) => {
	try {
		const { id } = req.params;
		const { order_status, handler_id, discount_id } = req.body;
		let fields = [];
		let values = [];
		let idx = 1;
		
		if (order_status) {
			fields.push(`order_status = $${idx++}`);
			values.push(order_status);
		}
		if (handler_id) {
			fields.push(`handler_id = $${idx++}`);
			values.push(handler_id);
		}
		if (discount_id !== undefined) {  // Allow null to reset discount
			fields.push(`discount_id = $${idx++}`);
			values.push(discount_id);
		}

		if (fields.length === 0) {
			return res.status(400).json({ error: "No fields to update" });
		}

		values.push(id);

		const sql = `
			UPDATE orders
			SET ${fields.join(", ")}
			WHERE order_id = $${idx} AND is_deleted = FALSE
			RETURNING order_id, customer_id, order_date, handler_id, order_status, discount_id
		`;

		const result = await pool.query(sql, values);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Order not found or is deleted" });
		}

		return res.status(200).json({ message: "Order updated", order: result.rows[0] });
	} catch (err) {
		console.error(err.message);
		return res.status(500).json({ error: "Failed to update order" });
	}
};

export const deleteOrder = async (req, res) => {
	const { id } = req.params;
	try {
		const result = await pool.query(
			`UPDATE orders SET is_deleted = TRUE WHERE order_id = $1 AND is_deleted = FALSE RETURNING 1`,
			[id]
		);
		if (result.rows.length === 0)
			return res.status(404).json({ error: "Order not found or is already deleted" });

		res.json({ message: "Order deleted" });
	} catch (err) {
		res.status(500).json({ error: "Failed to delete order" });
	}
};

export const addServiceToOrder = async (req, res) => {
	const { order_id } = req.params;
	const { number_of_unit, service_id } = req.body;
	const client = await pool.connect();
	const user_role = req.user?.user_role;
	const user_id = req.user?.user_id;
	try {
		await client.query("BEGIN");
		// 1. Check if order exists or is deleted
		const orderResult = await client.query(
			`SELECT order_status, handler_id FROM orders WHERE order_id = $1 AND is_deleted = FALSE`,
			[order_id]
		);

		if (orderResult.rows.length === 0) {
			await client.query("ROLLBACK");
			return res.status(404).json({ error: "Order is either deleted or not found" });
		}

		// 2. Check if handler is the same as user
		if (orderResult.rows[0].handler_id !== user_id && user_role !== "admin") {
			await client.query("ROLLBACK");
			return res.status(403).json({ error: "Unauthorized to add service to order" });
		}
		// 3. Check if order is completed or cancelled
		const orderStatus = orderResult.rows[0].order_status;
		if (orderStatus === "completed" || orderStatus === "cancelled") {
			await client.query("ROLLBACK");
			return res.status(400).json({ error: "Order is already completed or cancelled! Cannot add more services" });
		}

		// 4. Check if service exists or is deleted
		const serviceResult = await client.query(
			`SELECT service_price_per_unit FROM services WHERE service_id = $1 AND is_deleted = FALSE`,
			[service_id]
		)

		if (serviceResult.rows.length === 0) {
			await client.query("ROLLBACK");
			return res.status(404).json({ error: "Service is either deleted or not found" });
		}

		// 5. Check if service is a duplicate in the order
		const orderServiceResult = await client.query(
			`SELECT service_id FROM order_service WHERE order_id = $1 AND service_id = $2`,
			[order_id, service_id]
		);

		if (orderServiceResult.rows.length > 0) {
			await client.query("ROLLBACK");
			return res.status(409).json({ error: "Service is already added to order" });
		}
		
		// 6. Add service
		await client.query(
			`INSERT INTO order_service (order_id, service_id, number_of_unit, total_price)
				VALUES ($1, $2, $3, $4)`,
			[order_id, service_id, number_of_unit, number_of_unit * serviceResult.rows[0].service_price_per_unit]
		);

		await client.query("COMMIT");
		res.status(201).json({ message: "Service added to order" });
	} catch (err) {
		await client.query("ROLLBACK");
		console.log(err)
		res.status(500).json({ error: "Failed to add service to order" });
	} finally {
		client.release();
	}
};

export const updateOrderService = async (req, res) => {
	const { order_id, service_id } = req.params;
	const { number_of_unit } = req.body;
	const user_role = req.user?.user_role;
	const user_id = req.user?.user_id;
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		// 1. Check if order exists or is deleted
		const orderResult = await client.query(
			`SELECT order_status, handler_id FROM orders WHERE order_id = $1 AND is_deleted = FALSE`,
			[order_id]
		);
		if (orderResult.rows.length === 0) {
			await client.query("ROLLBACK");
			return res.status(404).json({ error: "Order is either deleted or not found" });
		}

		// 2. Check if handler is the same as user
		if (orderResult.rows[0].handler_id !== user_id && user_role !== "admin") {
			await client.query("ROLLBACK");
			return res.status(403).json({ error: "Unauthorized to update service in order" });
		}

		// 3. Check if order is completed or cancelled
		const orderStatus = orderResult.rows[0].order_status;
		if (orderStatus === "completed" || orderStatus === "cancelled") {
			await client.query("ROLLBACK");
			return res.status(400).json({ error: "Order is already completed or cancelled! Cannot update services" });
		}

		// 4. Check if service exists in the order
		const serviceResult = await client.query(
			`SELECT number_of_unit, total_price FROM order_service WHERE order_id = $1 AND service_id = $2`,
			[order_id, service_id]
		)
		if (serviceResult.rows.length === 0) {
			await client.query("ROLLBACK");
			return res.status(404).json({ error: "Service not found in order" });
		}

		// 5. Update service detail
		const historical_price_per_unit = serviceResult.rows[0].total_price / serviceResult.rows[0].number_of_unit;
		await client.query(
			`UPDATE order_service
			SET number_of_unit = $1, total_price = CAST($1 AS INTEGER) * CAST($2 AS INTEGER)
			WHERE order_id = $3 AND service_id = $4`,
			[number_of_unit, historical_price_per_unit, order_id, service_id]
		);

		await client.query("COMMIT");
		res.json({ message: "Service quantity updated" });
	} catch (err) {
		await client.query("ROLLBACK");
		console.log(err)
		res.status(500).json({ error: "Failed to update service in order" });
	} finally {
		client.release();
	}
};

export const removeServiceFromOrder = async (req, res) => {
	const { order_id, service_id } = req.params;
	const user_role = req.user?.user_role;
	const user_id = req.user?.user_id;
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		// 1. Check if order exists or is already deleted
		const orderResult = await client.query(
			`SELECT order_status, handler_id FROM orders WHERE order_id = $1 AND is_deleted = FALSE`,
			[order_id]
		);
		if (orderResult.rows.length === 0) {
			await client.query("ROLLBACK");
			return res.status(404).json({ error: "Order is either deleted or not found" });
		}

		// 2. Check if handler is the same as user
		if (orderResult.rows[0].handler_id !== user_id && user_role !== "admin") {
			await client.query("ROLLBACK");
			return res.status(403).json({ error: "Unauthorized to remove service from order" });
		}

		// 3. Check if order is completed or cancelled
		const orderStatus = orderResult.rows[0].order_status;
		if (orderStatus === "completed" || orderStatus === "cancelled") {
			await client.query("ROLLBACK");
			return res.status(400).json({ error: "Order is already completed or cancelled! Cannot remove services" });
		}

		// 4. Check if service exists in the order
		const serviceResult = await client.query(
			`SELECT service_id FROM order_service WHERE order_id = $1 AND service_id = $2`,
			[order_id, service_id]
		)
		if (serviceResult.rows.length === 0) {
			await client.query("ROLLBACK");
			return res.status(404).json({ error: "Service not found in order" });
		}

		// 5. Remove service
		await client.query(
			`DELETE FROM order_service WHERE order_id = $1 AND service_id = $2`,
			[order_id, service_id]
		);

		await client.query("COMMIT");
		res.json({ message: "Service removed from order" });
	} catch (err) {
		await client.query("ROLLBACK");
		res.status(500).json({ error: "Failed to remove service from order" });
	} finally {
		client.release();
	}
};
