"""Convenience entry point for seeding demo data from scripts directory."""

import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from seed_db import seed_all

if __name__ == "__main__":
    seed_all()
