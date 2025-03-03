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
    driving_time = result['rows'][0]['elements'][0]['duration']['text']

    walk_result = gmaps.distance_matrix(
        origins=[origin],
        destinations=[destination],
        mode="walking"
    )

    walking_time = walk_result['rows'][0]['elements'][0]['duration']['text']
    return driving_distance, driving_time, walking_time
