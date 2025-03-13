/**
 * Service for managing form operations.
 * This service uses the StorageService for persistence.
 */
import { FieldType, } from "../interfaces/DataModal.js";
export class FormService {
    storageService;
    constructor(storageService) {
        this.storageService = storageService;
    }
    /**
     * Get all available forms
     */
    getAllForms() {
        return this.storageService.getForms();
    }
    /**
     * Get a specific form by ID
     */
    getForm(id) {
        return this.storageService.getFormById(id);
    }
    /**
     * Create a new form
     */
    createForm(title, description) {
        return this.storageService.saveForm({
            title,
            description,
            fields: [],
        });
    }
    /**
     * Update form basic details
     */
    updateFormDetails(id, title, description) {
        const form = this.getForm(id);
        if (!form)
            return null;
        return this.storageService.saveForm({
            ...form,
            title,
            description,
        });
    }
    /**
     * Add a new field to a form
     */
    addField(formId, fieldType, label, required = false, options = []) {
        const form = this.getForm(formId);
        if (!form)
            return null;
        const newField = {
            id: Date.now().toString(36) + Math.random().toString(36).substring(2),
            type: fieldType,
            label,
            required,
            order: form.fields.length,
            ...(fieldType !== FieldType.TEXT ? { options } : {}),
        };
        const updatedForm = {
            ...form,
            fields: [...form.fields, newField],
        };
        return this.storageService.saveForm(updatedForm);
    }
    /**
     * Update an existing field
     */
    updateField(formId, fieldId, updates) {
        const form = this.getForm(formId);
        if (!form)
            return null;
        const fieldIndex = form.fields.findIndex((field) => field.id === fieldId);
        if (fieldIndex === -1)
            return null;
        const updatedFields = [...form.fields];
        updatedFields[fieldIndex] = {
            ...updatedFields[fieldIndex],
            ...updates,
        };
        const updatedForm = {
            ...form,
            fields: updatedFields,
        };
        return this.storageService.saveForm(updatedForm);
    }
    /**
     * Delete a field from a form
     */
    deleteField(formId, fieldId) {
        const form = this.getForm(formId);
        if (!form)
            return null;
        const updatedFields = form.fields.filter((field) => field.id !== fieldId);
        // Reorder remaining fields
        updatedFields.forEach((field, index) => {
            field.order = index;
        });
        const updatedForm = {
            ...form,
            fields: updatedFields,
        };
        return this.storageService.saveForm(updatedForm);
    }
    /**
     * Reorder fields in a form
     */
    reorderFields(formId, fieldIds) {
        const form = this.getForm(formId);
        if (!form)
            return null;
        // Make sure all field IDs are valid
        if (fieldIds.length !== form.fields.length ||
            !fieldIds.every((id) => form.fields.some((field) => field.id === id))) {
            return null;
        }
        // Create a map of fields by ID for quick lookup
        const fieldsMap = form.fields.reduce((map, field) => {
            map[field.id] = field;
            return map;
        }, {});
        // Reorder fields based on the new order
        const reorderedFields = fieldIds.map((id, index) => ({
            ...fieldsMap[id],
            order: index,
        }));
        const updatedForm = {
            ...form,
            fields: reorderedFields,
        };
        return this.storageService.saveForm(updatedForm);
    }
    /**
     * Delete a form
     */
    deleteForm(id) {
        return this.storageService.deleteForm(id);
    }
    /**
     * Submit responses to a form
     */
    submitFormResponses(formId, responses) {
        const form = this.getForm(formId);
        if (!form)
            return null;
        return this.storageService.saveFormSubmission(formId, responses);
    }
    /**
     * Get all submissions for a form
     */
    getFormSubmissions(formId) {
        return this.storageService.getFormSubmissions(formId);
    }
}
//# sourceMappingURL=FormService.js.map