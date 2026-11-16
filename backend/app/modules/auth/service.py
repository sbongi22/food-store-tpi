from fastapi import HTTPException

from app.core.security import create_access_token, verify_password
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def login(self, username: str, password: str) -> str:
        """Devuelve el JWT. 401 si las credenciales fallan, 400 si la cuenta está desactivada."""
        with self.uow as uow:
            user = uow.usuarios.get_by_username(username)
            if user is None or not verify_password(password, user.hashed_password):
                raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
            if user.disabled:
                raise HTTPException(status_code=400, detail="Cuenta de usuario desactivada")
            return create_access_token(user.username)
