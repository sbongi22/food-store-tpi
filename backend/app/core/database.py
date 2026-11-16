from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

_connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=_connect_args)


def session_factory() -> Session:
    """Crea una sesión nueva. Solo la usa el Unit of Work."""
    return Session(engine)


def create_all_tables() -> None:
    # Importar los modelos registra las tablas en SQLModel.metadata
    from app.modules.categorias import models as _c  # noqa: F401
    from app.modules.pedidos import models as _pe  # noqa: F401
    from app.modules.productos import models as _pr  # noqa: F401
    from app.modules.usuarios import models as _u  # noqa: F401

    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Sesión por petición, solo para las dependencias de autenticación."""
    with Session(engine) as session:
        yield session
