CREATE DATABASE reviews_db;

CREATE TABLE IF NOT EXISTS reviews(
    id SERIAL PRIMARY KEY,
    song VARCHAR(25),
    review VARCHAR(1000),
    review_date VARCHAR(50)
);