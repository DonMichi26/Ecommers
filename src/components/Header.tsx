import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-solid border-charcoal/10 dark:border-off-white/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between whitespace-nowrap px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-charcoal dark:text-off-white">
            <span className="material-symbols-outlined text-2xl text-primary">chair</span>
            <h2 className="font-display text-xl font-bold leading-tight tracking-tight">Furni.</h2>
          </Link>
          <nav className="hidden md:flex items-center gap-9">
            <Link
              className="text-charcoal dark:text-off-white text-sm font-medium leading-normal hover:text-primary dark:hover:text-primary"
              href="#"
            >
              Salón
            </Link>
            <Link
              className="text-charcoal dark:text-off-white text-sm font-medium leading-normal hover:text-primary dark:hover:text-primary"
              href="#"
            >
              Dormitorio
            </Link>
            <Link
              className="text-charcoal dark:text-off-white text-sm font-medium leading-normal hover:text-primary dark:hover:text-primary"
              href="#"
            >
              Comedor
            </Link>
            <Link
              className="text-charcoal dark:text-off-white text-sm font-medium leading-normal hover:text-primary dark:hover:text-primary"
              href="#"
            >
              Oficina
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 justify-end items-center gap-4">
          <label className="hidden sm:flex flex-col min-w-40 !h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-charcoal/60 dark:text-off-white/60 flex border border-r-0 border-charcoal/20 dark:border-off-white/20 bg-transparent items-center justify-center pl-3 rounded-l-lg">
                <span className="material-symbols-outlined !text-xl">search</span>
              </div>
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-charcoal dark:text-off-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-l-0 border-charcoal/20 dark:border-off-white/20 bg-transparent h-full placeholder:text-charcoal/60 dark:placeholder:text-off-white/60 px-4 rounded-l-none text-sm font-normal leading-normal"
                placeholder="Buscar"
                type="search"
              />
            </div>
          </label>
          <div className="flex gap-2">
            <button
              className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-transparent text-charcoal dark:text-off-white hover:bg-charcoal/5 dark:hover:bg-off-white/5 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
              aria-label="Perfil"
            >
              <span className="material-symbols-outlined">person</span>
            </button>
            <button
              className="relative flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-transparent text-charcoal dark:text-off-white hover:bg-charcoal/5 dark:hover:bg-off-white/5 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
              aria-label="Carrito de compras"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sienna text-xs font-bold text-white">
                2
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

