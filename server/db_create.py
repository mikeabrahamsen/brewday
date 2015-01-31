from app import db
from app.models import Grain
from grain_list import grain_list

db.create_all()

for i, grain in grain_list:
    db.session.add(Grain(grain))

db.session.commit()
