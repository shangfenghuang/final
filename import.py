import os
from gevent import pywsgi
import pandas as pd

from sqlalchemy import create_engine,text
from sqlalchemy.orm import scoped_session, sessionmaker


def create_users_table(db):
    db.execute(text("CREATE TABLE users(email VARCHAR PRIMARY KEY, passwd VARCHAR NOT NULL)"))
    print(db.commit())

def create_route_table(db):
    db.execute(text("CREATE TABLE routes(id INT PRIMARY KEY, email VARCHAR NOT NULL, Lng VARCHAR NOT NULL, Lat VARCHAR NOT NULL )"))



if __name__ == '__main__':
    # Check for environment variable
    # if not os.getenv("DATABASE_URL"):
    #     raise RuntimeError("DATABASE_URL is not set")
    # print(os.getenv("DATABASE_URL"))

    # Set up database
    # engine = create_engine(os.getenv("DATABASE_URL"))
    engine = create_engine('postgresql://shangfeng:shangfeng@18.117.98.140:5432/final')
    db = scoped_session(sessionmaker(bind=engine))
    print("Import finished")
    
    # create_users_table(db)
    create_route_table(db)