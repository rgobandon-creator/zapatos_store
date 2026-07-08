import { useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

export default function ImageUploader({ images, onChange }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  async function handleFiles(e) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setUploading(true)
    setError(null)

    try {
      const uploaded = []
      for (const file of files) {
        const ext = file.name.split('.').pop()
        const path = `${crypto.randomUUID()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('productos')
          .upload(path, file, { cacheControl: '3600', upsert: false })

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('productos').getPublicUrl(path)
        uploaded.push(data.publicUrl)
      }
      onChange([...images, ...uploaded])
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = '' // permite volver a elegir el mismo archivo
    }
  }

  function removeImage(url) {
    onChange(images.filter((i) => i !== url))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {images.map((url) => (
          <div key={url} className="relative w-24 h-24 group">
            <img
              src={url}
              alt=""
              className="w-full h-full object-cover border border-espresso/10"
            />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-espresso text-cream text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}

        <label className="w-24 h-24 border border-dashed border-espresso/30 flex items-center justify-center text-xs text-ink/50 cursor-pointer hover:border-cognac hover:text-cognac transition-colors text-center px-1">
          {uploading ? 'Subiendo…' : '+ Agregar foto'}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
      {error && <p className="text-red-700 text-sm">{error}</p>}
      <p className="text-xs text-ink/40">
        La primera foto es la que se muestra en el catálogo.
      </p>
    </div>
  )
}
