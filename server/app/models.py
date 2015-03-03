from flask import g
from wtforms.validators import Email
from app import db, flask_bcrypt
from sqlalchemy.dialects.mysql import INTEGER
from sqlalchemy.ext.hybrid import hybrid_property, hybrid_method
from decimal import Decimal
from math import ceil


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False,
                      info={'validators': Email()})
    password = db.Column(db.String(80), nullable=False)
    recipes = db.relationship('Recipe', backref='user', lazy='dynamic')
    equipment_profiles = db.relationship('EquipmentProfile',
                                         backref='user', lazy='dynamic')

    def __init__(self, email, password):
        self.email = email
        self.password = flask_bcrypt.generate_password_hash(password)

    def __repr__(self):
        return '<User %r>' % self.email


class EquipmentProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    name = db.Column(db.String(120), nullable=False)
    _trub_loss = db.Column(INTEGER)
    _equipment_loss = db.Column(INTEGER)
    _fermenter_loss = db.Column(INTEGER)

    gallon_ml_conversion_factor = Decimal(3785.411784)

    def __init__(self, user_id, name, trub_loss,
                 equipment_loss, fermenter_loss):
        self.user_id = user_id
        self.name = name
        self.trub_loss = trub_loss
        self.equipment_loss = equipment_loss
        self.fermenter_loss = fermenter_loss

    @hybrid_property
    def trub_loss(self):
        return self.mlToGallons(self._trub_loss)

    @trub_loss.setter
    def trub_loss(self, value):
        self._trub_loss = self.gallonsToMl(value)

    @hybrid_property
    def equipment_loss(self):
        return self.mlToGallons(self._equipment_loss)

    @equipment_loss.setter
    def equipment_loss(self, value):
        self._equipment_loss = self.gallonsToMl(value)

    @hybrid_property
    def fermenter_loss(self):
        return self.mlToGallons(self._fermenter_loss)

    @fermenter_loss.setter
    def fermenter_loss(self, value):
        self._fermenter_loss = self.gallonsToMl(value)

    def gallonsToMl(self, value):
        """Convert gallons to mililiters

        :param value: value to convert
        :returns: value in ml

        """
        return int(ceil(value * self.gallon_ml_conversion_factor))

    def mlToGallons(self, value):
        return round(
            Decimal(value / Decimal(self.gallon_ml_conversion_factor)), 2
        )


class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    beer_type = db.Column(db.String(120), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=db.func.now())
    additions = db.relationship("RecipeAddition", backref="recipe",
                                cascade='all, delete-orphan')

    def __init__(self, name, beer_type):
        self.name = name
        self.beer_type = beer_type
        self.user_id = g.user.id

    def __repr__(self):
        return '<Recipe %r>' % self.name


class Addition(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    addition_type = db.Column(db.String(50))

    __mapper_args__ = {'polymorphic_identity': 'addition',
                       'polymorphic_on': addition_type,
                       'with_polymorphic': '*'}

    def __repr__(self):
        return '<%r %r>' % (self.addition_type, self.name)

    def __init__(self, name):
        self.name = name


class Hop(Addition):
    id = db.Column(db.Integer, db.ForeignKey('addition.id'), primary_key=True)
    __mapper_args__ = {'polymorphic_identity': 'hop'}

    def __init__(self, name):
        self.name = name


class Grain(Addition):
    id = db.Column(db.Integer, db.ForeignKey('addition.id'), primary_key=True)
    __mapper_args__ = {'polymorphic_identity': 'grain'}

    def __init__(self, name):
        self.name = name


class RecipeAddition(db.Model):
    __tablename__ = 'recipeaddition'
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'))
    addition_id = db.Column(db.Integer, db.ForeignKey('addition.id'))

    time = db.Column(db.Integer)
    _amount = db.Column(INTEGER)  # Weight in mg
    addition_type = db.Column(db.String(50))
    name = db.Column(db.String(50))
    addition = db.relationship(Addition, lazy='joined')

    brew_stage = db.Column(db.Integer, default=0)

    def __init__(self, addition, amount, brew_stage, time):
        self.addition = addition
        self.addition_type = addition.addition_type
        self.brew_stage = brew_stage
        self.amount = amount
        self.time = time
        self.name = addition.name

    def __repr__(self):
        return '<%r %r %r>' % (self.addition_type, self.addition.name,
                               self.amount)

    @hybrid_property
    def amount(self):
        if self.addition_type == 'hop':
            return self.mgToOunces(self._amount)
        if self.addition_type == 'grain':
            return self.mgToPounds(self._amount)

    @amount.setter
    def amount(self, value):
        if self.addition_type == 'hop':
            self._amount = self.ouncesToMg(value)
        elif self.addition_type == 'grain':
            self._amount = self.poundsToMg(value)

    @hybrid_method
    def poundsToMg(self, value):
        """Convert grain lbs to mg

        :param value: value to convert
        :returns: value in mg

        """

        return int(ceil(value * Decimal(453592.37)))

    def ouncesToMg(self, value):
        """Convert grain ounces to mg

        :param value: value to convert
        :returns: value in mg

        """

        return int(ceil(value * Decimal(28349.5231)))

    @hybrid_method
    def mgToPounds(self, value):
        """Convert mg to pounds

        :param value: value to convert
        :returns: value in mg

        """

        return round(Decimal(value / Decimal(453592.37)), 2)

    @hybrid_method
    def mgToOunces(self, value):
        """Convert mg to ounces

        :param value: value to convert
        :returns: value in mg

        """

        return round(Decimal(value / Decimal(28350.5231)), 2)
