
export default async function session(){
  const res = await fetch('/api/session')
  const { token } = await res.json()

  return token
}
