from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

from app.core.config import Settings
from app.db.session import database_is_ready
from app.main import create_app


def test_healthy_database_returns_200():
    with TestClient(create_app()) as client:
        with patch("app.api.health.database_is_ready", return_value=True):
            response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert response.json()["database"] == "connected"
    assert response.headers["cache-control"] == "no-store"


def test_database_outage_returns_503_without_secrets():
    with TestClient(create_app()) as client:
        with patch("app.api.health.database_is_ready", return_value=False):
            response = client.get("/health")
    assert response.status_code == 503
    assert response.json()["status"] == "degraded"
    assert response.json()["database"] == "unavailable"
    assert "postgresql" not in response.text


def test_liveness_does_not_require_database():
    with TestClient(create_app()) as client:
        assert client.get("/health/live").json() == {"status": "alive"}


def test_cors_allows_only_configured_origin():
    with TestClient(create_app(Settings(cors_origins=["http://localhost:3000"]))) as client:
        allowed = client.options("/health", headers={
            "Origin": "http://localhost:3000", "Access-Control-Request-Method": "GET",
        })
        denied = client.options("/health", headers={
            "Origin": "https://untrusted.example", "Access-Control-Request-Method": "GET",
        })
    assert allowed.status_code == 200
    assert allowed.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert denied.status_code == 400
    assert "access-control-allow-origin" not in denied.headers


def test_database_probe_executes_query_and_closes_connection():
    engine = MagicMock()
    assert database_is_ready(engine)
    connection = engine.connect.return_value.__enter__.return_value
    assert str(connection.execute.call_args.args[0]) == "SELECT 1"
    engine.connect.return_value.__exit__.assert_called_once()


def test_database_probe_handles_connection_failure():
    engine = MagicMock()
    engine.connect.side_effect = OperationalError("SELECT 1", {}, Exception("private detail"))
    assert database_is_ready(engine) is False
