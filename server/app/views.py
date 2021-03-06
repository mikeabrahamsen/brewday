from flask import g
from flask.ext import restful
from flask.ext.restful import fields, marshal_with
from sqlalchemy.orm.exc import NoResultFound, FlushError

from app import api, db, flask_bcrypt, auth
from models import User, Recipe, Hop, Grain, RecipeAddition, EquipmentProfile
from forms import (
    UserCreateForm,
    SessionCreateForm,
    RecipeCreateForm,
    RecipeAdditionCreateForm,
    RecipeUpdateForm,
    EquipmentProfileForm,
    RecipeAdditionUpdateForm
)


@auth.verify_password
def verify_password(email, password):
    user = User.query.filter_by(email=email).first()
    if not user:
        return False
    g.user = user
    return flask_bcrypt.check_password_hash(user.password, password)


user_fields = {
    'id': fields.Integer,
    'email': fields.String
}


class UserView(restful.Resource):
    @marshal_with(user_fields)
    def post(self):
        form = UserCreateForm()
        if not form.validate_on_submit():
            return form.errors, 422

        user = User(form.email.data, form.password.data)

        db.session.add(user)
        db.session.commit()

        # create default equipment profile
        equipment_profile = EquipmentProfile(user.id,
                                             'Default Profile', 0.5, 1.0, 0.0)
        db.session.add(equipment_profile)
        db.session.commit()
        return user

    @marshal_with(user_fields)
    def get(self):
        users = User.query.all()
        return users


class SessionView(restful.Resource):
    @marshal_with(user_fields)
    def post(self):
        form = SessionCreateForm()
        if not form.validate_on_submit():
            return form.errors, 422

        user = User.query.filter_by(email=form.email.data).first()
        if user and flask_bcrypt.check_password_hash(user.password,
                                                     form.password.data):
            return user, 201
        return '', 401

equipment_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'trubLoss': fields.Float,
    'equipmentLoss': fields.Float,
    'fermenterLoss': fields.Float,
}


recipe_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'beer_type': fields.String,
    'equipment_profile': fields.Nested(equipment_fields),
    'user': fields.Nested(user_fields),
    'created_at': fields.DateTime('iso8601')
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
        recipe = Recipe(form.name.data, form.beer_type.data,
                        form.equipment_id.data)
        db.session.add(recipe)
        db.session.commit()
        return recipe, 201


class RecipeView(restful.Resource):
    @auth.login_required
    @marshal_with(recipe_fields)
    def get(self, id):
        recipe = Recipe.query.filter_by(user_id=g.user.id, id=id).one()

        try:
            equipment_profile = EquipmentProfile.query.filter_by(
                user_id=g.user.id,
                id=recipe.equipment_id).one()
        except NoResultFound:
            equipment_profile = EquipmentProfile.query.filter_by(
                user_id=g.user.id,
                name='Default Profile').one()

        recipe.equipment_profile = equipment_profile
        return recipe

    @auth.login_required
    @marshal_with(recipe_fields)
    def put(self, id):
        form = RecipeUpdateForm()
        if not form.validate_on_submit():
            return form.errors, 422
        recipe = Recipe.query.filter_by(user_id=g.user.id, id=id).one()
        recipe.name = form.name.data
        recipe.beer_type = form.beer_type.data
        recipe.equipment_id = form.equipment_id.data
        db.session.commit()

        return recipe, 201

    @auth.login_required
    @marshal_with(recipe_fields)
    def delete(self, id):
        try:
            recipe = Recipe.query.filter_by(id=id).one()

            # delete the recipe
            db.session.delete(recipe)
            db.session.commit()

            return '', 204
        except NoResultFound:
            db.session.rollback()


recipe_addition_fields = {
    'id': fields.Integer,
    'addition_id': fields.Integer,
    'name': fields.String,
    'addition_type': fields.String,
    'brew_stage': fields.Integer,
    'time': fields.Integer,
    'amount': fields.Float,  # so we can send decimals after conversions
    'recipe_id': fields.Integer,
    'region': fields.String
}

addition_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'region': fields.String
}


def delete_recipe_addition(recipe_id, ra_id):
    """Remove an addition from a recipe

    :param recipe_id: recipe id that the addition is part of
    :param addition_id: addition to be deleted
    :returns: 204 response

    """
    try:
        old_ra = RecipeAddition.query.filter_by(id=ra_id).one()

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


def update_recipe_addition(addition_type, ra_id, addition_id,
                           recipe_id, amount, brew_stage, time):
    try:
        old_ra = RecipeAddition.query.filter_by(id=ra_id).one()
        addition = addition_type.query.filter_by(id=addition_id).one()

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
        return '%s does not exist' % addition_id, 400
    except FlushError:
        db.session.rollback()
        return '%s already exist' % addition_id, 400


