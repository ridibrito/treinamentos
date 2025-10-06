import { redirect } from 'next/navigation'

export default function Home() {
  // Redireciona diretamente para login
  // O middleware cuidará de redirecionar para dashboard se já autenticado
  redirect('/login')
}
