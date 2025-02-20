from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import mysql.connector
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://gdp4.sprinty.tech"])

@app.route("/")
def main():
    return jsonify({"data": "hello world"})



@app.route("/getListings", methods=['GET'])
def getListings():
    load_dotenv()
    if len(request.args) == 0:
        
        # return all
        try:
            response = {
                "total_results": 0,
                "listings": []
            }
            conn = mysql.connector.connect(
                host=os.getenv('MYSQL_Host'),
                port=os.getenv('MYSQL_Port'),
                user=os.getenv('MYSQL_User'),
                password=os.getenv('MYSQL_Password'),
                database=os.getenv('MYSQL_Database')
            )
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT pd.*, pph.Price
                    FROM PropertyDetails pd
                    JOIN PropertyPriceHistory pph ON pd.Id = pph.PropertyId
                    WHERE pph.Timestamp >= NOW() - INTERVAL 1 DAY;
                """)
                results = cursor.fetchall()
                response["total_results"] = len(results)
                
                for listing in results:
                    cursor.execute("""
                        SELECT Link FROM PropertyPictures WHERE PropertyId = %s;
                    """, (listing[0],))
                    images = cursor.fetchall()
                    
                    jsonEntry = {
                        "listing_id": listing[0],
                        "address": listing[1],
                        "eircode": listing[2],
                        "bedrooms": listing[3],
                        "bathrooms": listing[4],
                        "size": listing[5],
                        "current_price": listing[7],
                        "images": [sub[0] for sub in images]
                    }
                    response["listings"].append(jsonEntry)
                cursor.close()
                conn.close()
            return jsonify(response)

        except mysql.connector.Error as e:
            print(f"Error from mysql connector: {e}")
            return jsonify({"error": f"{e}"}), 500

    else:
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
    app.run(host="0.0.0.0", port=5300)
