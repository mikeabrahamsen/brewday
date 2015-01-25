from flask import g

from wtforms.validators import Email

from app import db, flask_bcrypt


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

    def __init__(self, name, beer_type):
        self.name = name
        self.beer_type = beer_type
        self.user_id = g.user.id

    def __repr__(self):
        return '<Recipe %r>' % self.name


class Addition(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    addition_type = db.Column(db.String(50))
    brew_stage = db.Column(db.Integer)
    time = db.Column(db.Integer, default=0)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'))
    __mapper_args__ = {'polymorphic_identity': 'addition',
                       'polymorphic_on': addition_type,
                       'with_polymorphic': '*'}

    def __init__(self, brew_stage, time, recipe_id):
        self.brew_stage = brew_stage
        self.time = time
        self.recipe_id = recipe_id

    def __repr__(self):
        return '<Addition %r, %d %d>' % (self.addition_type,
                                         self.brew_stage,
                                         self.time)


class Hop(Addition):
    id = db.Column(db.Integer, db.ForeignKey('addition.id'), primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    __mapper_args__ = {'polymorphic_identity': 'hop'}

    def __init__(self, name, brew_stage, time, recipe_id):
        self.name = name
        self.brew_stage = brew_stage
        self.time = time
        self.recipe_id = recipe_id


class Grain(Addition):
    id = db.Column(db.Integer, db.ForeignKey('addition.id'), primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    __mapper_args__ = {'polymorphic_identity': 'grain'}
