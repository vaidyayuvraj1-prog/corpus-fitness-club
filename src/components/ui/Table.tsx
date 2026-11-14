import React from 'react'

export interface TableProps {
  headers: string[]
  children: React.ReactNode
  className?: string
}

export function Table({ headers, children, className = '' }: TableProps) {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white shadow-sm ${className}`}>
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-600 select-none whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-[#171717]">{children}</tbody>
      </table>
    </div>
  )
}

export default Table
