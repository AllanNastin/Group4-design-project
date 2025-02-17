from flask import Flask, jsonify, request
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://gdp4.sprinty.tech"])

@app.route("/")
def main():
    return jsonify({"data": "hello world"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
