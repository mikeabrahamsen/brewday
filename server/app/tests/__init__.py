from app import app, db
from app.models import Grain
from grain_list import grain_list


def init_grain_db():
    for i, grain in grain_list:
        db.session.add(Grain(grain))
    db.session.commit()
