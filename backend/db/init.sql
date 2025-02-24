
CREATE TABLE PropertyDetails (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Address NVARCHAR(255),
    Eircode NVARCHAR(10),
    Bed INT,
    Bath INT,
    Size FLOAT,
    Link NVARCHAR(255)
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