import { Suspense } from 'react';
import UsersClient from '../components/users-client';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: '유저 DB | MapleStory',
  description: 'MapleStory user database and rankings'
};

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-[#171717]">
      <div className="max-w-8xl mx-auto px-4 sm:px-5 py-8">
        <Suspense fallback={
          <div className="flex justify-center items-center h-[400px]">
            <Loader2 className="h-8 w-8 text-white/50 animate-spin" />
          </div>
        }>
          <UsersClient />
        </Suspense>
      </div>
    </div>
  );
}