from flask import g
from flask.ext import restful
from flask.ext.restful import fields, marshal_with
from sqlalchemy.orm.exc import NoResultFound, FlushError

from app import api, db, flask_bcrypt, auth
from models import User, Recipe, Hop, Grain, RecipeAddition
from forms import (
    UserCreateForm,
    SessionCreateForm,
    RecipeCreateForm,
    RecipeAdditionCreateForm,
    RecipeUpdateForm,
    RecipeAdditionUpdateForm
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

    @auth.login_required
    @marshal_with(recipe_fields)
    def put(self, id):
        form = RecipeUpdateForm()
        if not form.validate_on_submit():
            return form.errors, 422
        recipe = Recipe.query.filter_by(user_id=g.user.id, id=id).one()
        recipe.name = form.name.data
        recipe.beer_type = form.beer_type.data
        db.session.commit()

        return recipe, 201


recipe_addition_fields = {
    'addition_id': fields.Integer,
    'name': fields.String,
    'addition_type': fields.String,
    'brew_stage': fields.Integer,
    'time': fields.Integer,
    'amount': fields.Float,  # so we can send decimals after conversions
    'recipe_id': fields.Integer,
}

addition_fields = {
    'id': fields.Integer,
    'name': fields.String
}


def delete_recipe_addition(recipe_id, addition_id):
    """Remove an addition from a recipe

    :param recipe_id: recipe id that the addition is part of
    :param addition_id: addition to be deleted
    :returns: 204 response

    """
    try:
        old_ra = RecipeAddition.query.filter_by(
            recipe_id=recipe_id, addition_id=addition_id).one()

        recipe = Recipe.query.filter_by(id=recipe_id).one()

        # delete the recipe addition
        recipe.additions.remove(old_ra)
        db.session.commit()

        return '', 204
    except NoResultFound:
        db.session.rollback()
        return '%s does not exist' % recipe, 400
    except FlushError:
        db.session.rollback()
        return '%s already exist' % recipe, 400


def update_recipe_addition(addition_type, addition_id, addition_name,
                           recipe_id, amount, brew_stage, time):
    try:
        old_ra = RecipeAddition.query.filter_by(recipe_id=recipe_id,
                                                addition_id=addition_id,
                                                time=time
                                                ).one()
        addition = addition_type.query.filter_by(name=addition_name).one()

        # create the new recipe addition
        ra = RecipeAddition(addition, amount, brew_stage, time)

        recipe = Recipe.query.filter_by(id=recipe_id).one()

        # delete the old recipe addition and append the new one
        recipe.additions.remove(old_ra)
        recipe.additions.append(ra)
        db.session.commit()

        return ra, 201
    except NoResultFound:
        db.session.rollback()
        return '%s does not exist' % addition_name, 400
    except FlushError:
        db.session.rollback()
        return '%s already exist' % addition_name, 400


def add_recipe_addition(addition_type, addition_name,
                        recipe_id, amount, brew_stage, time):
    """Add a an addition to the database

    :param addition_type: type ie Grain or Hop
    :param addition_name: name of addition
    :param recipe_id: id the addition will be added to
    :param amount: weight of addition
    :param brew_stage: mash / boil / fermentation
    :param time: time the addition is added
    :returns: the addition and a response code

    """
    try:
        addition = addition_type.query.filter_by(name=addition_name).one()
        recipe = Recipe.query.filter_by(id=recipe_id).one()
        ra = RecipeAddition(addition, amount, brew_stage, time)

        addition = recipe.additions.append(ra)
        db.session.commit()
        return addition, 201

    except NoResultFound:
        db.session.rollback()
        return 'Addition does not exist', 400
    except FlushError:
        db.session.rollback()
        return 'Addition already exist', 400


class HopListView(restful.Resource):
    @marshal_with(addition_fields)
    def get(self):
        hops = Hop.query.all()

        return hops


class GrainListView(restful.Resource):
    @marshal_with(addition_fields)
    def get(self):
        grains = Grain.query.all()

        return grains


class HopRecipeListView(restful.Resource):
    @marshal_with(recipe_addition_fields)
    def get(self, recipe_id):
        hops = RecipeAddition.query.filter_by(recipe_id=recipe_id,
                                              addition_type='hop').all()
        return hops

    @marshal_with(recipe_addition_fields)
    def put(self, recipe_id):
        form = RecipeAdditionUpdateForm()
        if not form.validate_on_submit():
            return form.errors, 422
        response, response_code = update_recipe_addition(
            Hop, form.addition_id.data, form.name.data,
            recipe_id, form.amount.data,
            form.brew_stage.data, form.time.data
        )

        return response, response_code

    @auth.login_required
    @marshal_with(recipe_addition_fields)
    def post(self, recipe_id):
        form = RecipeAdditionCreateForm()
        if not form.validate_on_submit():
            return form.errors, 422
        response, response_code = add_recipe_addition(
            Hop,
            form.name.data,
            recipe_id,
            form.amount.data,
            form.brew_stage.data,
            form.time.data
        )

        return response, response_code


class GrainRecipeListView(restful.Resource):
    @marshal_with(recipe_addition_fields)
    def get(self, recipe_id):
        grains = RecipeAddition.query.filter_by(recipe_id=recipe_id,
                                                addition_type='grain').all()
        return grains

    @marshal_with(recipe_addition_fields)
    def put(self, recipe_id):
        form = RecipeAdditionUpdateForm()
        if not form.validate_on_submit():
            return form.errors, 422
        response, response_code = update_recipe_addition(
            Grain, form.addition_id.data, form.name.data,
            recipe_id, form.amount.data,
            form.brew_stage.data, form.time.data
        )

        return response, response_code

    @auth.login_required
    @marshal_with(recipe_addition_fields)
    def post(self, recipe_id):
        form = RecipeAdditionCreateForm()
        if not form.validate_on_submit():
            return form.errors, 422
        response, response_code = add_recipe_addition(
            Grain,
            form.name.data,
            recipe_id,
            form.amount.data,
            form.brew_stage.data,
            form.time.data
        )

        return response, response_code


class AdditionListView(restful.Resource):
    @marshal_with(addition_fields)
    def get(self, recipe_id):
        additions = RecipeAddition.query.filter_by(recipe_id=recipe_id).all()
        return additions

    @auth.login_required
    @marshal_with(recipe_addition_fields)
    def post(self, recipe_id, addition_type="none"):
        form = RecipeAdditionCreateForm()
        if not form.validate_on_submit():
            return form.errors, 422
        if form.addition_type.data == 'grain':
            addition_type = Grain
        elif form.addition_type.data == 'hop':
            addition_type = Hop

        response, response_code = add_recipe_addition(
            addition_type, form.name.data, recipe_id, form.brew_stage.data,
            form.time.data
        )
        return response, response_code


class RecipeAdditionView(restful.Resource):

    @marshal_with(recipe_addition_fields)
    def get(self, recipe_id, addition_id):
        addition = RecipeAddition.query.filter_by(
            recipe_id=recipe_id, addition_id=addition_id
        ).one()
        return addition

    @auth.login_required
    @marshal_with(recipe_addition_fields)
    def put(self, recipe_id, addition_id):
        form = RecipeAdditionCreateForm()
        if not form.validate_on_submit():
            return form.errors, 422
        if form.addition_type.data == 'grain':
            addition_type = Grain
        elif form.addition_type.data == 'hop':
            addition_type = Hop
        response, response_code = update_recipe_addition(
            addition_type, addition_id, form.name.data,
            recipe_id, form.amount.data,
            form.brew_stage.data, form.time.data
        )

        return response, response_code

    @auth.login_required
    @marshal_with(recipe_addition_fields)
    def delete(self, recipe_id, addition_id):
        try:
            old_ra = RecipeAddition.query.filter_by(
                recipe_id=recipe_id, addition_id=addition_id
            ).one()

            recipe = Recipe.query.filter_by(id=recipe_id).one()

            # delete the recipe addition
            recipe.additions.remove(old_ra)
            db.session.commit()

            return '', 204
        except NoResultFound:
            db.session.rollback()
            return '%s does not exist' % recipe, 400
        except FlushError:
            db.session.rollback()
            return '%s already exist' % recipe, 400

api.add_resource(UserView, '/api/v1/users')
api.add_resource(SessionView, '/api/v1/sessions')
api.add_resource(RecipeListView, '/api/v1/recipes')
api.add_resource(RecipeView, '/api/v1/recipes/<int:id>')
api.add_resource(GrainListView, '/api/v1/grains')
api.add_resource(HopListView, '/api/v1/hops')
api.add_resource(AdditionListView, '/api/v1/recipes/<int:recipe_id>/additions')
api.add_resource(HopRecipeListView, '/api/v1/recipes/<int:recipe_id>/hops')
api.add_resource(
    GrainRecipeListView, '/api/v1/recipes/<int:recipe_id>/grains'
)
api.add_resource(
    RecipeAdditionView,
    '/api/v1/recipes/<int:recipe_id>/additions/<int:addition_id>'
)
