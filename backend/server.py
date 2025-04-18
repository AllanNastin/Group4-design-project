from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import requests
import json
from maps import get_distance_and_times
import scrap_daft
import mysql.connector
from dotenv import load_dotenv
import os
from apscheduler.schedulers.background import BackgroundScheduler
import atexit
import time
from urllib.parse import quote_plus
import datetime
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, JWTManager
import google.auth
from google.auth.transport.requests import Request
from google.oauth2 import id_token

page_limit=12

load_dotenv()
google_api_key = os.getenv("GOOGLE_API_KEY")
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://gdp4.sprinty.tech", "https://dev-gdp4.sprinty.tech"])

# access token
bcrypt = Bcrypt(app)
app.config["JWT_SECRET_KEY"] = os.getenv("SECRET_KEY")
jwt = JWTManager(app)

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

def validate_id_token(id_token_params):
    try:
        CLIENT_ID = os.getenv("GOOGLE_OAUTH_CLIENT_ID")
        if not id_token_params:
            return None
        id_info = id_token.verify_oauth2_token(id_token_params, Request(), CLIENT_ID)
        return id_info
    except ValueError as e:
        # If token is invalid, handle the error
        return None

# register user
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    hashed_password = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    try:
        conn = mysql.connector.connect(
            host=os.getenv('DATABASE_HOST'),
            port=os.getenv('DATABASE_PORT'),
            user=os.getenv('DATABASE_USER'),
            password=os.getenv('DATABASE_PASSWORD'),
            database=os.getenv('DATABASE_NAME')
        )
        with conn.cursor() as cursor:
            try:
                cursor.execute("INSERT INTO Users (username, email, password_hash) VALUES (%s, %s, %s)", 
                            (data["username"], data["email"], hashed_password))
                conn.commit()
                return jsonify({"message": "User registered successfully"}), 201
            except:
                print("Error: ", cursor.error)
                return jsonify({"error": "User already exists"}), 400
    except:
        return jsonify({"error": "Connect DB error"}), 501

# Login User
@app.route("/login", methods=["POST"])
def login():
    data = request.json

    try:
        conn = mysql.connector.connect(
            host=os.getenv('DATABASE_HOST'),
            port=os.getenv('DATABASE_PORT'),
            user=os.getenv('DATABASE_USER'),
            password=os.getenv('DATABASE_PASSWORD'),
            database=os.getenv('DATABASE_NAME')
        )
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, password_hash FROM Users WHERE email = %s", (data["email"],))
            user = cursor.fetchone()
            
            if user and bcrypt.check_password_hash(user[1], data["password"]):
                access_token = create_access_token(identity=user[0])
                return jsonify({"token": access_token})
            
            return jsonify({"error": "Invalid credentials"}), 401
    except:
        return jsonify({"error": "Connect DB error"}), 501

@app.route("/")
def main():
    return jsonify({"data": "hello world"})

