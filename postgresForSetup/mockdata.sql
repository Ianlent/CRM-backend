-- Mock Data Inserts for Enhanced Schema

-- 1. Customers
INSERT INTO customers (first_name, last_name, phone_number, address, points) VALUES
  ('Alice',   'Nguyen', '+84901234567', '123 Le Loi, District 1, HCM', 10),
  ('Bob',     'Tran',   '+84906543210', '456 Tran Hung Dao, District 5, HCM', 20),
  ('Charlie', 'Le',     '+84909876543', '789 Nguyen Trai, District 3, HCM',  0),
  ('Dana',    'Pham',   '+84901112233', '321 Hai Ba Trung, District 1, HCM',  5),
  ('Evan',    'Hoang',  '+84909998877', '654 Vo Van Tan, District 3, HCM', 15);

-- 2. Users
INSERT INTO users (username, user_role, phone_number, password_hash) VALUES
  ('admin01',    'admin',    '+84901230000', 'hashed_pw_admin'),
  ('manager01',  'manager',  '+84901230001', 'hashed_pw_manager'),
  ('employee01', 'employee', '+84901230002', 'hashed_pw_employee');

-- 3. Services
INSERT INTO services (service_description, service_unit, service_price_per_unit) VALUES
  ('Washing',           'kg', 30),      -- Washing service per kilogram
  ('Drying',            'kg', 20),      -- Drying service per kilogram
  ('Ironing',           'item', 10),    -- Ironing service per item
  ('Laundry Pickup',    'order', 50),   -- Pickup service per order
  ('Laundry Delivery',  'order', 50),   -- Delivery service per order
  ('Express Washing',   'kg', 50),      -- Express service for faster washing
  ('Stain Removal',     'item', 15); 

-- 4. Discounts
INSERT INTO discounts (required_points, discount_type, amount) VALUES
  (10, 'percent', 10),   -- 10% off for 10 points
  (20, 'fixed',   30);   -- $30 off for 20 points

-- 5. Orders
-- Note: handler_id refers to users.employee01 = user_id 3, manager01 = 2
INSERT INTO orders (customer_id, order_date, handler_id, order_status, discount_id) VALUES
  (1, '2025-04-01 09:15:00', 3, 'completed', 1),
  (2, '2025-04-01 10:30:00', 3, 'completed', NULL),
  (3, '2025-04-02 14:00:00', 3, 'pending',   2),
  (4, '2025-04-03 11:45:00', 3, 'confirmed', NULL),
  (5, '2025-04-04 16:20:00', 2, 'completed', 1);

-- 6. Order_Service line items
INSERT INTO order_service (order_id, service_id, number_of_unit) VALUES
  -- Order 1: Alice bought 2 hours Cleaning + 1 Repair job
  ((SELECT order_id FROM orders WHERE customer_id = 1 AND order_date = '2025-04-01 09:15:00'), 1, 2),
  ((SELECT order_id FROM orders WHERE customer_id = 1 AND order_date = '2025-04-01 09:15:00'), 2, 1),

  -- Order 2: Bob bought 5 Repair jobs
  ((SELECT order_id FROM orders WHERE customer_id = 2 AND order_date = '2025-04-01 10:30:00'), 2, 5),

  -- Order 3: Charlie booked 1 Consultation session
  ((SELECT order_id FROM orders WHERE customer_id = 3 AND order_date = '2025-04-02 14:00:00'), 3, 1),

  -- Order 4: Dana purchased 3 Installation units
  ((SELECT order_id FROM orders WHERE customer_id = 4 AND order_date = '2025-04-03 11:45:00'), 4, 3),

  -- Order 5: Evan 4 Cleaning hours + 2 Consultation sessions
  ((SELECT order_id FROM orders WHERE customer_id = 5 AND order_date = '2025-04-04 16:20:00'), 1, 4),
  ((SELECT order_id FROM orders WHERE customer_id = 5 AND order_date = '2025-04-04 16:20:00'), 3, 2);

-- 7. Expenses
INSERT INTO expenses (amount, expense_date, expense_description) VALUES
  (200, '2025-04-01 08:00:00', 'Office supplies'),
  (500, '2025-04-02 12:30:00', 'Utility bills'),
  (300, '2025-04-03 09:45:00', 'Marketing campaign setup');

