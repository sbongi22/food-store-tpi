from fastapi import HTTPException

from app.core.security import hash_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    """Alta de usuarios y baja lógica. En este módulo se admite HTTPException."""

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username) or uow.usuarios.get_by_email(data.email):
                raise HTTPException(status_code=409, detail="El username o el email ya existen")
            user = Usuario(
                username=data.username,
                full_name=data.full_name,
                email=data.email,
                hashed_password=hash_password(data.password),
                role="user",  # el registro público nunca crea admins
            )
            uow.usuarios.add(user)
            return UserPublic.model_validate(user)

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_all()]

    def cambiar_estado(self, user_id: int, disabled: bool, actor_id: int | None) -> UserPublic:
        with self.uow as uow:
            user = uow.usuarios.get_by_id(user_id)
            if user is None:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            if disabled and user.id == actor_id:
                raise HTTPException(status_code=400, detail="No podés desactivarte a vos mismo")
            user.disabled = disabled  # idempotente: 200 aunque no cambie
            uow.usuarios.add(user)
            return UserPublic.model_validate(user)
