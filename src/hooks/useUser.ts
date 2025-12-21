import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { User } from '../types';

export const useUser = () => {
  const [user, setUser] = useState<User>(userService.get());

  useEffect(() => {
    const unsubscribe = userService.subscribe(setUser);
    return unsubscribe;
  }, []);

  const updateProfile = async (updates: Partial<User>) => {
    await userService.update(updates);
  };

  const uploadAvatar = async (file: File) => {
    return await userService.uploadAvatar(file);
  };

  return { user, updateProfile, uploadAvatar };
};
