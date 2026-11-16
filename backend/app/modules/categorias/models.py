from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True)
    descripcion: str | None = None
    activo: bool = Field(default=True)

    productos: list["Producto"] = Relationship(back_populates="categoria")
