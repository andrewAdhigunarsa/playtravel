### postgresql setup

```
brew install postgresql
```


```
brew services start postgresql
==> Successfully started `postgresql` (label: homebrew.mxcl.postgresql)
```

```
postgres=# \conninfo
You are connected to database "postgres" as user "your_username" via socket in "/tmp" at port "5432".
```

create new postgres role

```
postgres=# CREATE ROLE me WITH LOGIN PASSWORD 'password';
```

enable the new role to create Database
```
postgres=# ALTER ROLE me CREATEDB;

```


to view list of all roles

```
postgres=# \du

me          | Create DB                           | {}
postgres    | Superuser, Create role, Create DB   | {}
```

quit and connect to the new created role

```
postgres=# \q

psql -d postgres -U me
```


create new database called api and connect to it 

```
CREATE DATABASE api;

postgres=> \c api
You are now connected to database "api" as user "me".
api=>
```

create the tables


```
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
     FOREIGN KEY(ID)
  	  REFERENCES countries(ID),
  password VARCHAR(30),
  email VARCHAR(50)
);
```

populate tables with data

```
INSERT INTO countries (name, continent_name)
  VALUES ('Indonesia', 'Asia'), ('Kenya', 'Africa');

INSERT INTO users (full_name, code, password, email)
  VALUES ('Helly Jerry', '1', 'password', 'jerry@example.com'), ('Bolly Woody', '2', 'password', 'bolly@example.com');

```

install postgraphile globally

```
npm install -g postgraphile
```

run postgraphile

```
npx postgraphile -c postgres://andrewadhigunarsa:password@localhost:5432/api --watch --enhance-graphiql --dynamic-json
```


create data type for the jwt

```
CREATE TYPE public.jwt_token AS (
  role TEXT,
  user_id INTEGER,
  name TEXT
);
```

create role 

```
-- For guest users\du
--
CREATE ROLE anonymous;
GRANT anonymous TO current_user;
-- For logged users
--
CREATE ROLE registered_user;
GRANT registered_user TO current_user;

```

Functions
In order yo allow the users create an account we will define the SIGNUP function.
But before the extension “pgcrypto” must me installed in the database. This extension will allow to us to obfuscate the passwords.

```
create extension if not exists "pgcrypto";
```

create SIGNUP function

```
CREATE FUNCTION REGISTER(username VARCHAR(50), country_code INT, email TEXT, password TEXT) RETURNS jwt_token AS
$$
DECLARE
        token_information jwt_token;
BEGIN      
        INSERT INTO users (full_name, code, email, password) VALUES ($1, $2, $3, crypt($4, gen_salt('bf', 8)));
        
        SELECT 'registered_user', id, full_name
               INTO token_information
               FROM users
               WHERE users.email = $3;
        RETURN token_information::jwt_token;
END;
$$ LANGUAGE PLPGSQL VOLATILE SECURITY DEFINER;
-- grant permissions to be able to sign up
--
GRANT EXECUTE ON FUNCTION REGISTER(username VARCHAR(50), country_code INT, email TEXT, password TEXT) TO anonymous;
```

create LOGIN function

```
CREATE FUNCTION LOGIN(email TEXT, password TEXT) RETURNS jwt_token AS
$$
DECLARE
        token_information jwt_token;
BEGIN
        SELECT 'registered_user', id, full_name
               INTO token_information
               FROM users
               WHERE users.email = $1
                     AND users.password = crypt($2, users.password);
       RETURN token_information::jwt_token;
end;
$$ LANGUAGE PLPGSQL VOLATILE STRICT SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION LOGIN(email TEXT, password TEXT) TO anonymous;
```

restart postgraphile

```
npx postgraphile -n 0.0.0.0 \
--watch \
-c postgres://andrewadhigunarsa:password@localhost:5432/api?ssl=0 \
--jwt-token-identifier public.jwt_token \
--jwt-secret superSecretRandom \
--default-role anonymous \
--show-error-stack
--cors
```

note: (flag explanation)
- watch: the GraphQL API also updates by himself without reload the server every time the schema changes
- jwt-token-identifier: The data type of the JWT token we created before
- jwt-secret: A string which represents the JWT secret. It’s up to you to select one
- default-role: The default role for users when no JWT token is provided, this is the case of the guest users (anonymous)
- show-error-stack: Used to have better debugging in the console

temp example token
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicmVnaXN0ZXJlZF91c2VyIiwidXNlcl9pZCI6NSwibmFtZSI6Ikpob25hIiwiaWF0IjoxNjEzMzk1MTkxLCJleHAiOjE2MTM0ODE1OTEsImF1ZCI6InBvc3RncmFwaGlsZSIsImlzcyI6InBvc3RncmFwaGlsZSJ9.oaFsiwPK_79joXyG_INZ0J0f0Np_pw8mCdlDXI1vZNQ'


grant permission to roles

```
GRANT SELECT ON countries TO registered_user;
GRANT SELECT(code) ON countries TO registered_user;
GRANT SELECT(name) ON countries TO registered_user;
GRANT SELECT(continent_name) ON countries TO registered_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON countries TO registered_user;
GRANT USAGE, SELECT ON SEQUENCE countries_code_seq TO registered_user;
GRANT SELECT(id) ON users TO registered_user;
GRANT SELECT(full_name) ON users TO registered_user;
```

enable the “row level security” of PostgreSQL, create this function called “current_user_id”. This function just returns null if no user id is given and otherwise returns the id of the user.
 
 ```
CREATE FUNCTION current_user_id() RETURNS INTEGER AS $$
  SELECT NULLIF(current_setting('jwt.claims.user_id', TRUE), '')::INTEGER;
$$ LANGUAGE SQL STABLE;
GRANT EXECUTE ON FUNCTION current_user_id() TO anonymous;
GRANT EXECUTE ON FUNCTION current_user_id() TO registered_user;
```

```
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

```

using the bearer token generated get current user id

```
headers
{
"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicmVnaXN0ZXJlZF91c2VyIiwidXNlcl9pZCI6NSwibmFtZSI6Ikpob25hIiwiaWF0IjoxNjEzMzk1MTkxLCJleHAiOjE2MTM0ODE1OTEsImF1ZCI6InBvc3RncmFwaGlsZSIsImlzcyI6InBvc3RncmFwaGlsZSJ9.oaFsiwPK_79joXyG_INZ0J0f0Np_pw8mCdlDXI1vZNQ"
}

query{
  currentUserId
}
```

username: test
email: test@example.com

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicmVnaXN0ZXJlZF91c2VyIiwidXNlcl9pZCI6NiwibmFtZSI6InRlc3QiLCJpYXQiOjE2MTM0MTY5MTYsImV4cCI6MTYxMzUwMzMxNiwiYXVkIjoicG9zdGdyYXBoaWxlIiwiaXNzIjoicG9zdGdyYXBoaWxlIn0.bc78c3XlCTBOTdbQjUZBSHkGJ5HJhHG9yLMpnIgADdA
