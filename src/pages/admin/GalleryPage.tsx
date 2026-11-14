import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image, Plus, Trash2, X, ZoomIn, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { GALLERY_CATEGORIES, GALLERY_ITEMS_DEFAULT } from '@/lib/constants'

export default function AdminGalleryPage() {
  const [images, setImages] = useState(GALLERY_ITEMS_DEFAULT)
  const [showAddModal, setShowAddModal] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('All')

  const [form, setForm] = useState({
    title: '',
    category: 'Gym Interior',
    image: '',
  })

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.image.trim()) {
      toast.error('Title and Image URL are required')
      return
    }

    const newItem = {
      id: `img-${Date.now()}`,
      title: form.title,
      category: form.category,
      image: form.image,
    }

    setImages([newItem, ...images])
    toast.success('Photograph uploaded to website gallery!')
    setShowAddModal(false)
  }

  const handleDelete = (id: string) => {
    setImages(images.filter((img) => img.id !== id))
    toast.success('Image removed from gallery')
  }

  const filtered =
    categoryFilter === 'All' ? images : images.filter((img) => img.category === categoryFilter)

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display tracking-wider text-[#111111] uppercase">
            GALLERY MANAGEMENT CMS
          </h2>
          <p className="text-xs text-gray-500">
            Upload and organize gym interior, equipment, and event photographs displayed on the public website
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              title: '',
              category: 'Equipment',
              image: '',
            })
            setShowAddModal(true)
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Photograph
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {GALLERY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              categoryFilter === cat
                ? 'bg-[#E50914] text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="group bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="h-60 overflow-hidden relative">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              <span className="absolute top-3 left-3 bg-[#111111]/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase">
                {item.category}
              </span>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#111111]">{item.title}</h4>
                <p className="text-[10px] text-gray-400">Live on Public Website</p>
              </div>

              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Delete image"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── ADD MODAL ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h3 className="font-display text-xl tracking-wider text-[#111111] uppercase">
                  Add Photograph
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-black">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddImage} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Photo Caption / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Free Weight Training Arena"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="Gym Interior">Gym Interior</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Training">Training</option>
                    <option value="Activities">Activities</option>
                    <option value="Events">Events</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Image URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/photo-..."
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-lg bg-[#E50914] text-white font-bold">
                    Upload Photograph
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