@app.route('/address-suggestions', methods=['GET'])
def address_suggestions():
    """
    Provides address suggestions based on user input using Google Places Autocomplete API.
    """
    query = request.args.get('query')
    # Restrict results to Ireland (using ISO 3166-1 Alpha-2 country code)
    # This significantly improves relevance for your context.
    country_restriction = "ie"

    # --- Basic Input Validation ---
    if not query or len(query) < 2: # Require at least 2 characters
        return jsonify([]) # Return empty list if query is too short or missing

    # --- Check if API Key is loaded ---
    if not google_api_key:
        print("ERROR: GOOGLE_API_KEY environment variable not set.", flush=True)
        # Avoid exposing details, just log it server-side
        return jsonify({"error": "Server configuration issue"}), 500

    # --- Construct Google Places API URL ---
    # URL encode the user's query to handle spaces and special characters
    encoded_query = quote_plus(query)

    # Documentation: developers.google.com/maps/documentation/places/web-service/autocomplete
    google_api_url = (
        f"https://maps.googleapis.com/maps/api/place/autocomplete/json?"
        f"input={encoded_query}"
        f"&key={google_api_key}"
        # f"&types=address"  # Restrict results to addresses only
        f"&components=country:{country_restriction}" # Strongly recommended: restrict to Ireland
        # Optional: Add sessiontoken for potentially lower costs - see Google Docs
    )

    # --- Call Google API and Handle Response ---
    try:
        # Make the request to Google's API, add a timeout
        response = requests.get(google_api_url, timeout=10)
        # Raise an exception for bad status codes (4xx or 5xx)
        response.raise_for_status()

        data = response.json() # Parse the JSON response from Google

        # Check the status returned by Google
        if data['status'] == 'OK':
            # Format the predictions into a simpler list for the frontend
            suggestions = [
                {
                    "description": prediction.get('description', ''), # The text to display
                    "place_id": prediction.get('place_id', '') # ID to potentially fetch details later
                }
                for prediction in data.get('predictions', [])
            ]
            return jsonify(suggestions)

        elif data['status'] == 'ZERO_RESULTS':
            # It's valid that there are no results, return empty list
            return jsonify([])
        else:
            # Log other Google API errors (e.g., REQUEST_DENIED, INVALID_REQUEST)
            error_message = data.get('error_message', 'No error message provided')
            print(f"Google Places API Error ({data['status']}): {error_message}", flush=True)
            return jsonify({"error": f"Google API Error: {data['status']}"}), 502 # Bad Gateway

    except requests.exceptions.Timeout:
        print(f"Request to Google Places API timed out for query: '{query}'", flush=True)
        return jsonify({"error": "Address lookup timed out"}), 504 # Gateway Timeout
    except requests.exceptions.RequestException as e:
        # Handle network errors, bad status codes, etc.
        print(f"Error calling Google Places API: {e}", flush=True)
        return jsonify({"error": "Failed to fetch address suggestions"}), 500
    except Exception as e:
        # Catch any other unexpected errors during processing
        print(f"Unexpected error in /api/address-suggestions: {e}", flush=True)
        return jsonify({"error": "Internal server error"}), 500

@app.route("/saveListing", methods=['GET', 'POST'])
def saveListing():
    if request.method == 'GET':
        id_token = request.args.get('id_token')
        user_info = validate_id_token(id_token)
        if user_info:
            email = user_info['email']
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
                        SELECT Link FROM SavedListing WHERE UserId IN (SELECT Id FROM Users WHERE email = %s);
                    """, (email,))
                    listings = cursor.fetchall()
                    print(listings, flush = True)
                    return jsonify(listings), 200
            except mysql.connector.Error as e:
                print(f"Error from mysql connector: {e}")
                return jsonify({"error": f"{e}"}), 500
        else:
            return jsonify({"error": "Invalid token"}), 401
    if request.method == 'POST':
        id_token = request.args.get('id_token')
        listingUrl = request.args.get('url_to_save')
        user_info = validate_id_token(id_token)
        if user_info:
            email = user_info['email']
            try:
                conn = mysql.connector.connect(
                    host=os.getenv('DATABASE_HOST'),
                    port=os.getenv('DATABASE_PORT'),
                    user=os.getenv('DATABASE_USER'),
                    password=os.getenv('DATABASE_PASSWORD'),
                    database=os.getenv('DATABASE_NAME')
                )
                with conn.cursor() as cursor:
                    create_or_getUser = """
                        INSERT INTO Users (email)
                        SELECT * FROM (SELECT %s) AS tmp
                        WHERE NOT EXISTS (
                            SELECT 1 FROM Users WHERE email = %s
                        );
                    """
                    cursor.execute(create_or_getUser, (email, email))
                    conn.commit()

                    cursor.execute("SELECT Id FROM Users WHERE email = %s", (email,))
                    userId = cursor.fetchone()[0]
                    print(userId, flush=True)

                    cursor.execute("""
                        INSERT INTO SavedListing (UserId, Link)
                        SELECT * FROM (SELECT %s AS UserId, %s AS LINK) AS temp
                        WHERE NOT EXISTS (
                            SELECT 1 FROM SavedListing WHERE UserId = %s AND Link = %s
                        );
                    """, (userId, listingUrl, userId, listingUrl))
                    conn.commit()
                return jsonify({"message": "Listing saved successfully"}), 200
            except mysql.connector.Error as e:
                print(f"Error from mysql connector: {e}")
                return jsonify({"error": f"{e}"}), 500
        else:
            return jsonify({"error": "Invalid token"}), 401

@app.route("/unsaveListing", methods=['DELETE'])
def unsaveListing():
    id_token = request.args.get('id_token')
    user_info = validate_id_token(id_token)
    listingToUnsave = request.args.get('url_to_unsave')
    if user_info and listingToUnsave:
        email = user_info['email']
        print(email,flush = True)
        print(listingToUnsave, flush = True)
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
                    DELETE FROM SavedListing
                    WHERE UserId IN (SELECT Id FROM Users WHERE email = %s)
                    AND SUBSTRING_INDEX(Link, '/', 8) = SUBSTRING_INDEX(%s, '/', 8);
                """, (email, listingToUnsave))
                conn.commit()
                return jsonify({"message": "Listing unsave successfully"}), 200
        except mysql.connector.Error as e:
            print(f"Error from mysql connector: {e}")
            return jsonify({"error": f"{e}"}), 500
    else:
        return jsonify({"error": "Invalid token"}), 401

