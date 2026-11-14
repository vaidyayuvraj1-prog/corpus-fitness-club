import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image as ImageIcon, Plus, Trash2, X, Upload, CheckCircle2, RefreshCw, Link as LinkIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { GALLERY_CATEGORIES } from '@/lib/constants'
import { db } from '@/lib/db'
import { processImageFile } from '@/lib/imageUpload'

export default function AdminGalleryPage() {
  const [images, setImages] = useState<any[]>(() => db.getGallery())
  const [showAddModal, setShowAddModal] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [isProcessing, setIsProcessing] = useState(false)
  const [useUrlFallback, setUseUrlFallback] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title: '',
    category: 'Gym Interior',
    image: '',
  })

  // Listen for realtime multi-device sync
  useEffect(() => {
    const handleSync = () => setImages(db.getGallery())
    window.addEventListener('cfc_db_synced', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('cfc_db_synced', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    const toastId = toast.loading('Reading & compressing photo from gallery...')

    try {
      // Compress client-side to max 1200px width/height and quality 0.84
      const compressedBase64 = await processImageFile(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.84,
      })

      setForm((prev) => ({
        ...prev,
        image: compressedBase64,
        title: prev.title.trim() ? prev.title : file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      }))
      toast.success('Photo picked from gallery and ready to save!', { id: toastId })
    } catch (err: any) {
      toast.error(err.message || 'Failed to process image file', { id: toastId })
    } finally {
      setIsProcessing(false)
      // Reset input value so re-selecting same file triggers onChange
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Please enter a caption / title for the photograph')
      return
    }
    if (!form.image.trim()) {
      toast.error('Please pick a photo from your gallery or provide an image')
      return
    }

    try {
      const updated = db.saveGalleryItem({
        title: form.title.trim(),
        category: form.category,
        image: form.image,
      })

      setImages(updated)
      toast.success('Photograph uploaded to website gallery & synced!')
      setShowAddModal(false)
      setForm({ title: '', category: 'Gym Interior', image: '' })
      setUseUrlFallback(false)
    } catch {
      toast.error('Failed to save gallery photograph')
    }
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to remove this photograph from the website gallery?')) {
      return
    }
    const updated = db.deleteGalleryItem(id)
    setImages(updated)
    toast.success('Photograph removed from gallery')
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
            Upload gym photos directly from device gallery/camera — automatically synced to public website & Supabase cloud
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              title: '',
              category: 'Gym Interior',
              image: '',
            })
            setUseUrlFallback(false)
            setShowAddModal(true)
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] transition-colors shadow-sm cursor-pointer"
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
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
            <div className="h-60 overflow-hidden relative bg-gray-100">
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
                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                title="Delete image"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-600">No photographs found in this category</p>
            <p className="text-xs text-gray-400 mt-1">Tap "Add Photograph" to upload directly from your phone or laptop gallery.</p>
          </div>
        )}
      </div>

      {/* ── ADD MODAL ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs"
          >
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div>
                  <h3 className="font-display text-xl tracking-wider text-[#111111] uppercase">
                    Add Gym Photograph
                  </h3>
                  <p className="text-[11px] text-gray-500">Pick from device gallery — no links required</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-black p-1 rounded-lg cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddImage} className="space-y-4 text-xs">
                {/* File Upload Area */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1.5">
                    Select Photo from Gallery / Device *
                  </label>

                  {/* Hidden native input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  {/* Photo Preview Box or File Drop Zone */}
                  {form.image ? (
                    <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500/50 bg-gray-50 p-2">
                      <div className="h-44 w-full rounded-lg overflow-hidden relative">
                        <img
                          src={form.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-3 h-3" /> Photo Selected
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isProcessing}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" /> Change Photo
                        </button>

                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, image: '' }))}
                          className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => !isProcessing && fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 hover:border-[#E50914] bg-gray-50/70 hover:bg-red-50/30 rounded-xl p-5 text-center cursor-pointer transition-all group"
                    >
                      <div className="w-12 h-12 mx-auto rounded-full bg-red-100 text-[#E50914] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-gray-800 text-sm">
                        📁 Tap to Choose from Gallery / Camera
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Select any photo from your phone or laptop. Auto-compressed for instant sync.
                      </p>
                    </div>
                  )}

                  {/* Fallback URL toggle */}
                  <div className="mt-1.5 text-right">
                    <button
                      type="button"
                      onClick={() => setUseUrlFallback(!useUrlFallback)}
                      className="text-[10px] text-gray-400 hover:text-gray-600 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <LinkIcon className="w-3 h-3" /> {useUrlFallback ? 'Hide URL input' : 'Or paste an image URL instead'}
                    </button>
                  </div>

                  {useUrlFallback && (
                    <div className="mt-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  )}
                </div>

                {/* Caption / Title */}
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

                {/* Category */}
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

                {/* Action Buttons */}
                <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing || !form.image}
                    className="px-5 py-2 rounded-lg bg-[#E50914] text-white font-bold hover:bg-[#B91C1C] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                  >
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
