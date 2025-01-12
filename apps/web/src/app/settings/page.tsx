'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Navbar } from '@/components/layout/navbar';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/protected-route';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile, uploadAvatar } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

const settingsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  avatar: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

function SettingsContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user, loadUser } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '',
    },
    mode: 'onChange',
  });

  const emailValue = watch('email');
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue || '');

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const result = await uploadAvatar(file);
      setValue('avatar', result.avatar);
      setPreviewAvatar(result.avatar);
      await loadUser();
      toast.success('Profile picture updated successfully', {
        duration: 3000,
        className: 'bg-green-50 border-green-200',
      });
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload profile picture', {
        duration: 4000,
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSubmit = async (data: SettingsFormData) => {
    if (!isDirty) {
      toast.info('No changes to save');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateProfile(data);
      await loadUser();
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto py-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Manage your account settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={previewAvatar ? `${process.env.NEXT_PUBLIC_API_URL}${previewAvatar}` : user?.avatar ? `${process.env.NEXT_PUBLIC_API_URL}${user.avatar}` : undefined} 
                      alt={user?.name} 
                    />
                    <AvatarFallback>
                      {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleAvatarChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAvatarClick}
                      disabled={uploadingAvatar}
                      className={`${uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''} relative`}
                    >
                      {uploadingAvatar ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Change Avatar'
                      )}
                    </Button>
                    <p className="mt-1 text-sm text-slate-500">
                      JPEG, PNG or GIF. Max 5MB.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                      Name
                    </label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Your name"
                      className={`${errors.name ? 'border-red-500 focus:ring-red-500' : 
                        dirtyFields.name ? 'border-green-500 focus:ring-green-500' : ''}`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="Your email"
                      className={`${errors.email || (emailValue && !isValidEmail) ? 'border-red-500 focus:ring-red-500' : 
                        dirtyFields.email && isValidEmail ? 'border-green-500 focus:ring-green-500' : ''}`}
                    />
                    {(errors.email || (emailValue && !isValidEmail)) && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.email?.message || 'Please enter a valid email address'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                      Phone (Optional)
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register('phone')}
                      placeholder="Your phone number"
                      className={`${errors.phone ? 'border-red-500 focus:ring-red-500' : 
                        dirtyFields.phone ? 'border-green-500 focus:ring-green-500' : ''}`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isDirty}
                    className={`bg-slate-900 hover:bg-slate-800 ${
                      (!isDirty || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⌛</span>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute requireAuth>
      <SettingsContent />
    </ProtectedRoute>
  );
} 