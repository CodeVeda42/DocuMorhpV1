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
        // Sort extracted_data to get the latest entry
        const sortedData = doc.extracted_data?.sort((a: any, b: any) => 
          new Date(b.processed_at).getTime() - new Date(a.processed_at).getTime()
        );
        
        const latestData = sortedData?.[0];
        const payload = latestData?.json_payload || {};

        return {
            id: doc.id,
            title: doc.title,
            type: doc.type,
            size: doc.size,
            wordCount: doc.word_count || 0,
            uploadDate: doc.upload_date,
            updatedAt: doc.updated_at || doc.upload_date,
            status: doc.status,
            fileUrl: doc.file_url,
            originalFileName: doc.original_filename || doc.title,
            templateId: doc.template_id || 'tpl-ieee',
            sections: payload.sections || [],
            rawContent: payload.rawContent,
            result: latestData ? {
                ...payload,
                confidenceScore: latestData.confidence_score,
                processedAt: latestData.processed_at
            } : undefined
        };
      });
    } else {
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

        // Sort extracted_data to get the latest entry
        const sortedData = data.extracted_data?.sort((a: any, b: any) => 
          new Date(b.processed_at).getTime() - new Date(a.processed_at).getTime()
        );
        
        const latestData = sortedData?.[0];
        const payload = latestData?.json_payload || {};

        return {
            id: data.id,
            title: data.title,
            type: data.type,
            size: data.size,
            wordCount: data.word_count || 0,
            uploadDate: data.upload_date,
            updatedAt: data.updated_at || data.upload_date,
            status: data.status,
            fileUrl: data.file_url,
            originalFileName: data.original_filename || data.title,
            templateId: data.template_id || 'tpl-ieee',
            sections: payload.sections || [],
            rawContent: payload.rawContent,
            result: latestData ? {
                ...payload,
                confidenceScore: latestData.confidence_score,
                processedAt: latestData.processed_at
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
      templateId: 'tpl-ieee',
      originalFileName: doc.originalFileName || doc.title
    };

    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      const { data, error } = await supabase
        .from('documents')
        .insert({
          title: newDoc.title,
          type: newDoc.type,
          size: newDoc.size,
          word_count: newDoc.wordCount || 0,
          status: newDoc.status,
          user_id: userId,
          file_url: (newDoc as any).fileUrl,
          original_filename: newDoc.originalFileName
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

  updateDocument: async (id: string, updates: Partial<Document>) => {
    if (isSupabaseConfigured && supabase) {
      const dbUpdates: any = {
        updated_at: new Date().toISOString()
      };
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.wordCount !== undefined) dbUpdates.word_count = updates.wordCount;

      const { error } = await supabase
        .from('documents')
        .update(dbUpdates)
        .eq('id', id);
      
      if (error) throw error;
    } else {
      localDocuments = localDocuments.map(d => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d);
      saveLocalDocs(localDocuments);
    }
  },

  saveExtractionResult: async (docId: string, result: any) => {
    if (isSupabaseConfigured && supabase) {
      // Update document status
      await supabase.from('documents').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', docId);
      
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
              updatedAt: new Date().toISOString(),
              sections: result.sections || [],
              rawContent: result.rawContent,
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
