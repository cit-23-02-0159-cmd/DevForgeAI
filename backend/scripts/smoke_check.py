"""Check a running stack without requiring a healthy database.

Usage: python scripts/smoke_check.py --api http://localhost:8000 --web http://localhost:3000
"""

import argparse
import json
from urllib.error import HTTPError
from urllib.request import urlopen


def fetch(url: str) -> tuple[int, str]:
    try:
        with urlopen(url, timeout=10) as response:
            return response.status, response.read().decode()
    except HTTPError as error:
        return error.code, error.read().decode()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--api", default="http://localhost:8000")
    parser.add_argument("--web", default="http://localhost:3000")
    args = parser.parse_args()
    assert fetch(f"{args.api}/health/live") == (200, '{"status":"alive"}')
    code, body = fetch(f"{args.api}/health")
    assert code in (200, 503)
    health = json.loads(body)
    assert health["status"] == ("healthy" if code == 200 else "degraded")
    assert health["database"] == ("connected" if code == 200 else "unavailable")
    assert fetch(f"{args.api}/docs")[0] == 200
    assert "/health" in json.loads(fetch(f"{args.api}/openapi.json")[1])["paths"]
    page_code, page = fetch(args.web)
    assert page_code == 200 and "Build what comes next." in page
    proxy_code, proxy = fetch(f"{args.web}/api/health")
    assert proxy_code == code and json.loads(proxy) == health
    print(f"Stack smoke check passed: dashboard 200, API and proxy {code}, docs 200.")


if __name__ == "__main__":
    main()
