'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { searchRides } from '@/lib/api/rides';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface RideSearchFormProps {
  className?: string;
  showResults?: boolean;
  onSearch?: (rides: any[]) => void;
  initialValues?: {
    origin?: string;
    destination?: string;
    date?: Date;
  };
}

export function RideSearchForm({
  className,
  showResults = false,
  onSearch,
  initialValues,
}: RideSearchFormProps) {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({
    origin: initialValues?.origin || '',
    destination: initialValues?.destination || '',
    date: initialValues?.date,
  });
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!searchParams.origin || !searchParams.destination || !searchParams.date) {
        toast.error('Please fill in all search fields');
        return;
      }

      const response = await searchRides({
        origin: searchParams.origin,
        destination: searchParams.destination,
        date: searchParams.date.toISOString().split('T')[0],
      });

      if (showResults && onSearch) {
        onSearch(response.data);
      } else {
        // Redirect to search page with query params
        const queryParams = new URLSearchParams({
          origin: searchParams.origin,
          destination: searchParams.destination,
          date: searchParams.date.toISOString().split('T')[0],
        });
        router.push(`/rides/search?${queryParams.toString()}`);
      }
    } catch (error) {
      console.error('Error searching rides:', error);
      toast.error('Failed to search rides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="origin" className="block text-sm font-medium text-slate-700">
            From
          </label>
          <Input
            id="origin"
            placeholder="Enter origin"
            value={searchParams.origin}
            onChange={(e) => setSearchParams({ ...searchParams, origin: e.target.value })}
            className="w-full bg-white"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="destination" className="block text-sm font-medium text-slate-700">
            To
          </label>
          <Input
            id="destination"
            placeholder="Enter destination"
            value={searchParams.destination}
            onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
            className="w-full bg-white"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Date
          </label>
          <DatePicker
            date={searchParams.date}
            onDateChange={(date) => setSearchParams({ ...searchParams, date })}
            className="w-full"
          />
        </div>
      </div>
      <Button
        type="submit"
        className="w-full bg-slate-900 hover:bg-slate-800 text-white"
        disabled={loading}
      >
        {loading ? 'Searching...' : 'Search Rides'}
      </Button>
    </form>
  );
} 