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

    def test_get_response(self):
        rv = self.app.get(self.addition_route)
        self.check_content_type(rv.headers)
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data)

        # make sure there are no recipes
        self.assertEqual(len(response), 0)

    def test_adding_hop(self):
        rec = Recipe.query.order_by(Recipe.name).first()
        hop = dict(name='hopZone',
                   brew_stage=3,
                   time=60,
                   recipe_id=rec.id)

        rv = self.app.post(
            self.hop_route,
            data=hop,
            headers=self.auth_headers
        )

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
