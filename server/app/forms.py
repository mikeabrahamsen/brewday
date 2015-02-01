from flask.ext.wtf import Form

from wtforms_alchemy import model_form_factory
from wtforms import StringField, DecimalField
from wtforms.validators import DataRequired

from app import db
from models import User, Recipe, Hop, Grain, RecipeAddition

BaseModelForm = model_form_factory(Form)


class ModelForm(BaseModelForm):
    @classmethod
    def get_session(self):
        return db.session


class UserCreateForm(ModelForm):
    class Meta:
        model = User


class SessionCreateForm(Form):
    email = StringField('email', validators=[DataRequired()])
    password = StringField('password', validators=[DataRequired()])


class RecipeCreateForm(ModelForm):
    class Meta:
        model = Recipe


class RecipeUpdateForm(ModelForm):
    class Meta:
        model = Recipe
        include = ['id']


class HopCreateForm(ModelForm):
    class Meta:
        model = Hop


class GrainCreateForm(ModelForm):
    class Meta:
        model = Grain


class RecipeAdditionCreateForm(ModelForm):
    class Meta:
        model = RecipeAddition
        include = ['time']
    name = StringField('name')
    amount = DecimalField('amount')
