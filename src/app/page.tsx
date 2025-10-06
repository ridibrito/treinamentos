export default function Home() {
  // Esta página nunca será vista pois o middleware redireciona automaticamente
  // para /login ou /dashboard dependendo do estado de autenticação
  return null
}
