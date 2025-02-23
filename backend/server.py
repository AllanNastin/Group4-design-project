from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import json
import scrap_daft

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://gdp4.sprinty.tech, https://dev-gdp4.sprinty.tech"])

# Pre-scrape listings on startup
try:
    listings_data = scrap_daft.daft_scraper_json(0, 1)  # Scrape the first page
except Exception as e:
    print(f"Error during scraping: {e}")
    listings_data = json.dumps({"error": "Failed to scrape listings"})  # Error as JSON

@app.route("/")
def main():
    return jsonify({"data": "hello world"})

@app.route("/getListings", methods=['GET'])
def getListings():
    try:
        listing_type = request.args.get('type')
        location = request.args.get('location')
        commute = request.args.get('commute')
        print(listing_type, location, commute)
    except KeyError:
        return jsonify({"error": "Missing required parameters"}), 400

    return Response(listings_data, mimetype='application/json') # Return the pre-scraped JSON

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)