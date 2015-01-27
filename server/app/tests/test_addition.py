import base64
from unittest import TestCase

import json
from app import app, db
from app.models import User, Addition


class AdditionTests(TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite://'

        # added this as it was still reading from app db
        db.session.remove()
        self.app = app.test_client()
        db.create_all()

        self.recipe_route = '/api/v1/recipes'
        self.addition_route = '/api/v1/recipes/1/additions'
        self.hop_route = '/api/v1/recipes/1/additions/hops'
        self.grain_route = '/api/v1/recipes/1/additions/grains'

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

    def replace_recipe_id(self, route, recipe_id):
        return route.replace('/1', '/' + str(recipe_id))

    def add_addition(self, route, name, brew_stage, time, amount, recipe_id=1):
        if recipe_id != 1:
            route = self.replace_recipe_id(route, recipe_id)

        hop = dict(name=name,
                   brew_stage=brew_stage,
                   time=time,
                   amount=amount,
                   )

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
        self.add_addition(self.hop_route, 'Goldings', 2, 60, 1)

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

        self.add_addition(self.hop_route, 'Kent', 2, 45, 1)
        self.add_addition(self.hop_route, 'Contennial', 2, 45, 1)

        rv = self.app.get(self.hop_route)
        self.check_content_type(rv.headers)
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data)

        # check that we now have more hops added
        self.assertEqual(len(response), 3)

    def test_adding_grain(self):
        self.add_addition(self.grain_route, 'American Two-Row', 0, 60,1)

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

        self.add_addition(self.grain_route, 'Crystal 60', 0, 60,1)
        self.add_addition(self.grain_route, 'Crystal 120', 0, 60,1)

        rv = self.app.get(self.grain_route)
        self.check_content_type(rv.headers)
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data)

        # check that we now have more grains added
        self.assertEqual(len(response), 3)

    def test_using_different_recipes(self):
        recipe = {'name': 'Chocolate Stout', 'beer_type': 'Stout'}
        self.app.post(
            self.recipe_route,
            data=recipe,
            headers=self.auth_headers
        )
        rv = self.app.get(self.recipe_route, headers=self.auth_headers)
        response = json.loads(rv.data)

        # check that we now have 2 recipes
        self.assertEqual(len(response), 2)

        self.add_addition(self.grain_route, 'Crystal 60', 0, 60, 1, 2)
        self.add_addition(self.grain_route, 'Crystal 40', 0, 40, 1, 2)

        rv = self.app.get(self.grain_route)
        self.check_content_type(rv.headers)
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data)

        # check that no grains have been added to the first recipe
        self.assertEqual(len(response), 0)

        grain_route = self.replace_recipe_id(self.grain_route, 2)
        rv = self.app.get(grain_route)
        self.check_content_type(rv.headers)
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data)

        # check that there are 2 grains added to the second recipe
        self.assertEqual(len(response), 2)

    def test_grain_conversions(self):
        self.add_addition(self.grain_route, 'Crystal 60', 0, 60, 1.5)

        # check the correct values are being stored in the database
        # and that getting the amount property does the conversion
        addition = Addition.query.first()
        self.assertEqual(addition.amount, 1.5)
        self.assertEqual(addition._amount, 680389)

        rv = self.app.get(self.grain_route)
        response = json.loads(rv.data)
        # flask-restful returns a string so check against a float
        amount = float(response[0]['amount'])

        self.assertEqual(amount, 1.5)

    def test_hop_conversions(self):
        self.add_addition(self.hop_route, 'Goldings', 2, 60, 1.75)

        # check the correct values are being stored in the database
        # and that getting the amount property does the conversion
        addition = Addition.query.first()
        self.assertEqual(addition.amount, 1.75)
        self.assertEqual(addition._amount, 49612)

        rv = self.app.get(self.hop_route)
        response = json.loads(rv.data)
        amount = float(response[0]['amount'])

        self.assertEqual(amount, 1.75)
