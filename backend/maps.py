import googlemaps
from datetime import datetime

def get_distance_and_times(origin, destination, api_key):
    gmaps = googlemaps.Client(key=api_key)
    try:
        result = gmaps.distance_matrix(
            origins=[origin],
            destinations=[destination],
            mode="driving",
            departure_time=datetime.now()
        )
        if result['status'] == 'OK' and result['rows'] and result['rows'][0]['elements'] and result['rows'][0]['elements'][0]['status'] == 'OK':
            driving_distance = result['rows'][0]['elements'][0]['distance']['text']
            driving_time_seconds = result['rows'][0]['elements'][0]['duration']['value']
            driving_time_minutes = driving_time_seconds // 60
        else:
            print(f"Error in driving distance matrix: {result.get('status', 'Unknown')}")
            driving_distance = None
            driving_time_minutes = None

        walk_result = gmaps.distance_matrix(
            origins=[origin],
            destinations=[destination],
            mode="walking"
        )

        if walk_result['status'] == 'OK' and walk_result['rows'] and walk_result['rows'][0]['elements'] and walk_result['rows'][0]['elements'][0]['status'] == 'OK':
            walking_time_seconds = walk_result['rows'][0]['elements'][0]['duration']['value']
            walking_time_minutes = walking_time_seconds // 60
        else:
            print(f"Error in walking distance matrix: {walk_result.get('status', 'Unknown')}")
            walking_time_minutes = None
        public_result = gmaps.distance_matrix(
            origins=[origin],
            destinations=[destination],
            mode="transit",
            departure_time=datetime.now()
        )
        if public_result['status'] == 'OK' and public_result['rows'] and public_result['rows'][0]['elements'] and public_result['rows'][0]['elements'][0]['status'] == 'OK':
            public_time_seconds = public_result['rows'][0]['elements'][0]['duration']['value']
            public_time_minutes = public_time_seconds // 60
        else:
            print(f"Error in public distance matrix: {public_result.get('status', 'Unknown')}")
            public_time_minutes = None

        cycling_result = gmaps.distance_matrix(
            origins=[origin],
            destinations=[destination],
            mode="bicycling",
            departure_time=datetime.now()
        )
        if cycling_result['status'] == 'OK' and cycling_result['rows'] and cycling_result['rows'][0]['elements'] and cycling_result['rows'][0]['elements'][0]['status'] == 'OK':
            cycling_time_seconds = cycling_result['rows'][0]['elements'][0]['duration']['value']
            cycling_time_minutes = cycling_time_seconds // 60
        else:
            print(f"Error in cycling distance matrix: {cycling_result.get('status', 'Unknown')}")
            cycling_time_minutes = None

        return driving_distance, driving_time_minutes, walking_time_minutes, public_time_minutes, cycling_time_minutes
    except googlemaps.exceptions.ApiError as e:
        print(f"Google Maps API Error: {e}")
        return None, None, None
    except (KeyError, IndexError) as e:
        print(f"Error parsing Google Maps API response: {e}")
        return None, None, None