@app.route("/isSaved", methods=['GET'])
def isSaved():
    id_token = request.args.get('id_token')
    user_info = validate_id_token(id_token)
    listingToCheck = request.args.get('listing_url')
    if user_info and listingToCheck:
        email = user_info['email']
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
                    SELECT 1 FROM SavedListing
                    WHERE UserId IN (SELECT Id FROM Users WHERE email = %s)
                    AND SUBSTRING_INDEX(Link, '/', 8) = SUBSTRING_INDEX(%s, '/', 8);
                """, (email, listingToCheck))
                result = cursor.fetchone()
                if result:
                    return jsonify({"exists": True}), 200
                else:
                    return jsonify({"exists": False}), 200
        except mysql.connector.Error as e:
            print(f"Error from mysql connector: {e}")
            return jsonify({"error": f"{e}"}), 500

    else:
        return jsonify({"error": "Invalid token"}), 401

@app.route("/maps")
def maps():
    origin = request.args.get('origin')
    dest = request.args.get('dest')
    dist, drive, walk, public, cycling = get_distance_and_times(origin, dest, google_api_key)
    return jsonify({"distance": dist, "drive_time": drive, "walk_time": walk, "public_time": public, "cycling_time": cycling})

@app.route("/getListing", methods=['GET'])
def getListing():
    load_dotenv()
    try:
        listing_id = int(request.args.get('listing_id'))
    except:
        return jsonify({"error": "Missing required parameters"}), 400

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
                SELECT pd.*, pph.Price
                FROM PropertyDetails pd
                JOIN PropertyPriceHistory pph ON pd.Id = pph.PropertyId
                WHERE pd.Id = %s;
            """, (listing_id,))
            results = cursor.fetchall()
            listing = results[0]
            cursor.execute("""
                SELECT Link FROM PropertyPictures WHERE PropertyId = %s;
            """, (listing_id,))
            images = cursor.fetchall()
            print(f"Listing: {listing}", flush=True)  # Debug print

            price_history = []
            price_dates = []

            cursor.execute("""
                SELECT Price, Timestamp 
                FROM daftListing.PropertyPriceHistory 
                WHERE PropertyId = %s
                ORDER BY Timestamp ASC;
            """, (listing[0],))

            results = cursor.fetchall()

            if results:
                # Use zip(*results) to transpose the list of tuples 
                # It creates two tuples: one with all prices, one with all timestamps
                raw_prices, raw_dates = zip(*results) 
                    
                # Convert the tuple of prices into a list
                price_history = list(raw_prices)
                price_dates = [d.strftime('%d/%m/%Y') for d in raw_dates]

            jsonEntry = {
                "listing_id": listing[0],
                "address": listing[1],
                "eircode": listing[2],
                "bedrooms": listing[3],
                "bathrooms": listing[4],
                "size": listing[5],
                "url": listing[6],
                "price": listing[8],
                "images": [sub[0] for sub in images],
                "price_history": price_history,
                "price_dates": price_dates,
            }
            conn.close()
        return(jsonify(jsonEntry))

    except mysql.connector.Error as e:
        print(f"Error from mysql connector: {e}")
        return jsonify({"error": f"{e}"}), 500

