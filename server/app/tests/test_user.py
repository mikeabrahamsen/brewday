import os
from flask import Flask
from unittest import TestCase

import nose2
from nose2.tools import *

import json
from flask.ext.sqlalchemy import SQLAlchemy
from config import basedir
from app import app, db
from app.models import User


class UserRouteTests(TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'test.db')
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

        admin = User('admin@admin.com', 'admin')
        db.session.add(admin)
        db.session.commit()

        rv = self.app.get('/api/v1/users')
        self.check_content_type(rv.headers)
        self.assertEqual(rv.status_code, 200)

        response = json.loads(rv.data)

        print(response)
        # make sure there are no users
        self.assertEqual(len(response), 1)

if __name__ == '__main__':
        unittest.main()
