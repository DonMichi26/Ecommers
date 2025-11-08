import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-off-white dark:bg-charcoal text-charcoal/80 dark:text-off-white/80 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-charcoal dark:text-off-white">
              <span className="material-symbols-outlined text-2xl text-primary">chair</span>
              <h2 className="font-display text-xl font-bold">Furni.</h2>
            </div>
            <p className="text-sm">Creando espacios cómodos y hermosos para la vida moderna.</p>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Tienda</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <Link className="hover:text-primary" href="#">
                  Salón
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary" href="#">
                  Dormitorio
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary" href="#">
                  Comedor
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary" href="#">
                  Oficina
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Sobre Nosotros</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <Link className="hover:text-primary" href="#">
                  Quiénes Somos
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary" href="#">
                  Contacto
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary" href="#">
                  Preguntas Frecuentes
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Mantente Conectado</h5>
            <p className="text-sm mb-4">Únete a nuestro boletín para ofertas exclusivas e inspiración.</p>
            <form className="flex">
              <input
                className="form-input w-full rounded-l-md border-charcoal/20 dark:border-off-white/20 bg-white dark:bg-charcoal focus:ring-primary text-sm dark:text-white"
                placeholder="Tu email"
                type="email"
              />
              <button
                className="bg-primary text-white px-4 rounded-r-md font-semibold text-sm hover:bg-primary/90"
                type="submit"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-charcoal/10 dark:border-off-white/10 mt-8 pt-6 text-center text-sm">
          <p>© {new Date().getFullYear()} Furni. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

