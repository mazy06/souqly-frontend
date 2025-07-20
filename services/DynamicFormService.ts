import { getApiUrl } from '../constants/Config';
import { DynamicForm, FormValues, ProductFormValue } from '../types/dynamicForms';

class DynamicFormService {
  private baseUrl = getApiUrl('/forms');

  /**
   * Récupère le formulaire dynamique pour une catégorie
   */
  async getFormByCategory(categoryId: number): Promise<DynamicForm | null> {
    try {
      const response = await fetch(`${this.baseUrl}/category/${categoryId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return null; // Pas de formulaire pour cette catégorie
      }

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération du formulaire:', error);
      return null;
    }
  }

  /**
   * Récupère les valeurs de formulaire pour un produit
   */
  async getProductFormValues(productId: number): Promise<ProductFormValue[]> {
    try {
      const response = await fetch(`${this.baseUrl}/product/${productId}/values`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des valeurs:', error);
      return [];
    }
  }

  /**
   * Sauvegarde les valeurs de formulaire pour un produit
   */
  async saveProductFormValues(productId: number, formValues: FormValues): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/product/${productId}/values`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formValues),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des valeurs:', error);
      return false;
    }
  }

  /**
   * Récupère tous les formulaires (admin)
   */
  async getAllForms(): Promise<DynamicForm[]> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/forms', '/admin/forms')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des formulaires:', error);
      return [];
    }
  }

  /**
   * Récupère un formulaire par ID (admin)
   */
  async getFormById(formId: number): Promise<DynamicForm | null> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/forms', '/admin/forms')}/${formId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération du formulaire:', error);
      return null;
    }
  }

  /**
   * Crée un nouveau formulaire (admin)
   */
  async createForm(formData: Partial<DynamicForm>): Promise<DynamicForm | null> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/forms', '/admin/forms')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création du formulaire:', error);
      return null;
    }
  }

  /**
   * Met à jour un formulaire (admin)
   */
  async updateForm(formId: number, formData: Partial<DynamicForm>): Promise<DynamicForm | null> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/forms', '/admin/forms')}/${formId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du formulaire:', error);
      return null;
    }
  }

  /**
   * Supprime un formulaire (admin)
   */
  async deleteForm(formId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/forms', '/admin/forms')}/${formId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du formulaire:', error);
      return false;
    }
  }

  /**
   * Ajoute un champ à un formulaire (admin)
   */
  async addFieldToForm(formId: number, fieldData: any): Promise<DynamicForm | null> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/forms', '/admin/forms')}/${formId}/fields`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fieldData),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du champ:', error);
      return null;
    }
  }

  /**
   * Met à jour un champ d'un formulaire (admin)
   */
  async updateFieldInForm(formId: number, fieldId: number, fieldData: any): Promise<DynamicForm | null> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/forms', '/admin/forms')}/${formId}/fields/${fieldId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fieldData),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du champ:', error);
      return null;
    }
  }

  /**
   * Supprime un champ d'un formulaire (admin)
   */
  async deleteFieldFromForm(formId: number, fieldId: number): Promise<DynamicForm | null> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/forms', '/admin/forms')}/${formId}/fields/${fieldId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la suppression du champ:', error);
      return null;
    }
  }

  /**
   * Active/désactive un formulaire (admin)
   */
  async toggleFormStatus(formId: number): Promise<DynamicForm | null> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/forms', '/admin/forms')}/${formId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error);
      return null;
    }
  }

  /**
   * Récupère le token d'authentification
   */
  private async getAuthToken(): Promise<string> {
    // Cette méthode devra être adaptée selon votre système d'authentification
    // Pour l'instant, on utilise un token statique pour les tests
    return 'eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBzb3VxbHkuY29tIiwiaWF0IjoxNzUzMDI0ODAxLCJleHAiOjE3NTMxMTEyMDEsInVzZXJJZCI6MSwicm9sZSI6IkFETUlOIn0.rIyuiGpngcLc2T2JFXrEZJ9Hhkz7Uap-pgFcwNIcaDjIvxf-SoQcjmfOPVYHhbJL';
  }
}

export default new DynamicFormService(); 