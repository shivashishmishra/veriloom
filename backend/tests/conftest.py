import pytest
from app.database import engine, Base, SessionLocal
from app.demo_data.seeder import seed_demo_workspace

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_demo_workspace(db)
    finally:
        db.close()
