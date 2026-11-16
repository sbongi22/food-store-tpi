from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response

from app.core.deps import AdminUser
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["Categorías"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(service: ServiceDep) -> list[CategoriaRead]:
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(categoria_id: int, service: ServiceDep) -> CategoriaRead:
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")


@router.post("", response_model=CategoriaRead, status_code=201)
def crear_categoria(data: CategoriaCreate, admin: AdminUser, service: ServiceDep) -> CategoriaRead:
    try:
        return service.crear(data)
    except NombreDuplicado:
        raise HTTPException(status_code=409, detail="Ya existe una categoría con ese nombre")


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar_categoria(
    categoria_id: int, data: CategoriaUpdate, admin: AdminUser, service: ServiceDep
) -> CategoriaRead:
    try:
        return service.actualizar(categoria_id, data)
    except CategoriaNoEncontrada:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    except NombreDuplicado:
        raise HTTPException(status_code=409, detail="Ya existe una categoría con ese nombre")


@router.delete("/{categoria_id}", status_code=204)
def eliminar_categoria(categoria_id: int, admin: AdminUser, service: ServiceDep) -> Response:
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return Response(status_code=204)
