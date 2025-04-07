import datetime
import json
import os
import requests
from bs4 import BeautifulSoup
import re
from dotenv import load_dotenv
import mysql.connector

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
    response = None
    try:
        response = requests.get(url, headers=headers)
    except:
        print("Error fetching the page")
        return []
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
        price_div = listing.find('div', {'data-tracking':"srp_price"}) or listing.find('p', {'class': 'sc-99fd5e84-0 klPmTo'})
        price = price_div.get_text() if price_div else 'N/A'

        meta_div = listing.find('div', {'data-tracking':"srp_meta"}) or listing.find('div', {'class': 'sc-5d364562-1 kzXTWf'})
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

def get_eircode_from_address(address, eircode_data):
    """
    Attempts to find an Eircode based on keywords in the address.
    """
    if address == 'N/A' or address is None:
        return 'N/A'
    address_lower = address.lower()
    for location, eircode in eircode_data.items():
        if location.lower() in address_lower:
            return eircode
    return 'N/A'

def update_eircodes():
    print("Starting update_eircodes")
    load_dotenv()
    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DATABASE_HOST'),
            port=os.getenv('DATABASE_PORT'),
            user=os.getenv('DATABASE_USER'),
            password=os.getenv('DATABASE_PASSWORD'),
            database=os.getenv('DATABASE_NAME')
        )
        print("Connected to database")
        with open('Eircodes.json', 'r') as f:
            eircode_data = json.load(f)
        print("Loaded Eircode data")

        cursor = conn.cursor()
        print("Executing query to find listings to update...")
        cursor.execute("""
            SELECT Id, Address
            FROM PropertyDetails
            WHERE Eircode = 'N/A';
        """)
        listings_to_update = cursor.fetchall()
        print(f"Found {len(listings_to_update)} listings to potentially update")

        for listing_id, address in listings_to_update:
            print(f"Checking listing ID: {listing_id}, Address: {address}")
            new_eircode = get_eircode_from_address(address, eircode_data)
            if new_eircode != 'N/A':
                print(f"Found Eircode '{new_eircode}' for listing ID {listing_id}, updating...")
                cursor.execute("""
                    UPDATE PropertyDetails SET Eircode = %s WHERE Id = %s;
                """, (new_eircode, listing_id))
                conn.commit()
                print(f"Successfully updated Eircode for listing ID {listing_id} to {new_eircode}")
            else:
                print(f"Could not find Eircode for listing ID {listing_id} with address: {address}")

    except mysql.connector.Error as e:
        print(f"Error from mysql connector: {e}")
    except FileNotFoundError as e:
        print(f"Error loading Eircodes.json: {e}")
    except json.JSONDecodeError as e:
        print(f"Error decoding Eircodes.json: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()
            print("Closed database connection")
    print("Finished update_eircodes")

def daft_rent_scrap():
    load_dotenv()
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DATABASE_HOST'),
            port=os.getenv('DATABASE_PORT'),
            user=os.getenv('DATABASE_USER'),
            password=os.getenv('DATABASE_PASSWORD'),
            database=os.getenv('DATABASE_NAME')
        )

        with conn.cursor() as cursor:
            for page in range(0,1880,20): #FIXME: hardcoded range
                url = 'https://www.daft.ie/property-for-rent/ireland?from='+ str(page) +'&pageSize=20'
                listings = get_property_listings(url)
                for listing in listings:

                    cursor.execute("""
                    INSERT INTO PropertyDetails (Address, Eircode, Bed, Bath, Size, Link, ForSale)
                                    SELECT %s, %s, %s, %s, %s, %s, FALSE
                                    WHERE NOT EXISTS (SELECT 1 FROM PropertyDetails WHERE Eircode = %s OR Link = %s);
                    """, (listing['address'], listing['eircode'], listing['bed'], listing['bath'],
                            listing['size'], listing['link'], listing['eircode'],listing['link']))
                    
                    conn.commit()

                    cursor.execute("""
                        SELECT Id FROM PropertyDetails WHERE (Eircode = %s AND Eircode != 'N/A') OR Link = %s LIMIT 1;
                    """, (listing['eircode'], listing['link']))
                    newId = cursor.fetchone()

                    if newId:
                        newId = newId[0]
                        for imgLink in listing.get('images'):
                            cursor.execute("""
                                SELECT 1 FROM PropertyPictures WHERE PropertyId = %s AND Link = %s;
                            """, (newId, imgLink))
                            picture_exists = cursor.fetchone()
                            if not picture_exists:
                                cursor.execute("""
                                    INSERT INTO PropertyPictures (PropertyId, Link) VALUES (%s, %s);
                                """, (newId, imgLink))
                        cursor.execute("""
                                INSERT INTO PropertyPriceHistory (PropertyId, Price, Timestamp) VALUES (%s, %s, %s);
                        """,( newId, convert_price(listing['price']), datetime.datetime.now()))
                        conn.commit()
                print(f"RENT: Page {page // 20 + 1} done")
        
    except mysql.connector.Error as e:
        print(f"Error from mysql connector: {e}")

