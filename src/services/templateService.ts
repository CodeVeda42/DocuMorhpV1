import { Template } from '../types';
import { DEFAULT_TEMPLATES } from '../lib/mockData';

const STORAGE_KEY = 'documorph_custom_templates';

export const templateService = {
  getAll: (): Template[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const customTemplates = stored ? JSON.parse(stored) : [];
      return [...DEFAULT_TEMPLATES, ...customTemplates];
    } catch (e) {
      return [...DEFAULT_TEMPLATES];
    }
  },

  add: (template: Omit<Template, 'id' | 'isSystem'>): Template => {
    const newTemplate: Template = {
      ...template,
      id: `tpl-custom-${Date.now()}`,
      isSystem: false
    };

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const customTemplates = stored ? JSON.parse(stored) : [];
      customTemplates.push(newTemplate);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customTemplates));
    } catch (e) {
      console.error("Failed to save custom template", e);
    }

    return newTemplate;
  },

  delete: (id: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const customTemplates = JSON.parse(stored) as Template[];
        const filtered = customTemplates.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }
    } catch (e) {
      console.error("Failed to delete template", e);
    }
  },

  reset: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
