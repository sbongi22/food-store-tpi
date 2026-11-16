from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.deps import AdminUser
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios (admin)"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


ServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]


@router.get("", response_model=list[UserPublic])
def listar_usuarios(admin: AdminUser, service: ServiceDep) -> list[UserPublic]:
    return service.listar()


@router.post("/{user_id}/activar", response_model=UserPublic)
def activar_usuario(user_id: int, admin: AdminUser, service: ServiceDep) -> UserPublic:
    return service.cambiar_estado(user_id, disabled=False, actor_id=admin.id)


@router.post("/{user_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(user_id: int, admin: AdminUser, service: ServiceDep) -> UserPublic:
    return service.cambiar_estado(user_id, disabled=True, actor_id=admin.id)
