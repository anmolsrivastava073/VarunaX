import os
import requests
from typing import Dict, Any, Optional

class OilSpillAPIClient:
    """
    Python client for integrating ML Systems (1, 2, and 3) with the Next.js Backend.
    """
    def __init__(self, base_url: str = None, api_key: str = None):
        # Default to local dev server if not provided
        self.base_url = (base_url or os.getenv("API_BASE_URL", "http://localhost:3000/api/v1")).rstrip("/")
        self.api_key = api_key or os.getenv("INTERNAL_API_KEY", "dev-secret-key-change-me")
        
        self.headers = {
            "Content-Type": "application/json",
            "X-API-Key": self.api_key
        }

    def _post(self, endpoint: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        response = requests.post(url, json=payload, headers=self.headers)
        
        if not response.ok:
            raise Exception(f"API Error ({response.status_code}): {response.text}")
            
        return response.json()

    def start_incident(self, observation_time: str, scene_id: str, lat: float, lon: float) -> str:
        """
        Creates a new incident record in the database.
        Returns the new incident_id (e.g., 'INCIDENT_2025_001').
        """
        payload = {
            "observation_time": observation_time,
            "scene_id": scene_id,
            "latitude": lat,
            "longitude": lon,
            "crs": "EPSG:4326"
        }
        res = self._post("/incidents", payload)
        return res["id"]

    def submit_system1_results(self, incident_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Submits the output from System 1 (Slick Detection & Age Estimation).
        Data must include: slick_polygon, age_prediction, etc.
        """
        return self._post(f"/incidents/{incident_id}/system1", data)

    def submit_system2_results(self, incident_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Submits the output from System 2 (Drift Analysis).
        Data must include: age_interval_hours, particle_count, origin_contours.
        """
        return self._post(f"/incidents/{incident_id}/system2", data)

    def submit_system3_results(self, incident_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Submits the output from System 3 (Vessel Attribution).
        Keep this ready for when System 3 is finished.
        Data must include: candidates array with compatibility_score.
        """
        return self._post(f"/incidents/{incident_id}/system3", data)
