// Define supported field types
export enum FieldType {
    TEXT = "text",
    RADIO = "radio",
    CHECKBOX = "checkbox",
    DROPDOWN = "dropdown"
  }
  
  // Interface for form field options (used for radio buttons and checkboxes)
  export interface FieldOption {
    id: string;
    value: string;
  }
  
  // Interface for a form field
  export interface FormField {
    id: string;
    type: FieldType;
    label: string;
    required: boolean;
    options?: FieldOption[]; // Only for RADIO and CHECKBOX fields
    order: number;
  }
  
  // Interface for a form
  export interface Form {
    id: string;
    title: string;
    description: string;
    fields: FormField[];
    createdAt: number; // timestamp
    updatedAt: number; // timestamp
  }
  
  // Interface for a single field response
  export interface FieldResponse {
    fieldId: string;
    value: string | string[]; // string for TEXT and RADIO, string[] for CHECKBOX
  }
  
  // Interface for a form submission
  export interface FormSubmission {
    id: string;
    formId: string;
    responses: FieldResponse[];
    submittedAt: number; // timestamp
  }
  
  // Type for storage keys
  export type StorageKey = 'forms' | 'submissions';