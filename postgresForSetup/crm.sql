-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enum types
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM ('admin', 'manager', 'employee');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discount_type_enum') THEN
        CREATE TYPE discount_type_enum AS ENUM ('percent', 'fixed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status_enum') THEN
        CREATE TYPE user_status_enum AS ENUM ('active', 'suspended');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_enum') THEN
        CREATE TYPE order_status_enum AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
    END IF;
END $$;

-- 2. Tables with audit columns & soft-deletes

-- Customers
CREATE TABLE IF NOT EXISTS customers (
	customer_id		BIGSERIAL PRIMARY KEY,
	first_name		VARCHAR(50) NOT NULL,
	last_name		VARCHAR(50) NOT NULL,
	phone_number	VARCHAR(20),
	address 		VARCHAR(100) NOT NULL,
	points 			INT DEFAULT 0 CHECK (points >= 0),
	is_deleted 		BOOLEAN DEFAULT FALSE,
	created_at 		TIMESTAMP NOT NULL DEFAULT now(),
	updated_at 		TIMESTAMP NOT NULL DEFAULT now()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    user_id			BIGSERIAL PRIMARY KEY,
    username		VARCHAR(50) UNIQUE NOT NULL,
    user_role		user_role_enum NOT NULL,
    user_status		user_status_enum NOT NULL DEFAULT 'active',
    phone_number	VARCHAR(20),
    password_hash	VARCHAR(100) NOT NULL,
    is_deleted		BOOLEAN DEFAULT FALSE,
    created_at		TIMESTAMP NOT NULL DEFAULT now(),
    updated_at		TIMESTAMP NOT NULL DEFAULT now()
);

-- Services
CREATE TABLE IF NOT EXISTS services (
    service_id             BIGSERIAL PRIMARY KEY,
    service_description    VARCHAR(30) NOT NULL,
    service_unit           VARCHAR(20) NOT NULL,
    service_price_per_unit INT NOT NULL CHECK (service_price_per_unit > 0),
    is_deleted             BOOLEAN DEFAULT FALSE,
    created_at             TIMESTAMP NOT NULL DEFAULT now(),
    updated_at             TIMESTAMP NOT NULL DEFAULT now()
);

-- Discounts
CREATE TABLE IF NOT EXISTS discounts (
    discount_id     BIGSERIAL PRIMARY KEY,
    required_points INT NOT NULL CHECK (required_points >= 0),
    discount_type   discount_type_enum NOT NULL,
    amount          INT NOT NULL CHECK (amount > 0)
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    order_id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id   BIGINT,
    order_date    TIMESTAMP NOT NULL,
    handler_id    BIGINT,
    order_status  order_status_enum NOT NULL DEFAULT 'pending',
    is_deleted    BOOLEAN DEFAULT FALSE,
    discount_id   BIGINT,
    created_at    TIMESTAMP NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_customer FOREIGN KEY (customer_id)
        REFERENCES customers (customer_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_handler FOREIGN KEY (handler_id)
        REFERENCES users (user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_discount FOREIGN KEY (discount_id)
        REFERENCES discounts (discount_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Order_Service (join table)
CREATE TABLE IF NOT EXISTS order_service (
    order_id       UUID NOT NULL,
    service_id     BIGINT,
    number_of_unit INT NOT NULL CHECK (number_of_unit > 0),
    PRIMARY KEY (order_id, service_id),
    CONSTRAINT fk_order FOREIGN KEY (order_id)
        REFERENCES orders (order_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_service FOREIGN KEY (service_id)
        REFERENCES services (service_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
    expense_id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount               INT NOT NULL CHECK (amount > 0),
    is_deleted           BOOLEAN NOT NULL DEFAULT FALSE,
    expense_date         TIMESTAMP NOT NULL DEFAULT now(),
    expense_description  VARCHAR(50),
    created_at           TIMESTAMP NOT NULL DEFAULT now(),
    updated_at           TIMESTAMP NOT NULL DEFAULT now()
);

-- 3. Trigger function to maintain updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Attach triggers for audit
DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'trg_customers_updated'
    ) THEN
      CREATE TRIGGER trg_customers_updated
        BEFORE UPDATE ON customers
        FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated'
    ) THEN
      CREATE TRIGGER trg_users_updated
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'trg_services_updated'
    ) THEN
      CREATE TRIGGER trg_services_updated
        BEFORE UPDATE ON services
        FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'trg_orders_updated'
    ) THEN
      CREATE TRIGGER trg_orders_updated
        BEFORE UPDATE ON orders
        FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'trg_expenses_updated'
    ) THEN
      CREATE TRIGGER trg_expenses_updated
        BEFORE UPDATE ON expenses
        FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
    END IF;
END $$;

-- 5. Indexes for performance on date columns
CREATE INDEX IF NOT EXISTS idx_orders_order_date     ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);

-- 6. Indexes for performance on multiple columns
CREATE INDEX idx_customers_search_lower
  ON customers (
    lower(phone_number),
    lower(first_name),
    lower(last_name)
  );

