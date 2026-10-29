from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.api.projects import get_session
from app.db.base import Base
from app.main import create_app


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    application = create_app()

    def session():
        with Session(engine) as db:
            yield db

    application.dependency_overrides[get_session] = session
    with TestClient(application) as test_client:
        yield test_client
    engine.dispose()


def test_project_crud(client):
    assert client.get("/api/projects").json() == []
    response = client.post("/api/projects", json={"name": "  Launch  "})
    assert response.status_code == 201
    project = response.json()
    assert project["name"] == "Launch"
    assert project["status"] == "draft"
    assert project["description"] == ""
    path = f"/api/projects/{project['id']}"
    assert client.get(path).json() == project
    assert client.get("/api/projects").json() == [project]
    updated = client.patch(path, json={"description": "New scope", "status": "active"})
    assert updated.status_code == 200
    assert updated.json()["name"] == "Launch"
    assert updated.json()["description"] == "New scope"
    assert updated.json()["status"] == "active"
    assert updated.json()["created_at"] == project["created_at"]
    assert updated.json()["updated_at"] >= project["updated_at"]
    assert client.patch(path, json={}).status_code == 200
    assert client.delete(path).status_code == 204
    assert client.get(path).status_code == 404
    assert client.get("/api/projects").json() == []


@pytest.mark.parametrize("payload", [
    {}, {"name": " "}, {"name": "x" * 201}, {"name": "Test", "status": "invalid"},
    {"name": "Test", "description": "x" * 10001}, {"name": "Test", "extra": "bad"},
])
def test_invalid_create(client, payload):
    assert client.post("/api/projects", json=payload).status_code == 422


@pytest.mark.parametrize("payload", [{"name": None}, {"description": None},
                                        {"status": None}, {"name": " "}])
def test_invalid_patch(client, payload):
    project = client.post("/api/projects", json={"name": "Valid"}).json()
    assert client.patch(f"/api/projects/{project['id']}", json=payload).status_code == 422


def test_missing_and_malformed_ids(client):
    path = f"/api/projects/{uuid4()}"
    assert client.get(path).json() == {"detail": "Project not found"}
    assert client.patch(path, json={"name": "Missing"}).status_code == 404
    assert client.delete(path).status_code == 404
    assert client.get("/api/projects/not-a-uuid").status_code == 422
    assert client.get("/api/projects?limit=101").status_code == 422
    assert client.get("/api/projects?offset=-1").status_code == 422


def test_pagination_and_all_statuses(client):
    for status in ["draft", "active", "completed", "archived"]:
        response = client.post("/api/projects", json={"name": status, "status": status})
        assert response.status_code == 201
    first = client.get("/api/projects?limit=2").json()
    second = client.get("/api/projects?limit=2&offset=2").json()
    assert len(first) == len(second) == 2
    assert {p["id"] for p in first}.isdisjoint({p["id"] for p in second})


def test_database_error_is_sanitized(client):
    def broken_session():
        raise OperationalError("secret SQL", {}, Exception("private password"))

    client.app.dependency_overrides[get_session] = broken_session
    response = client.get("/api/projects")
    assert response.status_code == 503
    assert response.json() == {"detail": "Database temporarily unavailable"}
