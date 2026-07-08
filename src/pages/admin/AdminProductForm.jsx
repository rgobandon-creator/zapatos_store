import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'
import ImageUploader from '../../components/ImageUploader.jsx'

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const emptyForm = {
  name: '',
  slug: '',
  category_id: '',
  description: '',
  price: '',
  compare_at_price: '',
  sizes: '',
  colors: '',
  stock: '0',
  images: [],
  is_active: true
}

export default function AdminProductForm() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [slugTouched, setSlugTouched] = useState(false)
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('name')
      .then(({ data }) => setCategories(data ?? []))
  }, [])

  useEffect(() => {
    if (!isEditing) return
    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            ...data,
            price: String(data.price),
            compare_at_price: data.compare_at_price
              ? String(data.compare_at_price)
              : '',
            sizes: (data.sizes ?? []).join(', '),
            colors: (data.colors ?? []).join(', '),
            stock: String(data.stock)
          })
          setSlugTouched(true)
        }
        setLoading(false)
      })
  }, [id, isEditing])

  function update(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value }
      if (field === 'name' && !slugTouched) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      category_id: form.category_id || null,
      description: form.description,
      price: Number(form.price),
      compare_at_price: form.compare_at_price
        ? Number(form.compare_at_price)
        : null,
      sizes: form.sizes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      colors: form.colors
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      stock: Number(form.stock),
      images: form.images,
      is_active: form.is_active
    }

    const query = isEditing
      ? supabase.from('products').update(payload).eq('id', id)
      : supabase.from('products').insert(payload)

    const { error } = await query
    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }
    navigate('/admin/productos')
  }

  if (loading) {
    return <p className="text-ink/50 font-display italic">Cargando…</p>
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-espresso mb-6">
        {isEditing ? 'Editar producto' : 'Nuevo producto'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full border border-espresso/20 px-3 py-2 bg-white focus-visible:border-cognac"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Slug (URL)
          </label>
          <input
            required
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true)
              update('slug', slugify(e.target.value))
            }}
            className="w-full border border-espresso/20 px-3 py-2 bg-white focus-visible:border-cognac font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Categoría</label>
          <select
            value={form.category_id ?? ''}
            onChange={(e) => update('category_id', e.target.value)}
            className="w-full border border-espresso/20 px-3 py-2 bg-white focus-visible:border-cognac"
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Descripción
          </label>
          <textarea
            rows={3}
            value={form.description ?? ''}
            onChange={(e) => update('description', e.target.value)}
            className="w-full border border-espresso/20 px-3 py-2 bg-white focus-visible:border-cognac"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Precio</label>
            <input
              required
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
              className="w-full border border-espresso/20 px-3 py-2 bg-white focus-visible:border-cognac"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Precio anterior (opcional)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.compare_at_price}
              onChange={(e) => update('compare_at_price', e.target.value)}
              className="w-full border border-espresso/20 px-3 py-2 bg-white focus-visible:border-cognac"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Tallas (separadas por coma)
            </label>
            <input
              placeholder="38, 39, 40, 41"
              value={form.sizes}
              onChange={(e) => update('sizes', e.target.value)}
              className="w-full border border-espresso/20 px-3 py-2 bg-white focus-visible:border-cognac"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Colores (separados por coma)
            </label>
            <input
              placeholder="Café, Negro"
              value={form.colors}
              onChange={(e) => update('colors', e.target.value)}
              className="w-full border border-espresso/20 px-3 py-2 bg-white focus-visible:border-cognac"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input
            required
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => update('stock', e.target.value)}
            className="w-40 border border-espresso/20 px-3 py-2 bg-white focus-visible:border-cognac"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Fotos</label>
          <ImageUploader
            images={form.images}
            onChange={(images) => update('images', images)}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => update('is_active', e.target.checked)}
          />
          Visible en el catálogo
        </label>

        {error && <p className="text-red-700 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-espresso text-cream font-medium hover:bg-cognac transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/productos')}
            className="px-5 py-2.5 border border-espresso/20 text-sm hover:border-cognac transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
