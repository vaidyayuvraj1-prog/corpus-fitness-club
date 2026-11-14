import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn } from 'lucide-react'
import { GALLERY_CATEGORIES } from '@/lib/constants'
import { db } from '@/lib/db'

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedImage, setSelectedImage] = useState<any | null>(null)
  const [items, setItems] = useState<any[]>(() => db.getGallery())

  // Listen for realtime sync from admin uploads
  useEffect(() => {
    const handleSync = () => setItems(db.getGallery())
    window.addEventListener('cfc_db_synced', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('cfc_db_synced', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  const filtered =
    activeCategory === 'All' ? items : items.filter((item) => item.category === activeCategory)

  return (
    <div className="bg-white text-[#171717] min-h-screen">
      {/* Header */}
      <section className="py-20 bg-[#F8FAFC] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#E50914] text-xs sm:text-sm font-bold tracking-widest uppercase inline-block mb-3">
            VISUAL TOUR
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-wider text-[#111111] max-w-4xl mx-auto leading-tight">
            CORPUS FITNESS CLUB GALLERY
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mt-4">
            Explore our 3rd floor training facility, heavy free weights section, cardio deck, and dynamic group sessions.
          </p>

          {/* Categories */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {GALLERY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#E50914] text-white shadow-md shadow-red-500/20'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedImage(item)}
                className="group relative h-72 rounded-2xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer bg-gray-100"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#E50914] uppercase tracking-wider mb-1 block">
                        {item.category}
                      </span>
                      <h4 className="font-bold text-base text-white">{item.title}</h4>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <ZoomIn className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-20 text-center text-gray-400">
              <p className="text-base font-bold">No photographs found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="w-full max-h-[75vh] object-contain bg-black"
              />
              <div className="p-6 bg-white flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#E50914] uppercase tracking-widest">
                    {selectedImage.category}
                  </span>
                  <h3 className="font-bold text-lg text-[#111111] mt-0.5">{selectedImage.title}</h3>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
