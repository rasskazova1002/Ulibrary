from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

sqlalchemy_database_url = 'sqlite:///./books.db'

engine = create_engine(sqlalchemy_database_url, connect_args={"check_same_thread": False})


session_local = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()


def get_db():
    db = session_local()
    try:
        yield db
    finally:
        db.close()