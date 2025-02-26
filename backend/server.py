from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import json
import scrap_daft
import mysql.connector
from dotenv import load_dotenv
import os
from apscheduler.schedulers.background import BackgroundScheduler
import atexit

import datetime

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://gdp4.sprinty.tech", "https://dev-gdp4.sprinty.tech"])


# Schedule Scrapper
def scheduled_scrap():
    print("cron triggered", flush=True)
    scrap_daft.scrap()
    print(f"cron triggered done: {datetime.datetime.now()}", flush=True)

scheduler = BackgroundScheduler()
scheduler.add_job(scheduled_scrap, 'cron', hour=17, minute=30)


# shutdown when the app stops
#atexit.register(lambda: scheduler.shutdown())

# Pre-scrape listings on startup
# try:
#     listings_data = scrap_daft.daft_scraper_json(0, 1)  # Scrape the first page
# except Exception as e:
#     print(f"Error during scraping: {e}")
#     listings_data = json.dumps({"error": "Failed to scrape listings"})  # Error as JSON

@app.route("/")
def main():
    return jsonify({"data": "hello world"})

@app.route("/getListings", methods=['GET'])
def getListings():
    load_dotenv()
    try:
        listing_type = request.args.get('type')
        location = request.args.get('location')
        commute = request.args.get('commute')
        print(listing_type, location, commute)
    except KeyError:
        return jsonify({"error": "Missing required parameters"}), 400
    ForSaleValue = "FALSE"
    if listing_type == "sale":
        ForSaleValue = "TRUE"
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
        with conn.cursor() as cursor:
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
            
        conn.close()
        return jsonify(response)

    except mysql.connector.Error as e:
        print(f"Error from mysql connector: {e}")
        return jsonify({"error": f"{e}"}), 500

if __name__ == "__main__":
    scheduler.start()
    print(f"scheduler started: {scheduler.get_jobs()}")
    
    for job in scheduler.get_jobs():
        print(f"Job ID: {job.id}, Next Run: {job.next_run_time}")
    app.run(host="0.0.0.0", port=5300)

