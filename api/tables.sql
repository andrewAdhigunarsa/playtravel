
CREATE TABLE countries (
  code INT GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(30),
  continent_name VARCHAR(30),
  PRIMARY KEY(code)
);

CREATE TABLE users (
  ID SERIAL PRIMARY KEY,
  full_name VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  code INT,
  CONSTRAINT country_code
    FOREIGN KEY(code)
  	  REFERENCES countries(code),
  password VARCHAR(30),
  email VARCHAR(50)
);

INSERT INTO countries (name, continent_name)
  VALUES ('Indonesia', 'Asia'), ('Kenya', 'Africa');

INSERT INTO users (full_name, code, password, email)
  VALUES ('Helly Jerry', '1', 'password', 'jerry@example.com'), ('Bolly Woody', '2', 'password', 'bolly@example.com');


