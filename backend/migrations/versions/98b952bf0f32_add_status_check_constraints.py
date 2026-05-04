"""add status check constraints

Revision ID: 98b952bf0f32
Revises: d9ed550be038
Create Date: 2026-05-03 20:45:11.033633

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '98b952bf0f32'
down_revision: Union[str, None] = 'd9ed550be038'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_check_constraint(
        "ck_interviews_status",
        "interviews",
        "status IN ('in_progress', 'completed')",
    )
    op.create_check_constraint(
        "ck_materials_status",
        "materials",
        "status IN ('processing', 'processed', 'failed')",
    )
    op.create_check_constraint(
        "ck_knowledge_entries_status",
        "knowledge_entries",
        "status IN ('draft', 'sme_approved', 'approved', 'rejected')",
    )


def downgrade() -> None:
    op.drop_constraint("ck_knowledge_entries_status", "knowledge_entries", type_="check")
    op.drop_constraint("ck_materials_status", "materials", type_="check")
    op.drop_constraint("ck_interviews_status", "interviews", type_="check")
