'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/lib/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserCircle } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isDriver } = useAuth();

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-slate-900">
                Avec
              </Link>
            </div>
            {isAuthenticated && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                <Link
                  href="/rides/search"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                    isActive('/rides/search')
                      ? 'text-slate-900 border-b-2 border-slate-900'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Search Rides
                </Link>
                {isDriver ? (
                  <>
                    <Link
                      href="/rides/post"
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                        isActive('/rides/post')
                          ? 'text-slate-900 border-b-2 border-slate-900'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Post Ride
                    </Link>
                    <Link
                      href="/rides/manage"
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                        isActive('/rides/manage')
                          ? 'text-slate-900 border-b-2 border-slate-900'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Manage Rides
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/rides/my-rides"
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                      isActive('/rides/my-rides')
                        ? 'text-slate-900 border-b-2 border-slate-900'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    My Rides
                  </Link>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600">
                  {user?.name || user?.email}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                      <Avatar>
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="bg-slate-100">
                          <UserCircle className="h-5 w-5 text-slate-600" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Link href="/settings" className="w-full">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 