def add_recipe_addition(addition_type, addition_id,
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
        addition = addition_type.query.filter_by(id=addition_id).one()
        recipe = Recipe.query.filter_by(id=recipe_id).one()
        exists = RecipeAddition.query.filter_by(addition_id=addition.id,
                                                recipe_id=recipe_id,
                                                time=time,
                                                brew_stage=brew_stage).first()
        if not exists:
            ra = RecipeAddition(addition, amount, brew_stage, time)

            addition = recipe.additions.append(ra)
            db.session.commit()
            return addition, 201

        else:
            return 'Addition already exist', 400

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
            form.addition_id.data,
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

    @auth.login_required
    @marshal_with(recipe_addition_fields)
    def post(self, recipe_id):
        form = RecipeAdditionCreateForm()
        if not form.validate_on_submit():
            return form.errors, 422
        response, response_code = add_recipe_addition(
            Grain,
            form.addition_id.data,
            recipe_id,
            form.amount.data,
            form.brew_stage.data,
            form.time.data
        )

        return response, response_code


class GrainRecipeView(restful.Resource):
    @marshal_with(recipe_addition_fields)
    def put(self, recipe_id, ra_id):
        form = RecipeAdditionUpdateForm()
        if not form.validate_on_submit():
            return form.errors, 422
        response, response_code = update_recipe_addition(
            Grain, ra_id, form.addition_id.data,
            recipe_id, form.amount.data,
            form.brew_stage.data, form.time.data
        )

        return response, response_code

    @auth.login_required
    @marshal_with(recipe_addition_fields)
    def delete(self, recipe_id, ra_id):
        response, response_code = delete_recipe_addition(recipe_id, ra_id)
        return response, response_code


class HopRecipeView(restful.Resource):
    @marshal_with(recipe_addition_fields)
    def put(self, recipe_id, ra_id):
        form = RecipeAdditionUpdateForm()
        if not form.validate_on_submit():
            return form.errors, 422
        response, response_code = update_recipe_addition(
            Hop, ra_id, form.addition_id.data,
            recipe_id, form.amount.data,
            form.brew_stage.data, form.time.data
        )

        return response, response_code

    @auth.login_required
    @marshal_with(recipe_addition_fields)
    def delete(self, recipe_id, ra_id):
        response, response_code = delete_recipe_addition(recipe_id, ra_id)
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
            addition_type, form.addition_id.data, recipe_id, form.amount.data,
            form.brew_stage.data, form.time.data
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
    def put(self, recipe_id, ra_id):
        form = RecipeAdditionCreateForm()
        if not form.validate_on_submit():
            return form.errors, 422
        if form.addition_type.data == 'grain':
            addition_type = Grain
        elif form.addition_type.data == 'hop':
            addition_type = Hop
        response, response_code = update_recipe_addition(
            addition_type, ra_id, form.addition_id.data,
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


class EquipmentProfileList(restful.Resource):
    @auth.login_required
    @marshal_with(equipment_fields)
    def get(self):
        equipment_profiles = EquipmentProfile.query.filter_by(
            user_id=g.user.id).all()
        return equipment_profiles

    @auth.login_required
    @marshal_with(equipment_fields)
    def post(self):
        form = EquipmentProfileForm()
        if not form.validate_on_submit():
            return form.errors, 422

        profile = EquipmentProfile(
            g.user.id,
            form.name.data,
            form.trubLoss.data,
            form.equipmentLoss.data,
            form.fermenterLoss.data
        )
        db.session.add(profile)
        db.session.commit()
        return profile, 201


class EquipmentProfileView(restful.Resource):
    @auth.login_required
    @marshal_with(equipment_fields)
    def get(self, id):
        equipment_profile = EquipmentProfile.query.filter_by(
            user_id=g.user.id, id=id).one()
        return equipment_profile

    @auth.login_required
    @marshal_with(equipment_fields)
    def put(self, id):
        form = EquipmentProfileForm()
        if not form.validate_on_submit():
            return form.errors, 422

        profile = EquipmentProfile.query.filter_by(
            user_id=g.user.id, id=id).one()
        profile.name = form.name.data
        profile.trubLoss = form.trubLoss.data
        profile.equipmentLoss = form.equipmentLoss.data
        profile.fermenterLoss = form.fermenterLoss.data
        db.session.add(profile)
        db.session.commit()
        return profile, 201

    @auth.login_required
    @marshal_with(equipment_fields)
    def delete(self, id):
        try:
            profile = EquipmentProfile.query.filter_by(id=id).one()

            # delete the profile
            db.session.delete(profile)
            db.session.commit()

            return '', 204
        except NoResultFound:
            db.session.rollback()


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
    GrainRecipeView, '/api/v1/recipes/<int:recipe_id>/grains/<int:ra_id>'
)
api.add_resource(
    HopRecipeView, '/api/v1/recipes/<int:recipe_id>/hops/<int:ra_id>'
)
api.add_resource(
    RecipeAdditionView,
    '/api/v1/recipes/<int:recipe_id>/additions/<int:id>'
)
api.add_resource(EquipmentProfileList, '/api/v1/equipment')
api.add_resource(EquipmentProfileView,
                 '/api/v1/equipment/<int:id>'
                 )
