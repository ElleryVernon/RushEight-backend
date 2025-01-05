'use client';

import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
        <Search className="h-3.5 w-3.5 text-white/40" />
      </div>
      <input
        type="text"
        className="w-full h-9 bg-white/[0.04] text-sm text-white/90 
          placeholder:text-white/30 pl-9 pr-4 rounded-lg
          ring-1 ring-white/[0.06] hover:ring-white/[0.08]
          focus:ring-2 focus:ring-blue-500/30 focus:outline-none
          transition-all duration-200"
        placeholder="Search users... (minimum 2 characters)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
} 