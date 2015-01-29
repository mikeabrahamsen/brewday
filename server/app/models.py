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

    def __init__(self, email, password):
        self.email = email
        self.password = flask_bcrypt.generate_password_hash(password)

    def __repr__(self):
        return '<User %r>' % self.email


class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    beer_type = db.Column(db.String(120), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=db.func.now())
    additions = db.relationship("RecipeAddition", backref="recipe")

    def __init__(self, name, beer_type):
        self.name = name
        self.beer_type = beer_type
        self.user_id = g.user.id

    def __repr__(self):
        return '<Recipe %r>' % self.name


class Addition(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    addition_type = db.Column(db.String(50))

    __mapper_args__ = {'polymorphic_identity': 'addition',
                       'polymorphic_on': addition_type,
                       'with_polymorphic': '*'}

    def __repr__(self):
        return '<%r %r>' % self.addition_type, self.name


class Hop(Addition):
    id = db.Column(db.Integer, db.ForeignKey('addition.id'), primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    __mapper_args__ = {'polymorphic_identity': 'hop'}

    def __init__(self, name):
        self.name = name


class Grain(Addition):
    id = db.Column(db.Integer, db.ForeignKey('addition.id'), primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    __mapper_args__ = {'polymorphic_identity': 'grain'}

    def __init__(self, name):
        self.name = name


class RecipeAddition(db.Model):
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'),
                          primary_key=True)
    addition_id = db.Column(db.Integer, db.ForeignKey('addition.id'),
                            primary_key=True)

    time = db.Column(db.Integer, primary_key=True)
    _amount = db.Column(INTEGER, primary_key=True)  # Weight in mg
    addition_type = db.Column(db.String(50))
    name = db.Column(db.String(50))
    addition = db.relationship(Addition, lazy='joined')

    brew_stage = db.Column(db.Integer, default=0)

    def __init__(self, addition, amount, brew_stage, time):
        self.addition = addition
        self.addition_type = addition.addition_type
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
