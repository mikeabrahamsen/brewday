import unittest
import base64
import json

from unittest import TestCase

from app import app, db
from app.models import EquipmentProfile, User


class EquipmentProfileModelTests(TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite://'

        # added this as it was still reading from app db
        db.session.remove()
        self.app = app.test_client()
        db.create_all()
        self.equipment_route = '/api/v1/equipment'
        self.user_route = '/api/v1/users'

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

    def check_content_type(self, headers):
        self.assertEqual(headers['Content-Type'], 'application/json')

    def test_default_profile_exists(self):
        user_data = {'email': 'test@wondertest.com', 'password': 'admin'}
        rv = self.app.post(self.user_route, data=user_data)
        self.check_content_type(rv.headers)

        e = EquipmentProfile.query.all()
        rv = self.app.get(self.user_route)
        self.assertEqual(rv.status_code, 200)
        response = json.loads(rv.data)
        self.assertEqual(len(response), 2)
        self.assertNotEqual(e, [])
        self.assertEqual(e[0].name, 'Default Profile')
        self.assertEqual(e[0].trubLoss, 0.5)

    def test_creating_equipment_profile(self):
        profile = EquipmentProfile(1, 'mpro', 1, 1, 1)
        self.assertEqual(profile.name, 'mpro')
        self.assertEqual(profile.user_id, 1)

        self.assertEqual(profile.trubLoss, 1)
        self.assertEqual(profile.equipmentLoss, 1)
        self.assertEqual(profile.fermenterLoss, 1)

        self.assertEqual(profile._fermenter_loss, 3786)
        self.assertEqual(profile._equipment_loss, 3786)
        self.assertEqual(profile._trub_loss, 3786)

    def test_submitting_profile(self):
        profile_data = {'name': 'test',
                        'trubLoss': 1,
                        'equipmentLoss': 1,
                        'fermenterLoss': 1,
                        }
        rv = self.app.post(self.equipment_route, data=profile_data,
                           headers=self.auth_headers)
        self.check_content_type(rv.headers)
        self.assertEqual(rv.status_code, 201)

        profiles = self.app.get(self.equipment_route,
                                headers=self.auth_headers)
        self.assertEqual(profiles.status_code, 200)
        response = json.loads(profiles.data)
        self.assertEqual(len(response), 1)

    def test_profile_list(self):
        profile_data = {'name': 'test',
                        'trubLoss': 1,
                        'equipmentLoss': 1,
                        'fermenterLoss': 1,
                        }
        self.app.post(self.equipment_route, data=profile_data,
                      headers=self.auth_headers)

        profiles = self.app.get(self.equipment_route,
                                headers=self.auth_headers)
        self.assertEqual(profiles.status_code, 200)
        response = json.loads(profiles.data)
        self.assertEqual(len(response), 1)

        profile_data['name'] = 'test2'
        self.app.post(self.equipment_route, data=profile_data,
                      headers=self.auth_headers)

        profiles = self.app.get(self.equipment_route,
                                headers=self.auth_headers)
        self.assertEqual(profiles.status_code, 200)
        response = json.loads(profiles.data)
        self.assertEqual(len(response), 2)
        self.assertEqual(response[0]['name'], 'test')
        self.assertEqual(response[1]['name'], 'test2')

    def test_single_get(self):
        profile_data = {'name': 'stainless',
                        'trubLoss': 11,
                        'equipmentLoss': 410000,
                        'fermenterLoss': 1.5,
                        }
        self.app.post(self.equipment_route, data=profile_data,
                      headers=self.auth_headers)

        profile = self.app.get(self.equipment_route + '/1',
                               headers=self.auth_headers)
        response = json.loads(profile.data)
        self.assertEqual(response['name'], 'stainless')
        self.assertEqual(response['trubLoss'], 11)
        self.assertEqual(response['equipmentLoss'], 410000)

    def test_put(self):
        profile_data = {'name': 'test',
                        'trubLoss': 1,
                        'equipmentLoss': 1,
                        'fermenterLoss': 1,
                        }
        self.app.post(self.equipment_route, data=profile_data,
                      headers=self.auth_headers)
        profile_data['name'] = 'test_put'
        profile_data['equipmentLoss'] = 42
        rv = self.app.put(self.equipment_route + '/1',
                          data=profile_data,
                          headers=self.auth_headers)

        self.check_content_type(rv.headers)
        self.assertEqual(rv.status_code, 201)

        profile = self.app.get(self.equipment_route + '/1',
                               headers=self.auth_headers)
        response = json.loads(profile.data)
        self.assertEqual(response['name'], 'test_put')
        self.assertEqual(response['equipmentLoss'], 42)
        self.assertEqual(response['fermenterLoss'], 1)
        self.assertEqual(response['trubLoss'], 1)

    def test_delete(self):
        profile_data = {'name': 'test',
                        'trubLoss': 1,
                        'equipmentLoss': 1,
                        'fermenterLoss': 1,
                        }
        self.app.post(self.equipment_route, data=profile_data,
                      headers=self.auth_headers)
        self.app.post(self.equipment_route, data=profile_data,
                      headers=self.auth_headers)

        profiles = self.app.get(self.equipment_route,
                                headers=self.auth_headers)
        response = json.loads(profiles.data)
        self.assertEqual(len(response), 2)

        delete = self.app.delete(self.equipment_route + '/1',
                                 headers=self.auth_headers)

        self.assertEqual(delete.status_code, 204)
        self.assertEqual(delete.data, '')

        profiles = self.app.get(self.equipment_route,
                                headers=self.auth_headers)
        response = json.loads(profiles.data)
        self.assertEqual(len(response), 1)

if __name__ == '__main__':
    unittest.main()
