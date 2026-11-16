import { Link } from 'react-router-dom'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Button } from '@/shared/ui/Button'

export function UnauthorizedPage() {
  return (
    <EstadoVacio
      titulo="No tenés permiso para ver esta pantalla"
      descripcion="Si creés que es un error, ingresá con otra cuenta."
      accion={
        <Link to="/">
          <Button>Volver al inicio</Button>
        </Link>
      }
    />
  )
}