@app.route("/getListings", methods=['GET'])
def getListings():
    load_dotenv()
    # ignore default values
    defaultParams = ["Min", "Max", "Any", ""]
    try:
        try:
            page = int(request.args.get('page'))
        except (TypeError, ValueError):
            page = 1
        listing_type = request.args.get('type')
        location = request.args.get('location')
        commute = request.args.get('commute')
        priceMin = request.args.get('price-min') if not request.args.get('price-min') in defaultParams else None
        priceMax = request.args.get('price-max') if not request.args.get('price-max') in defaultParams else None
        beds = request.args.get('beds') if not request.args.get('beds') in defaultParams else None
        baths = request.args.get('baths') if not request.args.get('baths') in defaultParams else None
        sizeMin = request.args.get('size-min') if not request.args.get('size-min') in defaultParams else None
        sizeMax = request.args.get('size-max') if not request.args.get('size-max') in defaultParams else None
        print(listing_type, location, commute, flush =True)
        print("Type:", listing_type)
        print("Location:", location)
        print("Commute:", commute)
        print("Price Min:", request.args.get('price-min'))
        print("Price Max:", request.args.get('price-max'))
        print("Beds:", request.args.get('beds'))
        print("Baths:", request.args.get('baths'))
        print("Size Min:", request.args.get('size-min'))
        print("Size Max:", request.args.get('size-max'))
    except KeyError:
        return jsonify({"error": "Missing required parameters"}), 400

    if listing_type == "rent":
        ForSaleValue = 0
    else:
        ForSaleValue = 1

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
            # --- Counting Query ---
            count_query = """
                SELECT COUNT(*)
                FROM PropertyDetails pd
                JOIN PropertyPriceHistory pph ON pd.Id = pph.PropertyId
                WHERE pph.Timestamp = (
                    SELECT MAX(Timestamp) FROM PropertyPriceHistory WHERE Timestamp >= NOW() - INTERVAL 1 DAY AND PropertyId = pd.Id 
                )
                AND pd.ForSale = %s
            """
            params = [ForSaleValue]
            if location is not None:
                if len(location) == 3:
                    count_query += " AND pd.Eircode LIKE %s"
                    params.append(f"{location}%")
            if priceMin != None:
                count_query += " AND pph.Price >= %s"
                params.append(priceMin)
            if priceMax != None:
                count_query += " AND pph.Price <= %s"
                params.append(priceMax)
            if beds != None:
                count_query += " AND pd.Bed >= %s"
                params.append(beds)
            if baths != None:
                count_query += " AND pd.Bath >= %s"
                params.append(baths)
            if sizeMin != None:
                count_query += " AND pd.Size >= %s"
                params.append(sizeMin)
            if sizeMax != None:
                count_query += " AND pd.Size <= %s"
                params.append(sizeMax)

            cursor.execute(count_query, tuple(params))
            total_count = cursor.fetchone()[0]
            response["total_results"] = total_count

            # --- Main Query (with LIMIT) ---
            sql_query = """
                SELECT pd.*, pph.Price
                FROM PropertyDetails pd
                JOIN PropertyPriceHistory pph ON pd.Id = pph.PropertyId
                WHERE pph.Timestamp = (
                    SELECT MAX(Timestamp) FROM PropertyPriceHistory WHERE Timestamp >= NOW() - INTERVAL 1 DAY AND PropertyId = pd.Id 
                )
                AND pd.ForSale = %s
            """
            params = [ForSaleValue]
            if location is not None:
                if len(location) == 3:
                    sql_query += " AND pd.Eircode LIKE %s"
                    params.append(f"{location}%")
            if priceMin != None:
                sql_query += " AND pph.Price >= %s"
                params.append(priceMin)
            if priceMax != None:
                sql_query += " AND pph.Price <= %s"
                params.append(priceMax)
            if beds != None:
                sql_query += " AND pd.Bed >= %s"
                params.append(beds)
            if baths != None:
                sql_query += " AND pd.Bath >= %s"
                params.append(baths)
            if sizeMin != None:
                sql_query += " AND pd.Size >= %s"
                params.append(sizeMin)
            if sizeMax != None:
                sql_query += " AND pd.Size <= %s"
                params.append(sizeMax)
            
            # Limit the number of results to page_limit
            sql_query += " LIMIT %s OFFSET %s"
            params.append(page_limit)
            offset = (page - 1) * page_limit
            params.append(offset)

            cursor.execute(sql_query, tuple(params))
            results = cursor.fetchall()

            print(f"Total results: {len(results)}", flush=True)  # Debug print
            # fetch pics from the filtered results

            for listing in results:
                cursor.execute("""
                    SELECT Link FROM PropertyPictures WHERE PropertyId = %s;
                """, (listing[0],))
                images = cursor.fetchall()
                # print(f"Listing: {listing}", flush=True)  # Debug print
                listing_location = eircode_map.get(location.upper(), location) # Translate Eircode to location name
                if listing_location == location.upper():
                    listing_location = next((k for k, v in eircode_map.items() if v == location.upper()), location)
                # print(f"Listing location: {listing_location}", flush=True)  # Debug print
                distance, car_time, walk_time, public_time, cycling_time = get_distance_and_times(commute, listing[1], google_api_key)

                price_history = []
                price_dates = []

                cursor.execute("""
                    SELECT Price, Timestamp 
                    FROM daftListing.PropertyPriceHistory 
                    WHERE PropertyId = %s
                    ORDER BY Timestamp ASC;
                """, (listing[0],))

                results = cursor.fetchall()

                if results:
                    # Use zip(*results) to transpose the list of tuples 
                    # It creates two tuples: one with all prices, one with all timestamps
                    raw_prices, raw_dates = zip(*results) 
                    
                    # Convert the tuple of prices into a list
                    price_history = list(raw_prices)
                    price_dates = [d.strftime('%d/%m/%Y') for d in raw_dates]

                jsonEntry = {
                    "listing_id": listing[0],
                    "url": listing[6],
                    "address": listing[1],
                    "eircode": listing[2],
                    "bedrooms": listing[3],
                    "bathrooms": listing[4],
                    "size": listing[5],
                    "price": listing[8],
                    "images": [sub[0] for sub in images],
                    "distance": distance,
                    "commute_times": {
                        "car": str(car_time),
                        "walk": str(walk_time),
                        "public": str(public_time),
                        "cycling": str(cycling_time),
                    },
                "price_history": price_history,
                    "price_dates": price_dates,
                }
                response["listings"].append(jsonEntry)
            
        conn.close()
        return jsonify(response)
    except mysql.connector.Error as e:
        print(f"Error from mysql connector: {e}")
        return jsonify({"error": f"{e}"}), 500


