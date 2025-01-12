'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const searchSchema = z.object({
  from: z.string().min(1, 'From location is required'),
  to: z.string().min(1, 'To location is required'),
  date: z.string().min(1, 'Date is required'),
});

type SearchFormData = z.infer<typeof searchSchema>;

export function SearchForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
  });

  const onSubmit = (data: SearchFormData) => {
    const searchParams = new URLSearchParams({
      from: data.from,
      to: data.to,
      date: data.date,
    });
    router.push(`/rides/search?${searchParams.toString()}`);
  };

  return (
    <Card className="p-4 bg-white/50 backdrop-blur-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="flex items-end space-x-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="From"
            {...register('from')}
            className="h-9 bg-white"
          />
          {errors.from && (
            <p className="mt-1 text-xs text-red-500">{errors.from.message}</p>
          )}
        </div>
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="To"
            {...register('to')}
            className="h-9 bg-white"
          />
          {errors.to && (
            <p className="mt-1 text-xs text-red-500">{errors.to.message}</p>
          )}
        </div>
        <div className="flex-1 min-w-[150px]">
          <Input
            type="date"
            {...register('date')}
            min={new Date().toISOString().split('T')[0]}
            className="h-9 bg-white"
          />
          {errors.date && (
            <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>
          )}
        </div>
        <Button type="submit" className="h-9 px-8 bg-slate-800 hover:bg-slate-700">
          Search
        </Button>
      </form>
    </Card>
  );
} 