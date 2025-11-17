import { redirect } from 'next/navigation'

// Esta página ahora redirige al catálogo
export default function FurnitureCollectionPage() {
  redirect('/catalogo')
}