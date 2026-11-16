from datetime import datetime

from sqlalchemy import func
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def list_page(
        self, skip: int, limit: int, usuario_id: int | None = None, estado: str | None = None
    ) -> tuple[int, list[Pedido]]:
        """Pedidos del usuario (o todos si usuario_id es None), del más nuevo al más viejo."""
        condiciones = []
        if usuario_id is not None:
            condiciones.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            condiciones.append(Pedido.estado == estado)
        total = self.session.exec(select(func.count()).select_from(Pedido).where(*condiciones)).one()
        items = self.session.exec(
            select(Pedido).where(*condiciones).order_by(col(Pedido.id).desc()).offset(skip).limit(limit)
        ).all()
        return total, list(items)

    def list_by_usuario(self, usuario_id: int) -> list[Pedido]:
        return list(self.session.exec(select(Pedido).where(Pedido.usuario_id == usuario_id)).all())

    def count_by_estado(self) -> dict[str, int]:
        rows = self.session.exec(select(Pedido.estado, func.count()).group_by(Pedido.estado)).all()
        return {estado: cantidad for estado, cantidad in rows}

    def count_desde(self, desde: datetime) -> int:
        return self.session.exec(
            select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        ).one()

    def sum_total_por_estado(self, estado: str) -> float:
        suma = self.session.exec(
            select(func.coalesce(func.sum(Pedido.total), 0.0)).where(Pedido.estado == estado)
        ).one()
        return float(suma)
