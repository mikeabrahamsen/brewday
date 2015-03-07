"""empty message

Revision ID: 1a840fa7da89
Revises: 4e7e1fbca3ce
Create Date: 2015-03-06 20:45:54.447798

"""

# revision identifiers, used by Alembic.
revision = '1a840fa7da89'
down_revision = '4e7e1fbca3ce'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('recipe', sa.Column('equipment_id', sa.Integer(), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('recipe', 'equipment_id')
    ### end Alembic commands ###
