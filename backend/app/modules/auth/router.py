from typing import Annotated

from fastapi import APIRouter, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import CurrentUser
from app.modules.auth.schemas import Message
from app.modules.auth.service import AuthService
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.post("/register", response_model=UserPublic, status_code=201)
def register(
    data: UserCreate, service: Annotated[UsuarioService, Depends(get_usuario_service)]
) -> UserPublic:
    return service.registrar(data)


@router.post("/token", response_model=Message)
def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> Message:
    token = service.login(form.username, form.password)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,  # el JavaScript del navegador no puede leerla
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return Message(message="Login exitoso")


@router.post("/logout", response_model=Message)
def logout(response: Response) -> Message:
    response.delete_cookie("access_token", path="/")
    return Message(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(current_user: CurrentUser) -> UserPublic:
    return UserPublic.model_validate(current_user)
