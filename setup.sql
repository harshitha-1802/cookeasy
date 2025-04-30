CREATE DATABASE recipe_finder;

USE recipe_finder;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

SHOW TABLES;
DESCRIBE users;

CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,
    recipe_title VARCHAR(255) NOT NULL,
    recipe_image VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);