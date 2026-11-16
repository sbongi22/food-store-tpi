from sqlalchemy import func
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def search(
        self,
        skip: int,
        limit: int,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, list[Producto]]:
        """Productos activos filtrados. Devuelve (total, página)."""
        condiciones = [col(Producto.activo).is_(True)]
        if search:
            condiciones.append(col(Producto.nombre).ilike(f"%{search}%"))
        if categoria_id is not None:
            condiciones.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            condiciones.append(Producto.disponible == disponible)
        total = self.session.exec(select(func.count()).select_from(Producto).where(*condiciones)).one()
        items = self.session.exec(
            select(Producto).where(*condiciones).order_by(Producto.id).offset(skip).limit(limit)
        ).all()
        return total, list(items)
