-- Initialize all databases
CREATE DATABASE user_service;
CREATE DATABASE content_service;
CREATE DATABASE media_service;
CREATE DATABASE category_service;
CREATE DATABASE comment_service;

-- Create users for each service
CREATE USER user_service WITH PASSWORD 'user_password';
CREATE USER content_service WITH PASSWORD 'content_password';
CREATE USER media_service WITH PASSWORD 'media_password';
CREATE USER category_service WITH PASSWORD 'category_password';
CREATE USER comment_service WITH PASSWORD 'comment_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE user_service TO user_service;
GRANT ALL PRIVILEGES ON DATABASE content_service TO content_service;
GRANT ALL PRIVILEGES ON DATABASE media_service TO media_service;
GRANT ALL PRIVILEGES ON DATABASE category_service TO category_service;
GRANT ALL PRIVILEGES ON DATABASE comment_service TO comment_service;
