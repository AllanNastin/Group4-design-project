import datetime
import json
import os
import requests
from bs4 import BeautifulSoup
import re
import mysql.connector
from dotenv import load_dotenv

create_property_table_query = """
    CREATE TABLE PropertyDetails (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        Address NVARCHAR(255),
        Eircode NVARCHAR(10),
        Bed INT,
        Bath INT,
        Size FLOAT,
        Link NVARCHAR(255)
    );
    """
create_price_table_query = """
    CREATE TABLE PropertyPriceHistory (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        PropertyId INT,
        Price FLOAT,
        Timestamp DATETIME,
        FOREIGN KEY (PropertyId) REFERENCES PropertyDetails(Id)
    );
    """

def convert_price(price_str):
    if price_str == 'N/A':
        return -1.0
    else:
        cleaned_price = re.sub(r'[^\d.]', '', price_str)

        try:
            return float(cleaned_price)
        except ValueError:
            return -1.0

def get_property_listings(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    }
    toReturn = []
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print("Failed to retrieve the webpage")
        print(f"Status code: {response.status_code}")
        return []
    
    soup = BeautifulSoup(response.content, 'html.parser')
    listings = soup.find('ul', attrs={'data-testid':'results'})
    if not listings:
        print("No listings found")
        return []

    for listing in listings.find_all('li'):
        # Get link from the listing
        link = listing.find('a')['href']
        # Extract address, price, bed, bath, and size from HTML
        address_div = listing.find('div', {'data-tracking': 'srp_address'})
        address = address_div.get_text() if address_div else 'N/A'
        price_div = listing.find('div', {'data-tracking':"srp_price"})
        price = price_div.get_text() if price_div else 'N/A'
        # Extract meta text from HTML
        meta_div = listing.find('div', {'data-tracking':"srp_meta"})
        meta_text = meta_div.get_text() if meta_div else 'N/A'

        img_divs = listing.find_all('img', {'alt': address})
        imgs = []
        for img_div in img_divs:
            imgs.append(img_div['src'])

        # Extract bed, bath, and size from meta_text
        bed_match = re.search(r'(\d+)\s*Bed', meta_text)
        bath_match = re.search(r'(\d+)\s*Bath', meta_text)
        size_match = re.search(r'(\d+)\s*m²', meta_text)

        # Extract eircode from address
        eircode_match = re.search(r'([AC-FHKNPRTV-Y]{1}[0-9]{2}|D6W)[ ]?[0-9AC-FHKNPRTV-Y]{4}', address)
        eircode = eircode_match.group(0) if eircode_match else 'N/A'

        bed = int(bed_match.group(1)) if bed_match else None
        bath = int(bath_match.group(1)) if bath_match else None
        size = int(size_match.group(1)) if size_match else None

        toReturn.append({
            'address': address,
            'eircode': eircode,
            'price': price,
            'bed': bed,
            'bath': bath,
            'size': size,
            'link': link,
            'images': imgs
        })
    return toReturn

def daftScrapper():
    load_dotenv()
    try:
        conn = mysql.connector.connect(
            host=os.getenv('MYSQL_Host'),
            port=os.getenv('MYSQL_Port'),
            user=os.getenv('MYSQL_User'),
            password=os.getenv('MYSQL_Password'),
            database=os.getenv('MYSQL_Database')
        )

        with conn.cursor() as cursor:
            for page in range(0,12650,20):#range(0,12650, 20):
                url = 'https://www.daft.ie/property-for-sale/ireland?from='+ str(page) +'&pageSize=20'
                listings = get_property_listings(url)
                for listing in listings:

                    cursor.execute("""
                    INSERT INTO PropertyDetails (Address, Eircode, Bed, Bath, Size, Link)
                                    SELECT %s, %s, %s, %s, %s, %s
                                    WHERE NOT EXISTS (SELECT 1 FROM PropertyDetails WHERE Eircode = %s OR Link = %s);
                    """, (listing['address'], listing['eircode'], listing['bed'], listing['bath'],
                            listing['size'], listing['link'], listing['eircode'],listing['link']))
                    
                    conn.commit()

                    cursor.execute("""
                        SELECT Id FROM PropertyDetails WHERE Eircode = %s OR Link = %s LIMIT 1;
                    """, (listing['eircode'], listing['link']))
                    newId = cursor.fetchone()

                    if newId:
                        newId = newId[0]
                        for imgLink in listing.get('images'):
                            cursor.execute("""
                                INSERT INTO PropertyPictures (PropertyId, Link) VALUES (%s, %s);
                            """, (newId, imgLink))
                        cursor.execute("""
                                INSERT INTO PropertyPriceHistory (PropertyId, Price, Timestamp) VALUES (%s, %s, %s);
                        """,( newId, convert_price(listing['price']), datetime.datetime.now()))
                        conn.commit()
                print(f"Page {page // 20 + 1} done")
        
    except mysql.connector.Error as e:
        print(f"Error from mysql connector: {e}")
