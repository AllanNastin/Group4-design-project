from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://gdp4.sprinty.tech"])

@app.route("/")
def main():
    return jsonify({"data": "hello world"})

@app.route("/getListings", methods=['GET'])
def getListings():
    try:
        with open('Sample.json', 'r') as f:
            data = f.read()
            return Response(data, mimetype='application/json') # Return a Response object

    except FileNotFoundError:
        return jsonify({"error": "Sample.json not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON in Sample.json"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)