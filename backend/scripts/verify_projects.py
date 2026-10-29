"""Exercise Projects against the configured PostgreSQL database, cleaning up afterward.

Run from backend/ after alembic upgrade head. No running API process is required.
"""
from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import create_app


def main():
    with TestClient(create_app()) as client:
        assert client.get("/health").status_code == 200
        response = client.post("/api/projects", json={"name": f"Verification {uuid4()}"})
        assert response.status_code == 201, "Project creation failed"
        path = f"/api/projects/{response.json()['id']}"
        try:
            assert client.get(path).status_code == 200
            assert client.get("/api/projects").status_code == 200
            response = client.patch(path, json={"status": "completed", "description": "Verified"})
            assert response.status_code == 200
            assert response.json()["status"] == "completed"
        finally:
            assert client.delete(path).status_code == 204
        assert client.get(path).status_code == 404
    print("PostgreSQL project CRUD and health verified; temporary project removed.")


if __name__ == "__main__":
    main()
