
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  title: string;
  sku: string;
  image: string;
}

interface ProductView {
  viewName: string;
  variants: string[];
}

interface PhotoShootSession {
  id: string;
  user_id: string;
  product_id?: string;
  design_brief?: string;
  shoot_type?: 'standard' | 'ai-suggestions';
  selected_prompts?: string[];
  status: 'draft' | 'generating' | 'reviewing' | 'completed';
  created_at: string;
  updated_at: string;
}

interface GeneratedPhoto {
  id: string;
  session_id: string;
  view_name: string;
  variant_index: number;
  image_url: string;
  approval_status: 'pending' | 'approved' | 'rejected';
}

export const usePhotoShootSession = () => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user's active sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['photo-shoot-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photo_shoot_sessions')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as PhotoShootSession[];
    }
  });

  // Get current session data
  const { data: currentSession } = useQuery({
    queryKey: ['photo-shoot-session', currentSessionId],
    queryFn: async () => {
      if (!currentSessionId) return null;
      
      const { data, error } = await supabase
        .from('photo_shoot_sessions')
        .select('*')
        .eq('id', currentSessionId)
        .single();
      
      if (error) throw error;
      return data as PhotoShootSession;
    },
    enabled: !!currentSessionId
  });

  // Get generated photos for current session
  const { data: generatedPhotos = [] } = useQuery({
    queryKey: ['generated-photos', currentSessionId],
    queryFn: async () => {
      if (!currentSessionId) return [];
      
      const { data, error } = await supabase
        .from('generated_photos')
        .select('*')
        .eq('session_id', currentSessionId)
        .order('view_name');
      
      if (error) throw error;
      return data as GeneratedPhoto[];
    },
    enabled: !!currentSessionId
  });

  // Create new session
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: Partial<PhotoShootSession>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('photo_shoot_sessions')
        .insert({
          user_id: user.id,
          ...sessionData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as PhotoShootSession;
    },
    onSuccess: (session) => {
      setCurrentSessionId(session.id);
      queryClient.invalidateQueries({ queryKey: ['photo-shoot-sessions'] });
    }
  });

  // Update session
  const updateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, updates }: { sessionId: string; updates: Partial<PhotoShootSession> }) => {
      const { data, error } = await supabase
        .from('photo_shoot_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();
      
      if (error) throw error;
      return data as PhotoShootSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photo-shoot-session', currentSessionId] });
      queryClient.invalidateQueries({ queryKey: ['photo-shoot-sessions'] });
    }
  });

  // Save generated photos
  const saveGeneratedPhotosMutation = useMutation({
    mutationFn: async ({ sessionId, photos }: { sessionId: string; photos: Omit<GeneratedPhoto, 'id' | 'session_id'>[] }) => {
      const photosToInsert = photos.map(photo => ({
        session_id: sessionId,
        ...photo
      }));

      const { data, error } = await supabase
        .from('generated_photos')
        .insert(photosToInsert)
        .select();
      
      if (error) throw error;
      return data as GeneratedPhoto[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-photos', currentSessionId] });
    }
  });

  // Update photo approval status
  const updatePhotoApprovalMutation = useMutation({
    mutationFn: async ({ photoId, status }: { photoId: string; status: 'approved' | 'rejected' }) => {
      const { data, error } = await supabase
        .from('generated_photos')
        .update({ approval_status: status })
        .eq('id', photoId)
        .select()
        .single();
      
      if (error) throw error;
      return data as GeneratedPhoto;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-photos', currentSessionId] });
    }
  });

  // Auto-save function
  const autoSave = async (updates: Partial<PhotoShootSession>) => {
    if (currentSessionId) {
      try {
        await updateSessionMutation.mutateAsync({ sessionId: currentSessionId, updates });
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }
  };

  // Convert generated photos to ProductView format
  const getProductViewsFromPhotos = (): ProductView[] => {
    const viewMap = new Map<string, string[]>();
    
    generatedPhotos.forEach(photo => {
      if (!viewMap.has(photo.view_name)) {
        viewMap.set(photo.view_name, ['', '']);
      }
      const variants = viewMap.get(photo.view_name)!;
      variants[photo.variant_index] = photo.image_url;
    });

    return Array.from(viewMap.entries()).map(([viewName, variants]) => ({
      viewName,
      variants
    }));
  };

  return {
    // Session data
    sessions,
    currentSession,
    currentSessionId,
    sessionsLoading,
    
    // Generated photos
    generatedPhotos,
    productViews: getProductViewsFromPhotos(),
    
    // Actions
    createSession: createSessionMutation.mutate,
    updateSession: updateSessionMutation.mutate,
    saveGeneratedPhotos: saveGeneratedPhotosMutation.mutate,
    updatePhotoApproval: updatePhotoApprovalMutation.mutate,
    setCurrentSessionId,
    autoSave,
    
    // Loading states
    isCreating: createSessionMutation.isPending,
    isUpdating: updateSessionMutation.isPending,
    isSavingPhotos: saveGeneratedPhotosMutation.isPending
  };
};
