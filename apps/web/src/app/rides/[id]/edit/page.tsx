'use client';

import { useEffect, useState, use } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { getRide, updateRide } from '@/lib/api/rides';
import ProtectedRoute from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import type { User } from '@/lib/types/user';
import { Navbar } from '@/components/layout/navbar';

interface Ride {
  id: string;
  driverId: string;
  origin: string;
  destination: string;
  departureTime: string;
  pricePerSeat: number;
  availableSeats: number;
  notes?: string;
}

const editRideSchema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  date: z.date(),
  time: z.string().min(1, 'Time is required'),
  pricePerSeat: z.string().min(1, 'Price per seat is required'),
  availableSeats: z.string().min(1, 'Available seats is required'),
  notes: z.string().optional(),
});

type EditRideFormData = z.infer<typeof editRideSchema>;

export default function EditRidePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="container mx-auto py-8">
          <EditRideContent params={resolvedParams} />
        </main>
      </div>
    </ProtectedRoute>
  );
}

function EditRideContent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, loading: userLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ride, setRide] = useState<Ride | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditRideFormData>({
    resolver: zodResolver(editRideSchema),
  });

  useEffect(() => {
    const loadRide = async () => {
      try {
        console.log('Loading ride data...');
        const { data } = await getRide(params.id);
        console.log('Ride data:', data);
        
        if (!data) {
          console.log('No ride data found');
          toast.error('Ride not found');
          router.push('/rides/manage');
          return;
        }

        // Check if user is the driver of this ride
        if (!user || user.id !== data.driverId) {
          console.log('User is not authorized:', {
            userId: user?.id,
            driverId: data.driverId
          });
          toast.error('You are not authorized to edit this ride');
          router.push('/rides/manage');
          return;
        }

        setRide(data);
        setValue('origin', data.origin);
        setValue('destination', data.destination);
        setValue('date', new Date(data.departureTime));
        setValue('time', format(new Date(data.departureTime), 'HH:mm'));
        setValue('pricePerSeat', data.pricePerSeat.toString());
        setValue('availableSeats', data.availableSeats.toString());
        setValue('notes', data.notes || '');
        setLoading(false);
      } catch (error) {
        console.error('Error loading ride:', error);
        toast.error('Failed to load ride');
        router.push('/rides/manage');
      }
    };

    if (!userLoading) {
      loadRide();
    }
  }, [params.id, router, setValue, user, userLoading]);

  const onSubmit = async (data: EditRideFormData) => {
    try {
      const departureTime = new Date(data.date);
      const [hours, minutes] = data.time.split(':');
      departureTime.setHours(parseInt(hours), parseInt(minutes));

      await updateRide(params.id, {
        origin: data.origin,
        destination: data.destination,
        departureTime: departureTime.toISOString(),
        pricePerSeat: parseFloat(data.pricePerSeat),
        availableSeats: parseInt(data.availableSeats),
        notes: data.notes,
      });

      toast.success('Ride updated successfully');
      router.push('/rides/manage');
    } catch (error) {
      console.error('Error updating ride:', error);
      toast.error('Failed to update ride');
    }
  };

  if (loading || userLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">Edit Ride</h1>
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
                      !ride?.departureTime && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {ride?.departureTime ? (
                      format(new Date(ride.departureTime), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={ride?.departureTime ? new Date(ride.departureTime) : undefined}
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
                  'w-full bg-white',
                  errors.time && 'border-red-500 focus:ring-red-500'
                )}
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 