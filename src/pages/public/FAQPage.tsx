import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle, Phone, MessageCircle } from 'lucide-react'
import { GYM_INFO, FAQ_LIST } from '@/lib/constants'
import { Link } from 'react-router-dom'

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <div className="bg-white text-[#171717] min-h-screen">
      {/* Header */}
      <section className="py-20 bg-[#F8FAFC] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#E50914] text-xs sm:text-sm font-bold tracking-widest uppercase inline-block mb-3">
            HELP CENTER & QUESTIONS
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-wider text-[#111111] max-w-4xl mx-auto leading-tight">
            FREQUENTLY ASKED QUESTIONS
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mt-4">
            Clear answers to common questions about membership, shifting times, beginner coaching, and gym etiquette.
          </p>
        </div>
      </section>

      {/* Accordion */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {FAQ_LIST.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm transition-colors"
              >
                <button
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                  className="w-full px-7 py-5 text-left font-bold text-base text-[#111111] flex items-center justify-between gap-4 hover:text-[#E50914] transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#E50914] shrink-0 transition-transform duration-200 ${
                      openIdx === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openIdx === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-7 pb-6 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Still Have Questions Banner */}
          <div className="mt-16 bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-8 text-center max-w-xl mx-auto">
            <h3 className="font-bold text-lg text-[#111111] mb-2">Still have questions?</h3>
            <p className="text-xs text-gray-600 mb-6">
              Our front desk staff at VMV Road, Amravati is available during operating hours to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={GYM_INFO.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white text-xs font-bold py-3 px-5 rounded-lg hover:bg-[#1ebd5a]"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Now
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-[#111111] text-white text-xs font-bold py-3 px-5 rounded-lg hover:bg-black"
              >
                Contact Form
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
