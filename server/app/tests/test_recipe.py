import base64
from unittest import TestCase

import json
from app import app, db
from app.models import User


class RecipeRouteTests(TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite://'

        # added this as it was still reading from app db
        db.session.remove()
        self.app = app.test_client()
        db.create_all()

        self.recipe_route = '/api/v1/recipes'

        self.email = 'test@test.com'
        self.password = 'admin'
        u = User(email=self.email, password=self.password)
        db.session.add(u)
        db.session.commit()
        self.auth_headers = {'Authorization': 'Basic ' +
                             base64.b64encode(self.email + ":" + self.password)
                             }

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def add_recipe(self, recipe, headers=None):
        if headers is None:
            headers = self.auth_headers
        rv = self.app.post(
            self.recipe_route,
            data=recipe,
            headers=headers
        )
        return rv

    def check_content_type(self, headers):
        self.assertEqual(headers['Content-Type'], 'application/json')

    def test_get_response(self):
        rv = self.app.get(self.recipe_route, headers=self.auth_headers)
        self.check_content_type(rv.headers)
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data)

        # make sure there are no recipes
        self.assertEqual(len(response), 0)

    def test_adding_recipe(self):
        recipe = {'name': 'Amazing Irish', 'beer_type': 'Irish Red'}
        rv = self.add_recipe(recipe)

        rv = self.app.get(self.recipe_route, headers=self.auth_headers)
        self.check_content_type(rv.headers)
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data)

        # check that we now have a recipe
        self.assertEqual(len(response), 1)

    def test_recipe_belongs_to_user(self):
        email = 'admin@admin.com'
        password = 'admin'
        u = User(email=email, password=password)
        db.session.add(u)
        db.session.commit()
        admin_auth_headers = {
            'Authorization': 'Basic ' +
            base64.b64encode(email + ":" + password)
        }

        recipe = {'name': 'Chocolate Stout', 'beer_type': 'Irish Red'}
        self.add_recipe(recipe, admin_auth_headers)

        # check there are no recipes for default user
        rv = self.app.get(self.recipe_route, headers=self.auth_headers)
        response = json.loads(rv.data)
        self.assertEqual(len(response), 0)

        # check new user has a recipe
        rv = self.app.get(self.recipe_route, headers=admin_auth_headers)
        response = json.loads(rv.data)
        self.assertEqual(len(response), 1)

    def test_specifig_recipe_get(self):
        recipe = {'name': 'Chocolate Stout', 'beer_type': 'Irish Red'}
        self.add_recipe(recipe, self.auth_headers)

        rv = self.app.get(self.recipe_route + '/1', headers=self.auth_headers)
        response = json.loads(rv.data)
        self.assertEqual(response["name"], 'Chocolate Stout')
