-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enum for user roles
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM ('admin', 'manager', 'employee');
    END IF;
END $$;

-- Enum for discount type
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discount_type_enum') THEN
        CREATE TYPE discount_type_enum AS ENUM ('percent', 'fixed');
    END IF;
END $$;

-- Customers
CREATE TABLE customers (
    customer_id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    user_address VARCHAR(100) NOT NULL,
    points INT DEFAULT 0 CHECK (points >= 0)
);

-- Users
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    user_role user_role_enum NOT NULL,
    phone_number VARCHAR(20),
    password_hash VARCHAR(100) NOT NULL
);

-- Services
CREATE TABLE services (
    service_id BIGSERIAL PRIMARY KEY,
    service_description VARCHAR(30) NOT NULL,
    service_unit VARCHAR(20) NOT NULL,
    service_price_per_unit INT NOT NULL CHECK (service_price_per_unit > 0)
);

-- Discounts
CREATE TABLE discounts (
    discount_id BIGSERIAL PRIMARY KEY,
    required_points INT NOT NULL CHECK (required_points >= 0),
    discount_type discount_type_enum NOT NULL,
    amount INT NOT NULL CHECK (amount > 0)
);

-- Orders
CREATE TABLE orders (
    order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id BIGINT,
    order_date TIMESTAMP NOT NULL,
    handler_id BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    discount_id BIGINT,
    CONSTRAINT fk_customer FOREIGN KEY (customer_id)
        REFERENCES customers (customer_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_handler FOREIGN KEY (handler_id)
        REFERENCES users (user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_discount FOREIGN KEY (discount_id)
        REFERENCES discounts (discount_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Order_Service (join table)
CREATE TABLE order_service (
    order_id UUID NOT NULL,
    service_id BIGINT,
    number_of_unit INT NOT NULL CHECK (number_of_unit > 0),
    PRIMARY KEY (order_id, service_id),
    CONSTRAINT fk_order FOREIGN KEY (order_id)
        REFERENCES orders (order_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_service FOREIGN KEY (service_id)
        REFERENCES services (service_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Expenses
CREATE TABLE expenses (
    expense_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount INT NOT NULL CHECK (amount > 0),
    is_deleted BOOLEAN DEFAULT FALSE,
    expense_date TIMESTAMP NOT NULL,
    expense_description VARCHAR(50)
);


--Mock data
-- INSERT INTO customers (first_name, last_name, phone_number, user_address, points) VALUES
-- 	('John', 'Doe', '1234567890', '123 Main St, City', 0),
-- 	('Jane', 'Smith', '9876543210', '456 Elm St, Town', 0),
-- 	('Bob', 'Johnson', '5555555555', '789 Oak St, Village', 0),
-- 	('Alice', 'Williams', '1111111111', '321 Pine St, County', 0),
-- 	('Charlie', 'Brown', '2222222222', '654 Cedar St, State', 0);

-- INSERT INTO users (username, user_role, phone_number, password_hash) VALUES
-- 	('admin', 'admin', '1234567890', 'hashed_password_admin'),
-- 	('manager', 'manager', '9876543210', 'hashed_password_manager'),
-- 	('employee', 'employee', '5555555555', 'hashed_password_employee');

-- INSERT INTO services (service_description, service_unit, service_price_per_unit) VALUES
-- 	('Service 1', 'unit', 10),
-- 	('Service 2', 'unit', 20),
-- 	('Service 3', 'unit', 30),
-- 	('Service 4', 'unit', 40),
-- 	('Service 5', 'unit', 50);

-- INSERT INTO discounts (required_points, discount_type, amount) VALUES
-- 	(100, 'percent', 10),
-- 	(200, 'fixed', 20),
-- 	(300, 'percent', 30),
-- 	(400, 'fixed', 40),
-- 	(500, 'percent', 50);

-- INSERT INTO orders (customer_id, order_date, handler_id, discount_id) VALUES
-- 	(1, '2023-08-01', 1, 1),
-- 	(2, '2023-08-02', 2, 2),
-- 	(3, '2023-08-03', 3, 3),
-- 	(4, '2023-08-04', 1, 4),
-- 	(5, '2023-08-05', 2, 5);

-- INSERT INTO order_service (order_id, service_id, number_of_unit) VALUES
-- 	('572a7854-7b8d-47ed-b81a-bd7c79243d40', 1, 2),
-- 	('572a7854-7b8d-47ed-b81a-bd7c79243d40', 2, 3),
-- 	('572a7854-7b8d-47ed-b81a-bd7c79243d40', 3, 1),
-- 	('572a7854-7b8d-47ed-b81a-bd7c79243d40', 4, 2),
-- 	('572a7854-7b8d-47ed-b81a-bd7c79243d40', 5, 1),
-- 	('41ac5f4b-a4dc-405d-9f25-4878050d919a', 1, 2),
-- 	('41ac5f4b-a4dc-405d-9f25-4878050d919a', 2, 3),
-- 	('41ac5f4b-a4dc-405d-9f25-4878050d919a', 3, 1),
-- 	('41ac5f4b-a4dc-405d-9f25-4878050d919a', 4, 2),
-- 	('41ac5f4b-a4dc-405d-9f25-4878050d919a', 5, 1),
-- 	('0b223b1a-68f8-4805-99e3-7f8b6ec75550', 1, 2),
-- 	('0b223b1a-68f8-4805-99e3-7f8b6ec75550', 2, 3),
-- 	('0b223b1a-68f8-4805-99e3-7f8b6ec75550', 3, 1),
-- 	('0b223b1a-68f8-4805-99e3-7f8b6ec75550', 4, 2),
-- 	('0b223b1a-68f8-4805-99e3-7f8b6ec75550', 5, 1),
-- 	('7ad5d9ee-b656-4b05-85a6-8a80992160f2', 1, 2),
-- 	('7ad5d9ee-b656-4b05-85a6-8a80992160f2', 2, 3),
-- 	('7ad5d9ee-b656-4b05-85a6-8a80992160f2', 3, 1),
-- 	('7ad5d9ee-b656-4b05-85a6-8a80992160f2', 4, 2),
-- 	('7ad5d9ee-b656-4b05-85a6-8a80992160f2', 5, 1),
-- 	('0761fa3d-ab2e-4ce7-956a-85f062afebcf', 1, 2),
-- 	('0761fa3d-ab2e-4ce7-956a-85f062afebcf', 2, 3),
-- 	('0761fa3d-ab2e-4ce7-956a-85f062afebcf', 3, 1),
-- 	('0761fa3d-ab2e-4ce7-956a-85f062afebcf', 4, 2),
-- 	('0761fa3d-ab2e-4ce7-956a-85f062afebcf', 5, 1);

-- INSERT INTO expenses (amount, expense_date, expense_description) VALUES
-- 	(100, '2023-08-01', 'Expense 1'),
-- 	(200, '2023-08-02', 'Expense 2'),
-- 	(300, '2023-08-03', 'Expense 3'),
-- 	(400, '2023-08-04', 'Expense 4'),
-- 	(500, '2023-08-05', 'Expense 5');

