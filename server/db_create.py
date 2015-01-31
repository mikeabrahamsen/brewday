from app import db
from app.models import Grain, Hop
from grain_list import grain_list
from hop_list import hop_list

db.create_all()

for i, grain in grain_list:
    db.session.add(Grain(grain))

for j, hop in hop_list:
    db.session.add(Hop(hop))

db.session.commit()
