"""Carga el admin, las categorías y los productos. Es idempotente: se puede correr N veces."""

from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

CATEGORIAS = [
    ("Pizzas", "Pizzas al horno de barro"),
    ("Hamburguesas", "Hamburguesas artesanales con papas"),
    ("Empanadas", "Empanadas criollas al horno"),
    ("Bebidas", "Gaseosas, agua y cerveza"),
    ("Postres", "Dulces para cerrar la comida"),
]

# (categoría, nombre, descripción, precio, stock)
PRODUCTOS = [
    ("Pizzas", "Pizza Muzzarella", "Salsa de tomate, muzzarella y aceitunas", 8500.0, 20),
    ("Pizzas", "Pizza Napolitana", "Muzzarella, tomate fresco, ajo y albahaca", 9500.0, 15),
    ("Pizzas", "Pizza Fugazzeta", "Cebolla, muzzarella y orégano", 9200.0, 12),
    ("Hamburguesas", "Hamburguesa Clásica", "Carne, queso cheddar, lechuga y tomate", 7800.0, 25),
    ("Hamburguesas", "Hamburguesa Doble Bacon", "Doble carne, bacon crocante y cheddar", 10500.0, 18),
    ("Empanadas", "Empanada de Carne", "Carne cortada a cuchillo, cebolla y huevo", 1800.0, 60),
    ("Empanadas", "Empanada de Jamón y Queso", "Jamón cocido y muzzarella", 1700.0, 60),
    ("Bebidas", "Gaseosa Cola 500 ml", "Botella individual bien fría", 2000.0, 80),
    ("Bebidas", "Cerveza Rubia 473 ml", "Lata de cerveza rubia", 2800.0, 40),
    ("Postres", "Flan con Dulce de Leche", "Flan casero con crema", 3500.0, 10),
]


def seed() -> None:
    create_all_tables()
    with Session(engine) as session:
        if not session.exec(select(Usuario).where(Usuario.username == "admin")).first():
            session.add(
                Usuario(
                    username="admin",
                    full_name="Administrador",
                    email="admin@foodstore.com",
                    hashed_password=hash_password("Admin1234!"),
                    role="admin",
                )
            )

        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            cat = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if cat is None:
                cat = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(cat)
                session.flush()
            categorias[nombre] = cat

        for cat_nombre, nombre, descripcion, precio, stock in PRODUCTOS:
            existe = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if existe is None:
                session.add(
                    Producto(
                        categoria_id=categorias[cat_nombre].id,  # type: ignore[arg-type]
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        stock=stock,
                    )
                )
        session.commit()
    print("Seed listo: admin / Admin1234!, categorías y productos cargados.")


if __name__ == "__main__":
    seed()
