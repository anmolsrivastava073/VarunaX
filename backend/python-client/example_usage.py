from oilspill_api_client import OilSpillAPIClient

# Initialize the client (point this to your Vercel URL in production)
client = OilSpillAPIClient(
    base_url="http://localhost:3000/api/v1",
    api_key="dev-secret-key-change-me"
)

print("Starting integration test...")

# 1. Start an Incident
incident_id = client.start_incident(
    observation_time="2025-03-15T04:32:00Z",
    scene_id="SCENE_EXAMPLE",
    lat=10.0,
    lon=70.0
)
print(f"Created Incident: {incident_id}")

# 2. System 1 Output (Connect your existing System 1 Python package here)
# slick_polygon, mask_uri, age_interval = my_system1_package.run(scene_id)
sys1_payload = {
    "observation_time": "2025-03-15T04:32:00Z",
    "scene_id": "SCENE_EXAMPLE",
    "slick_polygon": {
        "type": "Polygon",
        "coordinates": [[[70.0, 10.0], [70.1, 10.0], [70.1, 10.1], [70.0, 10.1], [70.0, 10.0]]]
    },
    "age_prediction": {
        "predicted_age_hours": 30.5,
        "age_interval_lower_hours": 24.0,
        "age_interval_upper_hours": 48.0,
        "units": "hours"
    }
}
client.submit_system1_results(incident_id, sys1_payload)
print("System 1 data submitted successfully.")

# 3. System 2 Output (Connect your existing System 2 Python package here)
# origin_contours = my_system2_package.run(slick_polygon, age_interval)
sys2_payload = {
    "observation_time": "2025-03-15T04:32:00Z",
    "age_interval_hours": [24, 48],
    "particle_count": 1000,
    "origin_contours": {
        "50": {
            "type": "Polygon",
            "coordinates": [[[70.2, 10.0], [70.3, 10.0], [70.3, 10.1], [70.2, 10.1], [70.2, 10.0]]]
        }
    }
}
client.submit_system2_results(incident_id, sys2_payload)
print("System 2 data submitted successfully.")

# 4. System 3 Output (Ready for future integration)
# When System 3 is finished, you will call:
# client.submit_system3_results(incident_id, sys3_payload)
print(f"Integration pipeline complete. Waiting on System 3 for incident {incident_id}.")
