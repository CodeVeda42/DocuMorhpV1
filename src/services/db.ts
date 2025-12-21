import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Document, ProcessingStatus } from '../types';
import { MOCK_DOCUMENTS } from '../lib/mockData';

// Helper to manage local storage persistence
const STORAGE_KEY = 'documorph_local_docs';

const getLocalDocs = (): Document[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [...MOCK_DOCUMENTS];
  } catch (e) {
    return [...MOCK_DOCUMENTS];
  }
};

const saveLocalDocs = (docs: Document[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch (e) {
    console.error("Failed to save to local storage", e);
  }
};

// In-memory store initialization
let localDocuments = getLocalDocs();

export const db = {
  getDocuments: async (): Promise<Document[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          extracted_data (
            json_payload,
            confidence_score,
            processed_at
          )
        `)
        .order('upload_date', { ascending: false });

      if (error) throw error;
      
      // Map Supabase result to our Document type
      return data.map((doc: any) => {
        const payload = doc.extracted_data?.[0]?.json_payload || {};
        return {
            id: doc.id,
            title: doc.title,
            type: doc.type,
            size: doc.size,
            uploadDate: doc.upload_date,
            updatedAt: doc.updated_at || doc.upload_date, // Map updated_at or fallback
            status: doc.status,
            fileUrl: doc.file_url,
            originalFileName: doc.original_filename || doc.title,
            templateId: doc.template_id || 'tpl-ieee',
            sections: payload.sections || [],
            rawContent: payload.rawContent, // Retrieve raw content
            result: doc.extracted_data?.[0] ? {
                ...payload,
                confidenceScore: doc.extracted_data[0].confidence_score,
                processedAt: doc.extracted_data[0].processed_at
            } : undefined
        };
      });
    } else {
      // Refresh local docs from storage in case another tab updated it
      localDocuments = getLocalDocs();
      return new Promise(resolve => setTimeout(() => resolve([...localDocuments]), 500));
    }
  },

  getDocumentById: async (id: string): Promise<Document | undefined> => {
     if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
            .from('documents')
            .select(`
                *,
                extracted_data (
                    json_payload,
                    confidence_score,
                    processed_at
                )
            `)
            .eq('id', id)
            .single();
        
        if (error) return undefined;

        const payload = data.extracted_data?.[0]?.json_payload || {};

        return {
            id: data.id,
            title: data.title,
            type: data.type,
            size: data.size,
            uploadDate: data.upload_date,
            updatedAt: data.updated_at || data.upload_date, // Map updated_at or fallback
            status: data.status,
            fileUrl: data.file_url,
            originalFileName: data.original_filename || data.title,
            templateId: data.template_id || 'tpl-ieee',
            sections: payload.sections || [],
            rawContent: payload.rawContent, // Retrieve raw content
            result: data.extracted_data?.[0] ? {
                ...payload,
                confidenceScore: data.extracted_data[0].confidence_score,
                processedAt: data.extracted_data[0].processed_at
            } : undefined
        };
     } else {
        localDocuments = getLocalDocs();
        return new Promise(resolve => setTimeout(() => resolve(localDocuments.find(d => d.id === id)), 300));
     }
  },

  createDocument: async (doc: Omit<Document, 'id' | 'uploadDate' | 'status' | 'sections' | 'originalFileName' | 'templateId' | 'updatedAt'> & { originalFileName?: string }): Promise<Document> => {
    const newDoc = {
      ...doc,
      status: 'processing' as ProcessingStatus,
      uploadDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections: [],
      templateId: 'tpl-ieee', // Default
      originalFileName: doc.originalFileName || doc.title
    };

    if (isSupabaseConfigured && supabase) {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || '00000000-0000-0000-0000-000000000000';

      const { data, error } = await supabase
        .from('documents')
        .insert({
          title: newDoc.title,
          type: newDoc.type,
          size: newDoc.size,
          status: newDoc.status,
          user_id: userId,
          file_url: (newDoc as any).fileUrl,
          original_filename: newDoc.originalFileName // Enabled original filename
        })
        .select()
        .single();
      
      if (error) throw error;
      return { ...newDoc, id: data.id };
    } else {
      const mockDoc = { ...newDoc, id: crypto.randomUUID() };
      localDocuments = [mockDoc, ...localDocuments];
      saveLocalDocs(localDocuments);
      return mockDoc;
    }
  },

  saveExtractionResult: async (docId: string, result: any) => {
    if (isSupabaseConfigured && supabase) {
      // Update document status
      await supabase.from('documents').update({ status: 'completed' }).eq('id', docId);
      
      // Insert extracted data
      await supabase.from('extracted_data').insert({
        document_id: docId,
        json_payload: result,
        confidence_score: result.confidenceScore || 0.95,
        processed_at: new Date().toISOString()
      });
    } else {
      localDocuments = localDocuments.map(d => 
        d.id === docId 
          ? { 
              ...d, 
              status: 'completed', 
              sections: result.sections || [],
              rawContent: result.rawContent, // Save raw content locally
              result: { ...result, processedAt: new Date().toISOString() } 
            } 
          : d
      );
      saveLocalDocs(localDocuments);
    }
  },

  deleteDocument: async (id: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
    } else {
      localDocuments = localDocuments.filter(d => d.id !== id);
      saveLocalDocs(localDocuments);
    }
  }
};
