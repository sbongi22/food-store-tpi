from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.deps import AdminUser, CurrentUser
from app.modules.pedidos.schemas import (
    CambioEstado,
    Estado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]

REGLAS_400 = (StockInsuficiente, ProductoNoDisponible, ProductoRepetido, TransicionInvalida)


@router.post("", response_model=PedidoRead, status_code=201)
def crear_pedido(data: PedidoCreate, user: CurrentUser, service: ServiceDep) -> PedidoRead:
    try:
        return service.crear(user.id, data)  # type: ignore[arg-type]
    except ProductoNoEncontrado:
        raise HTTPException(status_code=404, detail="Producto no encontrado o dado de baja")
    except REGLAS_400 as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    user: CurrentUser,
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: Estado | None = None,
) -> PedidosPaginados:
    return service.listar(user.id, user.role == "admin", skip, limit, estado)  # type: ignore[arg-type]


# Se declara antes de /{pedido_id}: si no, "resumen" se leería como un id
@router.get("/resumen", response_model=ResumenPedidos)
def resumen(admin: AdminUser, service: ServiceDep) -> ResumenPedidos:
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(pedido_id: int, user: CurrentUser, service: ServiceDep) -> PedidoRead:
    try:
        return service.obtener(pedido_id, user.id, user.role == "admin")  # type: ignore[arg-type]
    except PedidoNoEncontrado:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    except PedidoAjeno:
        raise HTTPException(status_code=403, detail="Ese pedido pertenece a otro usuario")


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(
    pedido_id: int, data: CambioEstado, admin: AdminUser, service: ServiceDep
) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except PedidoNoEncontrado:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    except TransicionInvalida as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(pedido_id: int, user: CurrentUser, service: ServiceDep) -> PedidoRead:
    try:
        return service.cancelar_propio(pedido_id, user.id)  # type: ignore[arg-type]
    except PedidoNoEncontrado:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    except PedidoAjeno:
        raise HTTPException(status_code=403, detail="Ese pedido pertenece a otro usuario")
    except TransicionInvalida as e:
        raise HTTPException(status_code=400, detail=str(e))
