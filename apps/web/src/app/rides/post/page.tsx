'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createRide } from '@/lib/api/rides';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';

const postRideSchema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  date: z.date(),
  time: z.string().min(1, 'Time is required'),
  pricePerSeat: z.string().min(1, 'Price per seat is required'),
  availableSeats: z.string().min(1, 'Available seats is required'),
  notes: z.string().optional(),
});

type PostRideFormData = z.infer<typeof postRideSchema>;

export default function PostRidePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="container mx-auto py-8">
          <PostRideContent />
        </main>
      </div>
    </ProtectedRoute>
  );
}

function PostRideContent() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PostRideFormData>({
    resolver: zodResolver(postRideSchema),
  });

  const selectedDate = watch('date');

  const onSubmit = async (data: PostRideFormData) => {
    if (!user) return;

    try {
      const departureTime = new Date(data.date);
      const [hours, minutes] = data.time.split(':');
      departureTime.setHours(parseInt(hours), parseInt(minutes));

      await createRide({
        driverId: user.id,
        origin: data.origin,
        destination: data.destination,
        departureTime: departureTime.toISOString(),
        pricePerSeat: parseFloat(data.pricePerSeat),
        availableSeats: parseInt(data.availableSeats),
        notes: data.notes,
      });

      toast.success('Ride posted successfully');
      router.push('/rides/manage');
    } catch (error) {
      console.error('Error posting ride:', error);
      toast.error('Failed to post ride');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">Post a Ride</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Origin</label>
              <Input
                {...register('origin')}
                className={cn(
                  'w-full bg-white',
                  errors.origin && 'border-red-500 focus:ring-red-500'
                )}
              />
              {errors.origin && (
                <p className="text-red-500 text-sm">{errors.origin.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Destination</label>
              <Input
                {...register('destination')}
                className={cn(
                  'w-full bg-white',
                  errors.destination && 'border-red-500 focus:ring-red-500'
                )}
              />
              {errors.destination && (
                <p className="text-red-500 text-sm">{errors.destination.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal bg-white',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setValue('date', date)}
                    disabled={(date) =>
                      date < new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Time</label>
              <Input
                type="time"
                {...register('time')}
                className={cn(
                  'w-full bg-white hover:bg-slate-50 focus:bg-white',
                  errors.time && 'border-red-500 focus:ring-red-500'
                )}
                placeholder="Select time"
              />
              {errors.time && (
                <p className="text-red-500 text-sm">{errors.time.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Price per seat</label>
              <Input
                type="number"
                step="0.01"
                {...register('pricePerSeat')}
                className={cn(
                  'w-full bg-white',
                  errors.pricePerSeat && 'border-red-500 focus:ring-red-500'
                )}
              />
              {errors.pricePerSeat && (
                <p className="text-red-500 text-sm">{errors.pricePerSeat.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Available seats</label>
              <Input
                type="number"
                {...register('availableSeats')}
                className={cn(
                  'w-full bg-white',
                  errors.availableSeats && 'border-red-500 focus:ring-red-500'
                )}
              />
              {errors.availableSeats && (
                <p className="text-red-500 text-sm">{errors.availableSeats.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Notes (optional)</label>
            <Textarea
              {...register('notes')}
              className="w-full bg-white min-h-[100px]"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/rides/manage')}
              className="bg-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {isSubmitting ? 'Posting...' : 'Post Ride'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 