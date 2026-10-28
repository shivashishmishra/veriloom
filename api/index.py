import sys
import os
import tempfile

# Insert backend directory to sys.path so app modules are resolvable on Vercel
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# On serverless platforms (like Vercel), the root filesystem is read-only.
# We redirect SQLite to the system temp directory so the database file can be created and seeded.
if not os.getenv("DATABASE_URL") or "sqlite" in os.getenv("DATABASE_URL", ""):
    tmp_db_path = os.path.join(tempfile.gettempdir(), "veriloom.db").replace(os.sep, "/")
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_db_path}"

from app.main import app

# Vercel's Python runtime requires the ASGI application callable named 'app'
# 'app' is imported from app.main
