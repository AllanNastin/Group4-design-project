from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import json
import scrap_daft
import mysql.connector
from dotenv import load_dotenv
import os
from apscheduler.schedulers.background import BackgroundScheduler
import atexit
import time
from maps import get_distance_and_times
import datetime

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://gdp4.sprinty.tech", "https://dev-gdp4.sprinty.tech"])

# Load Eircode.json
with open('Eircodes.json') as f:
    eircode_map = json.load(f)

# Schedule Scrapper
def scheduled_scrap():
    print("cron triggered", flush=True)
    scrap_daft.scrap()
    print(f"cron triggered done: {datetime.datetime.now()}", flush=True)

scheduler = BackgroundScheduler()
scheduler.add_job(scheduled_scrap, 'cron', hour=17, minute=30)

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
    load_dotenv()
    try:
        listing_type = request.args.get('type')
        location = request.args.get('location')
        commute = request.args.get('commute')
        print(listing_type, location, commute, flush =True)
    except KeyError:
        return jsonify({"error": "Missing required parameters"}), 400
    ForSaleValue = 0

    if listing_type == "sale":
        ForSaleValue = 1
        # return all
    try:
        response = {
            "total_results": 0,
            "listings": []
        }
        conn = mysql.connector.connect(
            host=os.getenv('DATABASE_HOST'),
            port=os.getenv('DATABASE_PORT'),
            user=os.getenv('DATABASE_USER'),
            password=os.getenv('DATABASE_PASSWORD'),
            database=os.getenv('DATABASE_NAME')
        )
        print(len(location), flush=True)
        with conn.cursor() as cursor:
            if len(location) == 3:
                cursor.execute("""
                    SELECT pd.*, pph.Price
                    FROM PropertyDetails pd
                    JOIN PropertyPriceHistory pph ON pd.Id = pph.PropertyId
                    WHERE pph.Timestamp >= NOW() - INTERVAL 1 DAY AND pd.ForSale = %s AND pd.Eircode LIKE %s;
                """, (ForSaleValue,f"{location}%"))
            else:
                cursor.execute("""
                    SELECT pd.*, pph.Price
                    FROM PropertyDetails pd
                    JOIN PropertyPriceHistory pph ON pd.Id = pph.PropertyId
                    WHERE pph.Timestamp >= NOW() - INTERVAL 1 DAY AND ForSale = %s;
                """, (ForSaleValue,))
            results = cursor.fetchall()
            response["total_results"] = len(results)
                
            for listing in results:
                cursor.execute("""
                    SELECT Link FROM PropertyPictures WHERE PropertyId = %s;
                """, (listing[0],))
                images = cursor.fetchall()
                listing_location = eircode_map.get(location.upper(), location) # Translate Eircode to location name
                if listing_location == location.upper():
                    listing_location = next((k for k, v in eircode_map.items() if v == location.upper()), location)
                print(f"Listing location: {listing_location}", flush=True)  # Debug print
                distance, car_time, walk_time = get_distance_and_times(listing_location, listing["address"], google_api_key)

                jsonEntry = {
                    "listing_id": listing[0],
                    "address": listing[1],
                    "eircode": listing[2],
                    "bedrooms": listing[3],
                    "bathrooms": listing[4],
                    "size": listing[5],
                    "current_price": listing[7],
                    "images": [sub[0] for sub in images],
                    "distance": distance,
                    "commute_times": {
                        "car": str(car_time),
                        "walk": str(walk_time)
                    }
                }
                response["listings"].append(jsonEntry)
            
        conn.close()
        return jsonify(response)

    except mysql.connector.Error as e:
        print(f"Error from mysql connector: {e}")
        return jsonify({"error": f"{e}"}), 500

def isDbEmpty():
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
            cursor.execute("""
                SELECT COUNT(*) FROM PropertyDetails;
            """)
            countDb = cursor.fetchone()[0]
        return countDb <= 0
    except mysql.connector.Error as e:
        print(f"Error from mysql connector: {e}")
        return False

if __name__ == "__main__":
    time.sleep(10)
    scheduler.start()
    print(f"scheduler started: {scheduler.get_jobs()}")
    
    for job in scheduler.get_jobs():
        print(f"Job ID: {job.id}, Next Run: {job.next_run_time}")

    # scrap at the start of server if database empty
    print(isDbEmpty())
    if isDbEmpty():
        print(f"Database empty: init scrap @{datetime.datetime.now()}", flush=True)
        scrap_daft.scrap()
    
    app.run(host="0.0.0.0", port=5300)

