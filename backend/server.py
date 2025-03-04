from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import json
from maps import get_distance_and_times
import scrap_daft
import os
from dotenv import load_dotenv

load_dotenv()
google_api_key = os.getenv("GOOGLE_API_KEY")
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://gdp4.sprinty.tech", "https://dev-gdp4.sprinty.tech"])

# Load Eircode.json
with open('Eircodes.json') as f:
    eircode_map = json.load(f)

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

    if "sale" in listing_type:
        listings_data = scrap_daft.daft_scraper_json(0, 1, eircode=location, listing_type=listing_type)
        # now we have the listings, we need to get the distance and time to the location
        # for each listing
        listings = json.loads(listings_data)
        # print(f"Listings: {listings}")  # Debug print
        for listing in listings['listings']:
            # print(f"Processing listing: {listing}")  # Debug print
            listing_location = eircode_map.get(location.upper(), location)  # Translate Eircode to location name
            if listing_location == location.upper():
                listing_location = next((k for k, v in eircode_map.items() if v == location.upper()), location)
            print(f"Listing location: {listing_location}")  # Debug print
            distance, car_time, walk_time = get_distance_and_times(listing_location, listing["address"], google_api_key)
            listing["distance"] = distance
            listing["commute_times"] = {
                "car": str(car_time),
                "walk": str(walk_time)
            }
        listings_data = json.dumps(listings)
    else:
        listings_data = scrap_daft.daft_scraper_json(0, 1, listing_type=listing_type)
    return Response(listings_data, mimetype='application/json') # Return the pre-scraped JSON

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)