def initScrap():
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
                SELECT COUNT(*) FROM PropertyPriceHistory WHERE Timestamp >= NOW() - INTERVAL 1 DAY;
            """)
            countDb = cursor.fetchone()[0]
        return countDb <= 0
    except mysql.connector.Error as e:
        print(f"Error from mysql connector: {e}")
        return False

def try_connect_db():
     while True:
        try:
            conn = mysql.connector.connect(
                host=os.getenv('DATABASE_HOST'),
                port=os.getenv('DATABASE_PORT'),
                user=os.getenv('DATABASE_USER'),
                password=os.getenv('DATABASE_PASSWORD'),
                database=os.getenv('DATABASE_NAME')
            )
            print("Database connection successful", flush=True)
            return conn
        except mysql.connector.Error as e:
            print(f"Error connecting to database: {e}", flush=True)
            print("Retrying in 5 seconds...", flush=True)
            time.sleep(5)

if __name__ == "__main__":
    # wait for db to be ready
    conn = try_connect_db()
    conn.close()
    
    scheduler.start()
    print(f"scheduler started: {scheduler.get_jobs()}")
    
    for job in scheduler.get_jobs():
        print(f"Job ID: {job.id}, Next Run: {job.next_run_time}")

    # scrap at the start of server if database empty
    print(f"Database needs initial scrap: {initScrap()}")
    if initScrap():
        print(f"init scrap @{datetime.datetime.now()}", flush=True)
        scrap_daft.scrap()
 
    app.run(host="0.0.0.0", port=5300)
