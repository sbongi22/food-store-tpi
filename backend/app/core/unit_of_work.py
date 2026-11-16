from collections.abc import Callable
from types import TracebackType
from typing import Self

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Abre la sesión al entrar; hace commit o rollback y cierra al salir.

    Las subclases crean sus repositorios en `_create_repositories`.
    """

    session: Session

    def __init__(self, factory: Callable[[], Session] = session_factory) -> None:
        self._factory = factory

    def _create_repositories(self) -> None:
        """Las subclases crean aquí los repositorios sobre self.session."""

    def __enter__(self) -> Self:
        self.session = self._factory()
        self._create_repositories()
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
