import googlemaps
from datetime import datetime

def get_distance_and_times(origin, destination, api_key):
    gmaps = googlemaps.Client(key=api_key)
    result = gmaps.distance_matrix(
        origins=[origin],
        destinations=[destination],
        mode="driving",
        departure_time=datetime.now()
    )
    driving_distance = result['rows'][0]['elements'][0]['distance']['text']
    driving_time_seconds = result['rows'][0]['elements'][0]['duration']['value']
    driving_time_minutes = driving_time_seconds // 60

    walk_result = gmaps.distance_matrix(
        origins=[origin],
        destinations=[destination],
        mode="walking"
    )

    walking_time_seconds = walk_result['rows'][0]['elements'][0]['duration']['value']
    walking_time_minutes = walking_time_seconds // 60

    return driving_distance, driving_time_minutes, walking_time_minutes

if __name__ == "__main__":
    api = ""
    
    origin = "Dublin1"
    dest = "Cork"
    distance, driving_time, walking_time = get_distance_and_times(origin, dest, api)
    print(f"Distance from {origin} to {dest} is {distance}km")
    print(f"Driving time from {origin} to {dest} is {driving_time}(mins)")
    print(f"Walking from {origin} to {dest} is {walking_time}(mins)")
