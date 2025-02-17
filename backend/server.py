from flask import Flask, jsonify, request
import json

app = Flask(__name__)

@app.route("/")
def main():
    return jsonify({"data": "hello world"})

@app.route("/getListings", methods=['GET'])
def getListings():
    listing_type = request.args.get('type')
    location = request.args.get('location')
    commute = request.args.get('commute')

    try:
        with open('Sample.json', 'r') as f:
            sample_data = json.load(f)

            filtered_listings = []
            if sample_data.get("listings"):
                for listing in sample_data["listings"]:
                    type_match = (listing_type is None or listing_type == "" or listing['type'] == listing_type)
                    location_match = (location is None or location == "" or listing['location'] == location)
                    commute_match = (commute is None or commute == "" or listing['location'] == commute)

                    if type_match and location_match and commute_match:
                        filtered_listings.append(listing)

                return jsonify({"data": filtered_listings})
            else:
                return jsonify({"data": sample_data})

    except FileNotFoundError:
        return jsonify({"error": "Sample.json not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON in Sample.json"}), 500


if __name__ == "__main__":
    app.run()
