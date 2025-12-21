export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

// --- Style & Template Types ---

export interface FontStyle {
  family: string;
  size: number; // in pt
  bold: boolean;
  italic: boolean;
  color: string; // hex
  alignment: 'left' | 'center' | 'right' | 'justify';
  spacing?: number; // line height
  uppercase?: boolean;
}

export interface PageLayout {
  pageSize: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  marginTop: number; // inches
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  columns: 1 | 2;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnailUrl?: string;
  isSystem?: boolean; // Default templates provided by the app
  layout: PageLayout;
  styles: {
    h1: FontStyle;
    h2: FontStyle;
    h3: FontStyle;
    body: FontStyle;
    caption: FontStyle;
    header: FontStyle;
    footer: FontStyle;
  };
  elements: {
    showPageNumbers: boolean;
    showToc: boolean; // Table of Contents
    logoUrl?: string;
    logoPosition?: 'header-left' | 'header-right' | 'top-center';
  };
}

// --- Document Types ---

export type ProcessingStatus = 'draft' | 'processing' | 'completed' | 'failed';

export type DocumentType = 'general' | 'invoice' | 'resume' | 'contract' | 'paper';

export interface DocumentSection {
  id: string;
  type: 'h1' | 'h2' | 'h3' | 'paragraph' | 'image' | 'table' | 'list';
  content: string;
  metadata?: any; // For image captions, table data, etc.
}

export interface ExtractionResult {
  summary?: string;
  confidenceScore?: number;
  entities?: Array<{ label: string; value: string; category?: string }>;
  tables?: Array<{ title?: string; headers: string[]; rows: string[][] }>;
  processedAt?: string;
}

export interface Document {
  id: string;
  title: string;
  type: string; // Should ideally be DocumentType, but keeping string for flexibility
  size: number;
  wordCount?: number; // New field for analytics
  uploadDate: string;
  updatedAt: string;
  status: ProcessingStatus;
  templateId: string;
  originalFileName: string;
  fileUrl?: string;
  sections: DocumentSection[]; // The structured content extracted by AI
  rawContent?: string; // The original extracted text
  result?: ExtractionResult;
  uploaderId?: string;
  organizationId?: string;
}
