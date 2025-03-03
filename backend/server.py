from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import json
from maps import get_distance_and_times
import scrap_daft
import os

google_api_key = os.getenv("GOOGLE_API")
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://gdp4.sprinty.tech", "https://dev-gdp4.sprinty.tech"])

# Pre-scrape listings on startup
# try:
#     listings_data = scrap_daft.daft_scraper_json(0, 1)  # Scrape the first page
# except Exception as e:
#     print(f"Error during scraping: {e}")
#     listings_data = json.dumps({"error": "Failed to scrape listings"})  # Error as JSON

@app.route("/")
def main():
    return jsonify({"data": "hello world"})

@app.route("/maps")
def maps():
    origin = request.args.get('origin')
    dest = request.args.get('dest')
    dist, drive, walk = get_distance_and_times(origin, dest, google_api_key)
    return jsonify({"distance": dist, "drive_time": drive, "walk_time": walk})

@app.route("/getListings", methods=['GET'])
def getListings():
    try:
        listing_type = request.args.get('type')
        location = request.args.get('location')
        commute = request.args.get('commute')
        print(listing_type, location, commute)
    except KeyError:
        return jsonify({"error": "Missing required parameters"}), 400

    if listing_type is "sale":
        listings_data = scrap_daft.daft_scraper_json(0, 1, eircode=location, listing_type=listing_type)
    else:
        listings_data = scrap_daft.daft_scraper_json(0, 1, listing_type=listing_type)
    return Response(listings_data, mimetype='application/json') # Return the pre-scraped JSON

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
