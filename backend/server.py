from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def main():
    return jsonify({"data": "hello world"})

if __name__ == "__main__":
    app.run()
