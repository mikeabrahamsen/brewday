import os
import unittest
from unittest import TestCase

import json
from config import basedir
from app import app, db


class UserRouteTests(TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + \
            os.path.join(basedir, 'test.db')

        # added this as it was still reading from app db
        db.session.remove()
        self.app = app.test_client()
        db.create_all()

        self.user_route = '/api/v1/users'

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def check_content_type(self, headers):
        self.assertEqual(headers['Content-Type'], 'application/json')

    def test_get_response(self):
        rv = self.app.get(self.user_route)
        self.check_content_type(rv.headers)
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data)

        # make sure there are no users
        self.assertEqual(len(response), 0)

    def test_adding_user(self):
        user_data = {'email': 'test@test.com', 'password': 'admin'}
        rv = self.app.post(self.user_route, data=user_data)
        self.check_content_type(rv.headers)

        rv = self.app.get(self.user_route)
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data)
        self.assertEqual(len(response), 1)

        # add a second user
        user_data = {'email': 'test2@test.com', 'password': 'admin'}
        rv = self.app.post(self.user_route, data=user_data)

        self.check_content_type(rv.headers)

        rv = self.app.get(self.user_route)
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data)
        self.assertEqual(len(response), 2)

        # test adding duplicate user
        user_data = {'email': 'test2@test.com', 'password': 'admin'}
        rv = self.app.post(self.user_route, data=user_data)

        # should recieve an error code 422
        self.assertEqual(rv.status_code, 422)
        self.check_content_type(rv.headers)

        # another user should not be in the database
        rv = self.app.get(self.user_route)
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data)
        self.assertEqual(len(response), 2)

if __name__ == '__main__':
        unittest.main()
