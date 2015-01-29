from flask import g
from flask.ext import restful
from flask.ext.restful import fields, marshal_with

from app import api, db, flask_bcrypt, auth
from models import User, Recipe, Hop, Grain, RecipeAddition
from forms import (
    UserCreateForm,
    SessionCreateForm,
    RecipeCreateForm,
    HopCreateForm,
    GrainCreateForm,
    RecipeAdditionCreateForm,
)


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


recipe_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'beer_type': fields.String,
    'user': fields.Nested(UserView.user_fields),
    'created_at': fields.DateTime
}


class RecipeListView(restful.Resource):
    @auth.login_required
    @marshal_with(recipe_fields)
    def get(self):
        recipes = Recipe.query.filter_by(user_id=g.user.id).all()
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
    @auth.login_required
    @marshal_with(recipe_fields)
    def get(self, id):
        recipes = Recipe.query.filter_by(user_id=g.user.id, id=id).one()
        return recipes


addition_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'addition_type': fields.String,
    'brew_stage': fields.Integer,
    'time': fields.Integer,
    'amount': fields.Fixed,  # so we can send decimals after conversions
    'recipe_id': fields.Integer,
}


class AdditionListView(restful.Resource):
    @marshal_with(addition_fields)
    def get(self, recipe_id):
        additions = RecipeAddition.query.filter_by(recipe_id=recipe_id).all()
        return additions


class HopListView(restful.Resource):
    @marshal_with(addition_fields)
    def get(self, recipe_id):
        hops = RecipeAddition.query.filter_by(recipe_id=recipe_id,
                                              addition_type='hop').all()
        print hops
        return hops

    @auth.login_required
    @marshal_with(addition_fields)
    def post(self, recipe_id):
        form = RecipeAdditionCreateForm()
        if not form.validate_on_submit():
            return form.errors, 422
        # TODO Use select form to pass in hop id
        hop = Hop.query.filter_by(name=form.name.data).one()
        recipe = Recipe.query.filter_by(id=recipe_id).one()
        ra = RecipeAddition(hop, form.amount.data,
                            form.brew_stage.data, form.time.data)

        addition = recipe.additions.append(ra)
        db.session.commit()
        return addition, 201


class GrainListView(restful.Resource):
    @marshal_with(addition_fields)
    def get(self, recipe_id):
        grains = RecipeAddition.query.filter_by(recipe_id=recipe_id,
                                                addition_type='grain').all()
        return grains

    @auth.login_required
    @marshal_with(addition_fields)
    def post(self, recipe_id):
        form = RecipeAdditionCreateForm()
        if not form.validate_on_submit():
            return form.errors, 422
        grain = Grain.query.filter_by(name=form.name.data).one()
        recipe = Recipe.query.filter_by(id=recipe_id).one()
        ra = RecipeAddition(grain, form.amount.data,
                            form.brew_stage.data, form.time.data)

        addition = recipe.additions.append(ra)
        db.session.commit()
        return addition, 201

api.add_resource(UserView, '/api/v1/users')
api.add_resource(SessionView, '/api/v1/sessions')
api.add_resource(RecipeListView, '/api/v1/recipes')
api.add_resource(RecipeView, '/api/v1/recipes/<int:id>')
api.add_resource(AdditionListView, '/api/v1/recipes/<int:recipe_id>/additions')
api.add_resource(HopListView, '/api/v1/recipes/<int:recipe_id>/hops')
api.add_resource(
    GrainListView, '/api/v1/recipes/<int:recipe_id>/grains'
)
