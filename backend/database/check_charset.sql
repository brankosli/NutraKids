-- Check your MySQL connection and database charset settings

-- 1. Check current database charset
SELECT @@character_set_database, @@collation_database;

-- 2. Check connection charset
SELECT @@character_set_connection, @@collation_connection;

-- 3. Check server charset
SELECT @@character_set_server, @@collation_server;

-- 4. View foods table structure
DESCRIBE foods;

-- 5. View foods table creation statement
SHOW CREATE TABLE foods\G

-- If any show "utf8" instead of "utf8mb4", they need to be updated
-- Run the fix_emoji_encoding.sql file to convert everything
