import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.demo_data.seeder import seed_demo_workspace

# Import API routers
from app.api.auth import router as auth_router
from app.api.vault import router as vault_router
from app.api.submissions import router as submissions_router
from app.api.scans import router as scans_router
from app.api.visual import router as visual_router
from app.api.workflow import router as workflow_router
from app.api.analytics import router as analytics_router
from app.api.certificates import router as certificates_router
from app.api.demo import router as demo_router

# Initialize DB tables and seed demo workspace at startup
Base.metadata.create_all(bind=engine)
try:
    _db = SessionLocal()
    seed_demo_workspace(_db)
    _db.close()
except Exception as _e:
    pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Intelligent Brand-Governance & Content-Verification Studio",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(vault_router, prefix=settings.API_PREFIX)
app.include_router(submissions_router, prefix=settings.API_PREFIX)
app.include_router(scans_router, prefix=settings.API_PREFIX)
app.include_router(visual_router, prefix=settings.API_PREFIX)
app.include_router(workflow_router, prefix=settings.API_PREFIX)
app.include_router(analytics_router, prefix=settings.API_PREFIX)
app.include_router(certificates_router, prefix=settings.API_PREFIX)
app.include_router(demo_router, prefix=settings.API_PREFIX)

@app.get("/api/health")
def healthcheck():
    return {
        "status": "healthy",
        "database": "sqlite_connected" if settings.DATABASE_URL.startswith("sqlite") else "postgres_connected",
        "engine": "VeriLoom 6-Check Hybrid Verification Engine"
    }

# Mount static frontend production build if present
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "dist")
if os.path.exists(frontend_dist):
    from fastapi.responses import FileResponse

    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "name": settings.PROJECT_NAME,
            "version": settings.PROJECT_VERSION,
            "status": "online",
            "docs_url": "/docs",
            "workspace_badge": settings.DEMO_BADGE_TEXT
        }
