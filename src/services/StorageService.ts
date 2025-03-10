/**
 * Service for handling all local storage operations.
 * This provides a central place to manage data persistence.
 */
import {
  Form,
  FormSubmission,
  FieldResponse,
  StorageKey,
} from "../interfaces/DataModal";

export class StorageService {
  private generateId(): string {
    // Generate a unique ID using current timestamp + random number
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Get all items for a specific storage key
   */
  private getItems<T>(key: StorageKey): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Save items for a specific storage key
   */
  private saveItems<T>(key: StorageKey, items: T[]): void {
    localStorage.setItem(key, JSON.stringify(items));
  }

  /**
   * Get all forms from storage
   */
  getForms(): Form[] {
    return this.getItems<Form>("forms");
  }

  /**
   * Get a specific form by ID
   */
  getFormById(id: string): Form | null {
    const forms = this.getForms();
    return forms.find((form) => form.id === id) || null;
  }

  /**
   * Save a new form or update an existing one
   */
  saveForm(
    form: Omit<Form, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ): Form {
    const forms = this.getForms();
    const now = Date.now();

    // If form has an ID, it's an update
    if (form.id) {
      const existingFormIndex = forms.findIndex((f) => f.id === form.id);

      if (existingFormIndex >= 0) {
        const updatedForm: Form = {
          ...forms[existingFormIndex],
          ...form,
          updatedAt: now,
        };

        forms[existingFormIndex] = updatedForm;
        this.saveItems("forms", forms);
        return updatedForm;
      }
    }

    // Otherwise, create a new form
    const newForm: Form = {
      ...(form as Omit<Form, "id" | "createdAt" | "updatedAt">),
      id: form.id || this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    forms.push(newForm);
    this.saveItems("forms", forms);
    return newForm;
  }

  /**
   * Delete a form by ID
   */
  deleteForm(id: string): boolean {
    const forms = this.getForms();
    const newForms = forms.filter((form) => form.id !== id);

    if (newForms.length < forms.length) {
      this.saveItems("forms", newForms);

      // Also delete all submissions for this form
      this.deleteFormSubmissions(id);
      return true;
    }

    return false;
  }

  /**
   * Get all submissions for a specific form
   */
  getFormSubmissions(formId: string): FormSubmission[] {
    const submissions = this.getItems<FormSubmission>("submissions");
    return submissions.filter((submission) => submission.formId === formId);
  }

  /**
   * Save a form submission
   */
  saveFormSubmission(
    formId: string,
    responses: FieldResponse[]
  ): FormSubmission {
    const submissions = this.getItems<FormSubmission>("submissions");

    const newSubmission: FormSubmission = {
      id: this.generateId(),
      formId,
      responses,
      submittedAt: Date.now(),
    };

    submissions.push(newSubmission);
    this.saveItems("submissions", submissions);
    return newSubmission;
  }

  /**
   * Delete all submissions for a specific form
   */
  private deleteFormSubmissions(formId: string): void {
    const submissions = this.getItems<FormSubmission>("submissions");
    const newSubmissions = submissions.filter(
      (submission) => submission.formId !== formId
    );
    this.saveItems("submissions", newSubmissions);
  }
}
