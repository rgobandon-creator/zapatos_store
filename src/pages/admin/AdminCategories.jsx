import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient.js'

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [error, setError] = useState(null)

  async function load() {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  async function addCategory(e) {
    e.preventDefault()
    setError(null)
    const { error } = await supabase
      .from('categories')
      .insert({ name, slug: slugify(name) })
    if (error) {
      setError(error.message)
      return
    }
    setName('')
    load()
  }

  async function remove(category) {
    if (
      !confirm(
        `¿Borrar "${category.name}"? Los productos de esta categoría quedarán sin categoría.`
      )
    )
      return
    await supabase.from('categories').delete().eq('id', category.id)
    load()
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl text-espresso mb-6">Categorías</h1>

      <form onSubmit={addCategory} className="flex gap-2 mb-6">
        <input
          required
          placeholder="Nombre de la categoría"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 border border-espresso/20 px-3 py-2 bg-white focus-visible:border-cognac"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-espresso text-cream text-sm font-medium hover:bg-cognac transition-colors"
        >
          Agregar
        </button>
      </form>

      {error && <p className="text-red-700 text-sm mb-4">{error}</p>}

      <div className="space-y-2">
        {categories.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between border border-stitch bg-white px-4 py-2.5"
          >
            <span>{c.name}</span>
            <button
              onClick={() => remove(c)}
              className="text-sm text-ink/40 hover:text-red-700"
            >
              Borrar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
