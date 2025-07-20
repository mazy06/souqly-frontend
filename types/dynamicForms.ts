export interface FormField {
  id: number;
  fieldKey: string;
  fieldLabel: string;
  fieldType: 'text' | 'select' | 'textarea' | 'number' | 'date' | 'checkbox';
  fieldPlaceholder?: string;
  fieldRequired: boolean;
  fieldOptions?: string; // Pour les champs select, séparé par des virgules
  fieldValidation?: string;
  fieldOrder: number;
}

export interface DynamicForm {
  id: number;
  categoryId: number;
  name: string;
  description?: string;
  isActive: boolean;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

export interface FormValues {
  [key: string]: string | number | boolean;
}

export interface ProductFormValue {
  id: number;
  productId: number;
  fieldId: number;
  fieldKey: string;
  fieldLabel: string;
  fieldType: string;
  fieldValue: string;
  createdAt: string;
  updatedAt: string;
} 