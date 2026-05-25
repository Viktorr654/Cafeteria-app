-- Cafeteria App Database Script
-- Run this file to set up the database from scratch

CREATE DATABASE IF NOT EXISTS cafeteria;
USE cafeteria;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50)  NOT NULL UNIQUE,
  email    VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role     ENUM('customer', 'staff') NOT NULL DEFAULT 'customer'
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  category    VARCHAR(50)   NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  description TEXT,
  available   BOOLEAN       NOT NULL DEFAULT TRUE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT           NOT NULL,
  order_date  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status      ENUM('pending','preparing','ready','completed','cancelled') NOT NULL DEFAULT 'pending',
  total_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  order_id     INT           NOT NULL,
  menu_item_id INT           NOT NULL,
  quantity     INT           NOT NULL,
  price        DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id)     REFERENCES orders(id),
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- Sample menu items so the app is not empty
INSERT INTO menu_items (name, category, price, description) VALUES
('Chicken Burger',    'Main',    5.99, 'Crispy chicken with lettuce and mayo'),
('Caesar Salad',      'Salad',   4.49, 'Romaine lettuce with caesar dressing and croutons'),
('Margherita Slice',  'Main',    3.99, 'Classic tomato and mozzarella pizza'),
('Tomato Soup',       'Soup',    2.99, 'Homemade tomato soup served with bread'),
('Chocolate Brownie', 'Dessert', 2.49, 'Warm chocolate brownie with a soft center'),
('Orange Juice',      'Drinks',  1.99, 'Freshly squeezed orange juice');