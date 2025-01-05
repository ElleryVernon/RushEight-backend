'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { SearchBar } from '@/components/search-bar';
import DataTable from '@/components/data-table';
import { fetchUsers, searchUsers, deleteUser } from '@/lib/api/users';
import { Column, User } from '@/types/user';

/* shadcn/ui imports */
import { useToast  } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

const columns: Column[] = [
  { key: 'action', label: '삭제', width: 'w-[60px]' },
  { key: 'userId', label: 'User ID', sortable: true },
  { key: 'level', label: 'Level', sortable: true },
  { key: 'exp', label: 'EXP', sortable: true },
  { key: 'nickname', label: 'Nickname', sortable: true },
  { key: 'job', label: 'Job', sortable: true },
  { key: 'jobCode', label: 'Job Code', sortable: true },
  { key: 'meso', label: 'Meso', sortable: true },
  { key: 'playTime', label: 'Play Time', sortable: true },
  { key: 'createdAt', label: 'Created At', sortable: true },
  { key: 'updatedAt', label: 'Updated At', sortable: true }
];

export default function UsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const pageSize = 100;

  // AlertDialog 제어
  const [open, setOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // toast hook (shadcn)
  const { toast } = useToast();

  useEffect(() => {
    if (searchQuery.length >= 2) {
      if (currentPage !== 1) {
        setCurrentPage(1);
        return;
      }
      doSearch();
    } else {
      doFetchRanking();
    }
  }, [searchQuery, currentPage]);

  async function doSearch() {
    try {
      setIsLoading(true);
      setError('');
      const data = await searchUsers(searchQuery);
      setUsers(data.searchResults);
      setTotalCount(data.totalCount);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function doFetchRanking() {
    try {
      setIsLoading(true);
      setError('');
      const data = await fetchUsers(currentPage, pageSize);
      setUsers(data.users);
      setTotalCount(data.totalCount);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }

  // 삭제 직전 AlertDialog를 열기 위한 함수
  function promptDeleteUser(userId: string) {
    setUserToDelete(userId);
    setOpen(true);
  }

  // AlertDialog에서 “확인” 클릭시 실제로 삭제 처리
  async function handleConfirmDelete() {
    if (!userToDelete) {
      setOpen(false);
      return;
    }

    try {
      setIsLoading(true);
      await deleteUser(userToDelete);

      // 삭제 성공 시 토스트 표시
      toast({
        title: 'User deleted',
        description: `User "${userToDelete}" has been deleted.`,
      });

      // 다시 검색 혹은 순위 목록 불러오기
      if (searchQuery.length >= 2) {
        await doSearch();
      } else {
        await doFetchRanking();
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
      setOpen(false);
      setUserToDelete(null);
    }
  }

  // 에러 처리
  function handleError(err: unknown) {
    console.error('Failed to fetch users:', err);
    setError('Failed to load users. Please try again later.');
    setUsers([]);
    setTotalCount(0);
  }

  if (error) {
    return (
      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-medium text-white/90">유저 DB</h1>
          {!isLoading && (
            <span className="text-sm text-white/50 font-medium">
              {totalCount.toLocaleString()} users
            </span>
          )}
        </div>
        
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Loader2 className="h-8 w-8 text-white/50 animate-spin" />
          </div>
        ) : (
          <div className="mt-4">
            <DataTable
              columns={columns}
              data={users}
              totalCount={totalCount}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              // 삭제를 시도할 때 promptDeleteUser를 호출 → AlertDialog 표시
              onDeleteUser={promptDeleteUser}
              isSearching={searchQuery.length >= 2}
            />
          </div>
        )}
      </div>

      {/* 삭제 확인용 AlertDialog */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="bg-[#1F1F1F] border border-[#2E2E2E]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">유저({userToDelete})를 정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription className="font-semibold text-white/70">
              이 작업은 되돌릴 수 없습니다. <br />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              asChild
              onClick={() => {
                setOpen(false);
                setUserToDelete(null);
              }}
            >
              <Button variant="outline" className="border-[#2E2E2E] text-white/70 bg-[#2E2E2E] hover:bg-[#2E2E2E] hover:text-white">취소</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild onClick={handleConfirmDelete}>
              <Button variant="destructive" className="bg-red-500/20 text-red-500 hover:bg-red-500/30">네, 삭제</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 