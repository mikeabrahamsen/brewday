from app import app, db
from flask.ext.script import Manager
from flask.ext.migrate import Migrate, MigrateCommand


migrate = Migrate(app, db)

manager = Manager(app)


@manager.command
def run():
    app.run(host='0.0.0.0', debug=False)

manager.add_command('db', MigrateCommand)


if __name__ == "__main__":
    manager.run()
