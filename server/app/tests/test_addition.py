import os
import base64
from unittest import TestCase

import json
from config import basedir
from app import app, db
from app.models import User, Recipe


class RecipeRouteTests(TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + \
            os.path.join(basedir, 'test.db')

        # added this as it was still reading from app db
        db.session.remove()
        self.app = app.test_client()
        db.create_all()

        self.recipe_route = '/api/v1/recipes'
        self.addition_route = '/api/v1/additions'
        self.hop_route = '/api/v1/additions/hops'
        self.grain_route = '/api/v1/additions/grains'

        self.email = 'test@test.com'
        self.password = 'admin'
        u = User(email=self.email, password=self.password)
        db.session.add(u)
        db.session.commit()

        self.auth_headers = {'Authorization': 'Basic ' +
                             base64.b64encode(self.email + ":" + self.password)
                             }
        self.recipe = {'name': 'Amazing Irish', 'beer_type': 'Irish Red'}
        self.app.post(
            self.recipe_route,
            data=self.recipe,
            headers=self.auth_headers
        )

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def check_content_type(self, headers):
        self.assertEqual(headers['Content-Type'], 'application/json')

    def add_addition(self, route, name, brew_stage, time):
        rec = Recipe.query.order_by(Recipe.name).first()
        hop = dict(name=name,
                   brew_stage=brew_stage,
                   time=time,
                   recipe_id=rec.id)

        rv = self.app.post(
            route,
            data=hop,
            headers=self.auth_headers
        )
        return rv



    def test_get_response(self):
        rv = self.app.get(self.addition_route)
        self.check_content_type(rv.headers)
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data)

        # make sure there are no recipes
        self.assertEqual(len(response), 0)


    def test_adding_hop(self):
        self.add_addition(self.hop_route,'Goldings', 2, 60)

        rv = self.app.get(self.addition_route)
        self.check_content_type(rv.headers)
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data)

        # check that we now have an addition
        self.assertEqual(len(response), 1)

        rv = self.app.get(self.hop_route)
        self.check_content_type(rv.headers)
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data)

        # check that we now have a hop added
        self.assertEqual(len(response), 1)

        self.add_addition(self.hop_route,'Kent', 2, 45)
        self.add_addition(self.hop_route,'Contennial', 2, 45)

        rv = self.app.get(self.hop_route)
        self.check_content_type(rv.headers)
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data)

        # check that we now have more hops added
        self.assertEqual(len(response), 3)

    def test_adding_grain(self):
        self.add_addition(self.grain_route,'American Two-Row', 0, 60)

        rv = self.app.get(self.addition_route)
        self.check_content_type(rv.headers)
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data)

        # check that we now have an addition
        self.assertEqual(len(response), 1)

        rv = self.app.get(self.grain_route)
        self.check_content_type(rv.headers)
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data)

        # check that we now have a grain added
        self.assertEqual(len(response), 1)


        self.add_addition(self.grain_route,'Crystal 60', 0, 60)
        self.add_addition(self.grain_route,'Crystal 120', 0, 60)

        rv = self.app.get(self.grain_route)
        self.check_content_type(rv.headers)
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data)

        # check that we now have more grains added
        self.assertEqual(len(response), 3)
