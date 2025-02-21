import datetime
import json
import os
import requests
from bs4 import BeautifulSoup
import re

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
        link = listing.find('a')['href']
        address_div = listing.find('div', {'data-tracking': 'srp_address'})
        address = address_div.get_text() if address_div else 'N/A'
        price_div = listing.find('div', {'data-tracking':"srp_price"})
        price = price_div.get_text() if price_div else 'N/A'
        meta_div = listing.find('div', {'data-tracking':"srp_meta"})
        meta_text = meta_div.get_text() if meta_div else 'N/A'

        img_divs = listing.find_all('img', {'alt': address})
        imgs = [img_div['src'] for img_div in img_divs]

        bed_match = re.search(r'(\d+)\s*Bed', meta_text)
        bath_match = re.search(r'(\d+)\s*Bath', meta_text)
        size_match = re.search(r'(\d+)\s*m²', meta_text)

        eircode_match = re.search(r'([AC-FHKNPRTV-Y]{1}[0-9]{2}|D6W)[ ]?[0-9AC-FHKNPRTV-Y]{4}', address)
        eircode = eircode_match.group(0) if eircode_match else 'N/A'

        bed = int(bed_match.group(1)) if bed_match else None
        bath = int(bath_match.group(1)) if bath_match else None
        size = int(size_match.group(1)) if size_match else None

        toReturn.append({
            'address': address,
            'eircode': eircode,
            'price': convert_price(price),
            'bed': bed,
            'bath': bath,
            'size': size,
            'link': link,
            'images': imgs
        })
    return toReturn

def daft_scraper_json(start_page=0, end_page=1):
    all_listings = []
    for page in range(start_page, end_page):
        url = f'https://www.daft.ie/property-for-sale/ireland?from={page * 20}&pageSize=20'
        listings = get_property_listings(url)
        all_listings.extend(listings)
        print(f"Page {page + 1} done")

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
    # Example usage: Scrape pages 0 to 5 (inclusive)
    result = daft_scraper_json(0, 1)
    print(result)