def daft_sale_scrap():
    load_dotenv()
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DATABASE_HOST'),
            port=os.getenv('DATABASE_PORT'),
            user=os.getenv('DATABASE_USER'),
            password=os.getenv('DATABASE_PASSWORD'),
            database=os.getenv('DATABASE_NAME')
        )

        with conn.cursor() as cursor:
            for page in range(0,12650,20): #FIXME: hardcoded range
                url = 'https://www.daft.ie/property-for-sale/ireland?from='+ str(page) +'&pageSize=20'
                listings = get_property_listings(url)
                for listing in listings:

                    cursor.execute("""
                    INSERT INTO PropertyDetails (Address, Eircode, Bed, Bath, Size, Link, ForSale)
                                    SELECT %s, %s, %s, %s, %s, %s, TRUE
                                    WHERE NOT EXISTS (SELECT 1 FROM PropertyDetails WHERE Eircode = %s OR Link = %s);
                    """, (listing['address'], listing['eircode'], listing['bed'], listing['bath'],
                            listing['size'], listing['link'], listing['eircode'],listing['link']))
                    
                    conn.commit()

                    cursor.execute("""
                        SELECT Id FROM PropertyDetails WHERE (Eircode = %s AND Eircode != 'N/A') OR Link = %s LIMIT 1;
                    """, (listing['eircode'], listing['link']))
                    newId = cursor.fetchone()

                    if newId:
                        newId = newId[0]
                        for imgLink in listing.get('images'):
                            cursor.execute("""
                                SELECT 1 FROM PropertyPictures WHERE PropertyId = %s AND Link = %s;
                            """, (newId, imgLink))
                            picture_exists = cursor.fetchone()
                            if not picture_exists:
                                cursor.execute("""
                                    INSERT INTO PropertyPictures (PropertyId, Link) VALUES (%s, %s);
                                """, (newId, imgLink))
                        cursor.execute("""
                                INSERT INTO PropertyPriceHistory (PropertyId, Price, Timestamp) VALUES (%s, %s, %s);
                        """,( newId, convert_price(listing['price']), datetime.datetime.now()))
                        conn.commit()
                print(f"SELL: Page {page // 20 + 1} done")
        
    except mysql.connector.Error as e:
        print(f"Error from mysql connector: {e}")

def scrap():
    daft_rent_scrap()
    daft_sale_scrap()
    update_eircodes()

def daft_scraper_json(start_page=0, end_page=1, eircode=None, listing_type='for-sale'):
    all_listings = []
    for page in range(start_page, end_page):
        url = f'https://www.daft.ie/property-for-{listing_type}/ireland?from={page * 20}&pageSize=20'
        listings = get_property_listings(url)
        all_listings.extend(listings)
        # print(f"Page {page + 1} done")

    if eircode:
        eircode_prefix = eircode[:3].upper()
        all_listings = [listing for listing in all_listings if listing['eircode'][:3].upper() == eircode_prefix]

    formatted_listings = []
    for index, listing in enumerate(all_listings):
        formatted_listings.append({
            "listing_id": index + 1,
            "address": listing['address'],
            "eircode": listing['eircode'],
            "bedrooms": listing['bed'],
            "bathrooms": listing['bath'],
            "size": listing['size'],
            "price": listing['price'],
            "current_price": listing['price'],
            "images": listing['images']
        })

    result_json = {
        "total_results": len(formatted_listings),
        "listings": formatted_listings
    }

    return json.dumps(result_json, indent=2)

if __name__ == "__main__":
    # Example usage: Scrape pages 0 to 5 (inclusive) with an optional eircode and listing type
    result = daft_scraper_json(0, 5, eircode=None, listing_type='rent')
    print(result)
