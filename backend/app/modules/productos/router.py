from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response

from app.core.deps import AdminUser
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["Productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


ServiceDep = Annotated[ProductoService, Depends(get_producto_service)]

NO_PRODUCTO = "Producto no encontrado"
NO_CATEGORIA = "La categoría no existe o está dada de baja"


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: str | None = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
) -> ProductosPaginados:
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: int, service: ServiceDep) -> ProductoRead:
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado:
        raise HTTPException(status_code=404, detail=NO_PRODUCTO)


@router.post("", response_model=ProductoRead, status_code=201)
def crear_producto(data: ProductoCreate, admin: AdminUser, service: ServiceDep) -> ProductoRead:
    try:
        return service.crear(data)
    except CategoriaNoEncontrada:
        raise HTTPException(status_code=404, detail=NO_CATEGORIA)


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(
    producto_id: int, data: ProductoUpdate, admin: AdminUser, service: ServiceDep
) -> ProductoRead:
    try:
        return service.actualizar(producto_id, data)
    except ProductoNoEncontrado:
        raise HTTPException(status_code=404, detail=NO_PRODUCTO)
    except CategoriaNoEncontrada:
        raise HTTPException(status_code=404, detail=NO_CATEGORIA)


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def cambiar_stock(
    producto_id: int, data: ProductoStockUpdate, admin: AdminUser, service: ServiceDep
) -> ProductoRead:
    try:
        return service.cambiar_stock(producto_id, data)
    except ProductoNoEncontrado:
        raise HTTPException(status_code=404, detail=NO_PRODUCTO)


@router.delete("/{producto_id}", status_code=204)
def eliminar_producto(producto_id: int, admin: AdminUser, service: ServiceDep) -> Response:
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado:
        raise HTTPException(status_code=404, detail=NO_PRODUCTO)
    return Response(status_code=204)
