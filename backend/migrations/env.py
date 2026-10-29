from alembic import context

from app.core.config import get_settings
from app.db.base import Base
from app.db.session import create_database_engine
from app.models.project import Project  # noqa: F401

target_metadata = Base.metadata

if context.is_offline_mode():
    context.configure(
        url=get_settings().database_url.get_secret_value(),
        target_metadata=target_metadata, literal_binds=True,
    )
    with context.begin_transaction():
        context.run_migrations()
else:
    engine = create_database_engine(get_settings())
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()
    engine.dispose()
