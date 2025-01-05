'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { User } from '@/types/user';

interface Column {
  key: keyof User | 'action';
  label: string;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps {
  columns: Column[];
  data: User[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isSearching?: boolean;
  onDeleteUser?: (userId: string) => void;
}

const defaultColumnWidths: Record<keyof User | 'action' | 'rank', string> = {
  rank: 'w-[80px]',
  action: 'w-[80px]',
  userId: 'w-[160px]',
  nickname: 'w-[180px]',
  level: 'w-[80px]',
  exp: 'w-[100px]',
  job: 'w-[120px]',
  jobCode: 'w-[120px]',
  meso: 'w-[120px]',
  playTime: 'w-[168px]',
  createdAt: 'w-[200px]',
  updatedAt: 'w-[200px]',
};

function TableHeader({
  column,
  onSort,
  width,
}: {
  column: Column;
  onSort: (key: keyof User | 'action') => void;
  width: string;
}) {
  return (
    <th
      className={`px-3 py-[6px] text-left bg-[#212121] border-r border-[#2E2E2E] last:border-r-0 ${width}`}
      onClick={() => {
        if (column.sortable && column.key !== 'action') {
          onSort(column.key);
        }
      }}
    >
      <div className="flex items-center gap-1 text-white text-[12px] font-bold tracking-wide">
        <span>{column.label}</span>
      </div>
    </th>
  );
}

function TableCell({
  value,
  column,
  width,
  onDelete,
}: {
  value: string | number | Date;
  column: Column;
  width: string;
  onDelete?: () => void;
}) {
  if (column.key === 'action') {
    return (
      <td
        className={`px-3 py-[6px] text-[12px] font-normal text-white border-r border-[#242424] last:border-r-0 ${width}`}
      >
        <div className="flex justify-center">
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-400 transition-colors inline-flex items-center"
            title="Delete user"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    );
  }

  const formattedValue = column.key.toString().includes('At')
    ? new Date(value).toLocaleString()
    : column.key === 'meso' || column.key === 'exp'
    ? (value as number).toLocaleString()
    : String(value);

  return (
    <td
      className={`px-3 py-[6px] text-[12px] font-normal text-white truncate border-r border-[#242424] last:border-r-0 ${width}`}
    >
      {formattedValue}
    </td>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
}) {
  const [localPageInput, setLocalPageInput] = useState<string>(String(currentPage));

  useEffect(() => {
    setLocalPageInput(String(currentPage));
  }, [currentPage]);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalPageInput(e.target.value);
  };

  const handleGoToPage = () => {
    let newPage = parseInt(localPageInput, 10) || 1;
    newPage = Math.max(1, Math.min(newPage, totalPages));
    onPageChange(newPage);
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleGoToPage();
  };

  return (
    <div className="px-3 py-1.5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-t border-[#242424] bg-[#141414]">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="text-white disabled:opacity-40 hover:text-white p-1 rounded transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <p className="text-xs text-white">Page</p>

        <input
          type="number"
          min={1}
          max={totalPages}
          value={localPageInput}
          onChange={handlePageInputChange}
          onKeyDown={handlePageInputKeyDown}
          className="text-xs bg-[#212121] border border-[#242424] rounded-md text-white px-2 py-1 w-16 focus:outline-none focus:ring-2 focus:ring-offset-1 
          [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />

        <p className="text-xs text-white">of {totalPages}</p>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="text-white disabled:opacity-40 hover:text-white p-1 rounded transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          onClick={handleGoToPage}
          className="text-xs text-white bg-[#212121] border border-[#242424] rounded-md px-2 py-1 hover:bg-neutral-700 transition-colors"
        >
          Go
        </button>
      </div>

      <div className="text-right">
        <p className="text-xs text-white">{totalCount.toLocaleString()} records</p>
      </div>
    </div>
  );
}

export default function DataTable({
  columns,
  data,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  isSearching = false,
  onDeleteUser,
}: DataTableProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  const getRankNumber = (index: number) => (currentPage - 1) * pageSize + index + 1;

  return (
    <div className="overflow-hidden bg-[#141414] border border-[#242424]">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="border-[0.5px] border-[#242424]">
              <th className="px-3 py-[6px] text-left bg-[#212121] border-r border-[#2E2E2E] w-[80px]">
                <div className="flex items-center gap-1 text-white text-[12px] font-bold tracking-wide">
                  <span>삭제</span>
                </div>
              </th>
              {!isSearching && (
                <th className="px-3 py-[6px] text-left bg-[#212121] border-r border-[#2E2E2E] w-[80px]">
                  <div className="flex items-center gap-1 text-white text-[12px] font-bold tracking-wide">
                    <span>순위</span>
                  </div>
                </th>
              )}
              {columns.filter(col => col.key !== 'action').map((column) => {
                const width = column.width || defaultColumnWidths[column.key] || 'w-[120px]';
                return (
                  <TableHeader
                    key={column.key}
                    column={column}
                    onSort={() => {
                      /* Implement sorting logic if desired */
                    }}
                    width={width}
                  />
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-[#171717]">
            {data.length > 0 ? (
              data.map((row, idx) => (
                <tr
                  key={row.userId + '-' + idx}
                  className="border-b border-[#242424] hover:bg-neutral-800/20 transition-all duration-150"
                >
                  <td className="px-3 py-[6px] text-[12px] font-normal text-white border-r border-[#242424] w-[80px]">
                    <div className="flex justify-center">
                      <button
                        onClick={() => onDeleteUser?.(row.userId)}
                        className="text-red-500 hover:text-red-400 transition-colors inline-flex items-center"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  {!isSearching && (
                    <td className="px-3 py-[6px] text-[12px] font-normal text-white truncate border-r border-[#242424] w-[80px]">
                      {getRankNumber(idx)}
                    </td>
                  )}
                  {columns.filter(col => col.key !== 'action').map((column) => {
                    const width = column.width || defaultColumnWidths[column.key] || 'w-[120px]';
                    return (
                      <TableCell
                        key={column.key}
                        value={row[column.key as keyof User]}
                        column={column}
                        width={width}
                      />
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={isSearching ? columns.length : columns.length + 1}
                  className="text-center py-1.5"
                >
                  <p className="text-[12px] font-normal text-white">
                    검색 결과가 없습니다.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalCount={totalCount}
      />
    </div>
  );
}