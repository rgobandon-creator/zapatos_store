import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AdminUsers() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at')
    setProfiles(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function changeRole(profile, role) {
    await supabase.from('profiles').update({ role }).eq('id', profile.id)
    load()
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-espresso mb-2">Usuarios</h1>
      <p className="text-sm text-ink/50 mb-6">
        Para agregar a alguien nuevo al equipo, créalo primero en Supabase →
        Authentication → Users. Aparecerá aquí automáticamente como
        "empleado".
      </p>

      {loading && <p className="text-ink/50 font-display italic">Cargando…</p>}

      <div className="space-y-2">
        {profiles.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between border border-stitch bg-white px-4 py-3"
          >
            <div className="min-w-0">
              <p className="font-medium truncate">{p.full_name || p.email}</p>
              <p className="text-xs text-ink/50 truncate">{p.email}</p>
            </div>
            <select
              value={p.role}
              disabled={p.id === user.id}
              onChange={(e) => changeRole(p, e.target.value)}
              className="border border-espresso/20 px-2 py-1 text-sm bg-white disabled:opacity-40"
            >
              <option value="admin">Admin</option>
              <option value="empleado">Empleado</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}
