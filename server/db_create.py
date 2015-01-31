from app import db
from app.models import Grain, Hop
from grain_list import grain_list
from hop_list import hop_list

db.create_all()

# Check the grain and hop count in the database
# if the hop or grain files have changed update the database
grain_db_count = Grain.query.count()
hop_db_count = Hop.query.count()

if len(grain_list) != grain_db_count:
    Grain.query.delete()
    for i, grain in grain_list:
        db.session.add(Grain(grain))

if len(hop_list) != hop_db_count:
    Hop.query.delete()
    for j, hop in hop_list:
        db.session.add(Hop(hop))

db.session.commit()
