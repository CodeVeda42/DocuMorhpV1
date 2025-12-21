import { faker } from '@faker-js/faker';
import { Document, Template, User } from '../types';

export const CURRENT_USER: User = {
  id: 'user-1',
  name: 'Alex Designer',
  email: 'alex@design.studio',
  role: 'admin',
  avatarUrl: faker.image.avatar(),
};

export const CURRENT_ORG = {
  id: 'org-1',
  name: 'DocuMorph Workspace',
  plan: 'Pro',
};

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'tpl-ieee',
    name: 'Academic / IEEE Standard',
    description: 'Double column, serif font, strict formatting for research papers.',
    isSystem: true,
    layout: {
      pageSize: 'A4',
      orientation: 'portrait',
      marginTop: 0.75,
      marginBottom: 0.75,
      marginLeft: 0.6,
      marginRight: 0.6,
      columns: 2,
    },
    styles: {
      h1: { family: 'Times New Roman', size: 24, bold: true, italic: false, color: '#000000', alignment: 'center', uppercase: true },
      h2: { family: 'Times New Roman', size: 10, bold: true, italic: false, color: '#000000', alignment: 'left', uppercase: true },
      h3: { family: 'Times New Roman', size: 10, bold: false, italic: true, color: '#000000', alignment: 'left' },
      body: { family: 'Times New Roman', size: 10, bold: false, italic: false, color: '#000000', alignment: 'justify', spacing: 1.1 },
      caption: { family: 'Times New Roman', size: 8, bold: false, italic: false, color: '#444444', alignment: 'center' },
      header: { family: 'Arial', size: 8, bold: false, italic: false, color: '#888888', alignment: 'right' },
      footer: { family: 'Arial', size: 8, bold: false, italic: false, color: '#888888', alignment: 'center' },
    },
    elements: { showPageNumbers: true, showToc: false }
  },
  {
    id: 'tpl-corp',
    name: 'Modern Corporate Report',
    description: 'Clean sans-serif look with generous spacing and brand colors.',
    isSystem: true,
    layout: {
      pageSize: 'Letter',
      orientation: 'portrait',
      marginTop: 1,
      marginBottom: 1,
      marginLeft: 1,
      marginRight: 1,
      columns: 1,
    },
    styles: {
      h1: { family: 'Helvetica', size: 28, bold: true, italic: false, color: '#2563eb', alignment: 'left' },
      h2: { family: 'Helvetica', size: 18, bold: true, italic: false, color: '#1e40af', alignment: 'left' },
      h3: { family: 'Helvetica', size: 14, bold: true, italic: false, color: '#475569', alignment: 'left' },
      body: { family: 'Georgia', size: 11, bold: false, italic: false, color: '#334155', alignment: 'left', spacing: 1.5 },
      caption: { family: 'Helvetica', size: 9, bold: false, italic: true, color: '#64748b', alignment: 'left' },
      header: { family: 'Helvetica', size: 9, bold: false, italic: false, color: '#94a3b8', alignment: 'right' },
      footer: { family: 'Helvetica', size: 9, bold: false, italic: false, color: '#94a3b8', alignment: 'center' },
    },
    elements: { showPageNumbers: true, showToc: true, logoPosition: 'header-right' }
  },
  {
    id: 'tpl-legal',
    name: 'Legal Contract',
    description: 'Formal, single column, highly readable for agreements and contracts.',
    isSystem: true,
    layout: {
      pageSize: 'Letter',
      orientation: 'portrait',
      marginTop: 1,
      marginBottom: 1,
      marginLeft: 1.25,
      marginRight: 1.25,
      columns: 1,
    },
    styles: {
      h1: { family: 'Times New Roman', size: 16, bold: true, italic: false, color: '#000000', alignment: 'center', uppercase: true },
      h2: { family: 'Times New Roman', size: 14, bold: true, italic: false, color: '#000000', alignment: 'left' },
      h3: { family: 'Times New Roman', size: 12, bold: true, italic: false, color: '#000000', alignment: 'left' },
      body: { family: 'Times New Roman', size: 12, bold: false, italic: false, color: '#000000', alignment: 'justify', spacing: 1.5 },
      caption: { family: 'Times New Roman', size: 10, bold: false, italic: true, color: '#000000', alignment: 'center' },
      header: { family: 'Times New Roman', size: 10, bold: false, italic: false, color: '#666666', alignment: 'right' },
      footer: { family: 'Times New Roman', size: 10, bold: false, italic: false, color: '#666666', alignment: 'center' },
    },
    elements: { showPageNumbers: true, showToc: false }
  },
  {
    id: 'tpl-creative',
    name: 'Creative Brief',
    description: 'Bold typography and vibrant accents for marketing and design docs.',
    isSystem: true,
    layout: {
      pageSize: 'A4',
      orientation: 'portrait',
      marginTop: 0.5,
      marginBottom: 0.5,
      marginLeft: 0.5,
      marginRight: 0.5,
      columns: 1,
    },
    styles: {
      h1: { family: 'Arial Black', size: 36, bold: true, italic: false, color: '#db2777', alignment: 'left', uppercase: true },
      h2: { family: 'Arial', size: 24, bold: true, italic: false, color: '#be185d', alignment: 'left' },
      h3: { family: 'Arial', size: 18, bold: true, italic: false, color: '#9d174d', alignment: 'left' },
      body: { family: 'Verdana', size: 10, bold: false, italic: false, color: '#1f2937', alignment: 'left', spacing: 1.4 },
      caption: { family: 'Verdana', size: 9, bold: false, italic: true, color: '#6b7280', alignment: 'left' },
      header: { family: 'Verdana', size: 9, bold: true, italic: false, color: '#db2777', alignment: 'left' },
      footer: { family: 'Verdana', size: 9, bold: false, italic: false, color: '#9ca3af', alignment: 'right' },
    },
    elements: { showPageNumbers: true, showToc: false }
  },
  {
    id: 'tpl-tech',
    name: 'Technical Specification',
    description: 'Monospace headers and clean hierarchy for engineering documents.',
    isSystem: true,
    layout: {
      pageSize: 'A4',
      orientation: 'portrait',
      marginTop: 1,
      marginBottom: 1,
      marginLeft: 1,
      marginRight: 1,
      columns: 1,
    },
    styles: {
      h1: { family: 'Courier New', size: 24, bold: true, italic: false, color: '#0f172a', alignment: 'left' },
      h2: { family: 'Courier New', size: 18, bold: true, italic: false, color: '#334155', alignment: 'left' },
      h3: { family: 'Courier New', size: 14, bold: true, italic: false, color: '#475569', alignment: 'left' },
      body: { family: 'Segoe UI', size: 11, bold: false, italic: false, color: '#334155', alignment: 'left', spacing: 1.3 },
      caption: { family: 'Segoe UI', size: 9, bold: false, italic: true, color: '#64748b', alignment: 'center' },
      header: { family: 'Courier New', size: 9, bold: false, italic: false, color: '#94a3b8', alignment: 'right' },
      footer: { family: 'Courier New', size: 9, bold: false, italic: false, color: '#94a3b8', alignment: 'center' },
    },
    elements: { showPageNumbers: true, showToc: true }
  },
  {
    id: 'tpl-markdown',
    name: 'Markdown / Documentation',
    description: 'Monospace font with markdown-like styling for technical docs.',
    isSystem: true,
    layout: {
      pageSize: 'A4',
      orientation: 'portrait',
      marginTop: 1,
      marginBottom: 1,
      marginLeft: 1,
      marginRight: 1,
      columns: 1,
    },
    styles: {
      h1: { family: 'Courier New', size: 24, bold: true, italic: false, color: '#000000', alignment: 'left' },
      h2: { family: 'Courier New', size: 20, bold: true, italic: false, color: '#000000', alignment: 'left' },
      h3: { family: 'Courier New', size: 16, bold: true, italic: false, color: '#000000', alignment: 'left' },
      body: { family: 'Courier New', size: 10, bold: false, italic: false, color: '#333333', alignment: 'left', spacing: 1.2 },
      caption: { family: 'Courier New', size: 9, bold: false, italic: true, color: '#666666', alignment: 'left' },
      header: { family: 'Courier New', size: 8, bold: false, italic: false, color: '#888888', alignment: 'right' },
      footer: { family: 'Courier New', size: 8, bold: false, italic: false, color: '#888888', alignment: 'center' },
    },
    elements: { showPageNumbers: true, showToc: true }
  }
];

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc-1',
    title: 'Q3 Financial Overview',
    originalFileName: 'finance_draft_v2.docx',
    updatedAt: new Date().toISOString(),
    status: 'completed',
    templateId: 'tpl-corp',
    sections: [
      { id: '1', type: 'h1', content: 'Q3 Financial Overview' },
      { id: '2', type: 'paragraph', content: 'This report summarizes the financial performance for the third quarter of the fiscal year. Overall, revenue has increased by 15% compared to the previous quarter.' },
      { id: '3', type: 'h2', content: 'Revenue Breakdown' },
      { id: '4', type: 'paragraph', content: 'The majority of revenue growth was driven by the enterprise sector, which saw a 25% uptick in new contracts.' }
    ]
  },
  {
    id: 'doc-2',
    title: 'Neural Networks in Medical Imaging',
    originalFileName: 'research_paper_final.txt',
    updatedAt: faker.date.recent({ days: 5 }).toISOString(),
    status: 'draft',
    templateId: 'tpl-ieee',
    sections: []
  }
];
