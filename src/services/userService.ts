import { User } from '../types';
import { CURRENT_USER } from '../lib/mockData';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'documorph_user_profile';
const LISTENERS = new Set<(user: User) => void>();

export const userService = {
  get: (): User => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : CURRENT_USER;
    } catch (e) {
      return CURRENT_USER;
    }
  },

  // Update local state and notify listeners
  setLocal: (user: User) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      userService.notify(user);
    } catch (e) {
      console.error("Failed to save user profile locally", e);
    }
  },

  // Sync with Supabase and update local state
  update: async (updates: Partial<User>) => {
    const current = userService.get();
    const updatedUser = { ...current, ...updates };
    
    // 1. Optimistic update
    userService.setLocal(updatedUser);

    // 2. Persist to Supabase if connected
    if (supabase) {
      try {
        const { error } = await supabase.auth.updateUser({
          data: {
            full_name: updates.name,
            avatar_url: updates.avatarUrl
          }
        });

        if (error) throw error;
      } catch (err) {
        console.error("Failed to sync profile with Supabase:", err);
        // We keep the optimistic update locally, but log the error
      }
    }

    return updatedUser;
  },

  uploadAvatar: async (file: File): Promise<string | null> => {
    if (!supabase) return null;

    // Strict validation for allowed image types
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      throw new Error("Invalid file format. Only JPG and PNG images are allowed.");
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const fileExt = file.name.split('.').pop();
      // Use timestamp to ensure uniqueness and avoid browser caching of old images
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) {
        console.error("Supabase Storage Error:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get Public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // Add a timestamp query param to ensure the UI refreshes the image
      return `${data.publicUrl}?t=${Date.now()}`;

    } catch (error: any) {
      console.error("Avatar upload process failed:", error);
      throw error;
    }
  },

  subscribe: (listener: (user: User) => void) => {
    LISTENERS.add(listener);
    listener(userService.get());
    return () => LISTENERS.delete(listener);
  },

  notify: (user: User) => {
    LISTENERS.forEach(l => l(user));
  }
};
