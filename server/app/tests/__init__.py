from app import app, db
from app.models import Grain, Hop
from grain_list import grain_list
from hop_list import hop_list


def init_grain_db():
    for grain in grain_list:
        db.session.add(Grain(grain[2], grain[1]))
    db.session.commit()


def init_hop_db():
    for j, hop in hop_list:
        db.session.add(Hop(hop))
    db.session.commit()
