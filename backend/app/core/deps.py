from collections.abc import Callable
from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.database import get_session
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario

SessionDep = Annotated[Session, Depends(get_session)]


def get_current_user(
    session: SessionDep,
    access_token: Annotated[str | None, Cookie()] = None,
) -> Usuario:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado"
    )
    if not access_token:
        raise credentials_error
    username = decode_access_token(access_token)
    if username is None:
        raise credentials_error
    user = session.exec(select(Usuario).where(Usuario.username == username)).first()
    if user is None:
        raise credentials_error
    return user


def get_current_active_user(
    current_user: Annotated[Usuario, Depends(get_current_user)],
) -> Usuario:
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Cuenta de usuario desactivada")
    return current_user


def require_role(roles: list[str]) -> Callable[..., Usuario]:
    def checker(user: Annotated[Usuario, Depends(get_current_active_user)]) -> Usuario:
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="No tenés permiso para esta acción")
        return user

    return checker


CurrentUser = Annotated[Usuario, Depends(get_current_active_user)]
AdminUser = Annotated[Usuario, Depends(require_role(["admin"]))]
