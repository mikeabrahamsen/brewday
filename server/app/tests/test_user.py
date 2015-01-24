import os
import unittest
from unittest import TestCase

import json
from config import basedir
from app import app, db
from app.models import User


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

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def check_content_type(self, headers):
        self.assertEqual(headers['Content-Type'], 'application/json')

    def test_get_response(self):
        rv = self.app.get('/api/v1/users')
        self.check_content_type(rv.headers)
        self.assertEqual(rv.status_code, 200)

        response = json.loads(rv.data)

        # make sure there are no users
        self.assertEqual(len(response), 0)

    def test_adding_user(self):
        user_data = {'email': 'test@test.com', 'password': 'admin'}
        rv = self.app.post('/api/v1/users',data=user_data)
        self.check_content_type(rv.headers)

        rv = self.app.get('/api/v1/users')
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data)
        self.assertEqual(len(response), 1)

if __name__ == '__main__':
        unittest.main()
