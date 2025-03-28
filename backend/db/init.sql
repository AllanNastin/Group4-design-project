
CREATE TABLE PropertyDetails (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Address NVARCHAR(255),
    Eircode NVARCHAR(10),
    Bed INT,
    Bath INT,
    Size FLOAT,
    Link NVARCHAR(255),
    ForSale BOOL -- true if for sale, false if for rent
);

CREATE TABLE PropertyPriceHistory (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    PropertyId INT,
    Price FLOAT,
    Timestamp DATETIME,
    FOREIGN KEY (PropertyId) REFERENCES PropertyDetails(Id)
);
-- pictures
CREATE TABLE PropertyPictures (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    PropertyId INT,
    Link NVARCHAR(1023),
    FOREIGN KEY (PropertyId) REFERENCES PropertyDetails(Id)
);
-- user management
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);
