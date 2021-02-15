CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(50),
  created_at TIMESTAMP,
  CONSTRAINT country_code
        FOREIGN KEY(code)
  	  REFERENCES countries(code),
  password VARCHAR(30),
  email VARCHAR(50),
);

CREATE TABLE countries (
  code SERIAL PRIMARY KEY,
  name VARCHAR(30),
  continent_name VARCHAR(30),
);
