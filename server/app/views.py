from flask import g
from flask.ext import restful
from flask.ext.restful import fields, marshal_with

from app import api, db, flask_bcrypt, auth
from models import User, Recipe
from forms import UserCreateForm, SessionCreateForm, RecipeCreateForm


@auth.verify_password
def verify_password(email, password):
    user = User.query.filter_by(email=email).first()
    if not user:
        return False
    g.user = user
    return flask_bcrypt.check_password_hash(user.password, password)


class UserView(restful.Resource):
    user_fields = {
        'id': fields.Integer,
        'email': fields.String
    }

    @marshal_with(user_fields)
    def post(self):
        form = UserCreateForm()
        if not form.validate_on_submit():
            print form.errors
            return form.errors, 422

        user = User(form.email.data, form.password.data)
        db.session.add(user)
        db.session.commit()
        return user

    @marshal_with(user_fields)
    def get(self):
        users = User.query.all()
        return users


class SessionView(restful.Resource):
    @marshal_with(UserView.user_fields)
    def post(self):
        form = SessionCreateForm()
        if not form.validate_on_submit():
            return form.errors, 422

        user = User.query.filter_by(email=form.email.data).first()
        if user and flask_bcrypt.check_password_hash(user.password,
                                                     form.password.data):
            return user, 201
        return '', 401


class RecipeListView(restful.Resource):
    recipe_fields = {
        'id': fields.Integer,
        'name': fields.String,
        'beer_type': fields.String,
        'user': fields.Nested(UserView.user_fields),
        'created_at': fields.DateTime
    }

    @marshal_with(recipe_fields)
    def get(self):
        recipes = Recipe.query.all()
        return recipes

    @auth.login_required
    @marshal_with(recipe_fields)
    def post(self):
        form = RecipeCreateForm()
        if not form.validate_on_submit():
            return form.errors, 422
        recipe = Recipe(form.name.data, form.beer_type.data)
        db.session.add(recipe)
        db.session.commit()
        return recipe, 201


class RecipeView(restful.Resource):
    @marshal_with(RecipeListView.recipe_fields)
    def get(self, id):
        recipes = Recipe.query.filter_by(id=id).first()
        return recipes

api.add_resource(UserView, '/api/v1/users')
api.add_resource(SessionView, '/api/v1/sessions')
api.add_resource(RecipeListView, '/api/v1/recipes')
api.add_resource(RecipeView, '/api/v1/recipes/<int:id>')
