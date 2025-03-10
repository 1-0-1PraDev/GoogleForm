export class StorageService {
    generateId() {
        // Generate a unique ID using current timestamp + random number
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    /**
     * Get all items for a specific storage key
     */
    getItems(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }
    /**
     * Save items for a specific storage key
     */
    saveItems(key, items) {
        localStorage.setItem(key, JSON.stringify(items));
    }
    /**
     * Get all forms from storage
     */
    getForms() {
        return this.getItems("forms");
    }
    /**
     * Get a specific form by ID
     */
    getFormById(id) {
        const forms = this.getForms();
        return forms.find((form) => form.id === id) || null;
    }
    /**
     * Save a new form or update an existing one
     */
    saveForm(form) {
        const forms = this.getForms();
        const now = Date.now();
        // If form has an ID, it's an update
        if (form.id) {
            const existingFormIndex = forms.findIndex((f) => f.id === form.id);
            if (existingFormIndex >= 0) {
                const updatedForm = Object.assign(Object.assign(Object.assign({}, forms[existingFormIndex]), form), { updatedAt: now });
                forms[existingFormIndex] = updatedForm;
                this.saveItems("forms", forms);
                return updatedForm;
            }
        }
        // Otherwise, create a new form
        const newForm = Object.assign(Object.assign({}, form), { id: form.id || this.generateId(), createdAt: now, updatedAt: now });
        forms.push(newForm);
        this.saveItems("forms", forms);
        return newForm;
    }
    /**
     * Delete a form by ID
     */
    deleteForm(id) {
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
    getFormSubmissions(formId) {
        const submissions = this.getItems("submissions");
        return submissions.filter((submission) => submission.formId === formId);
    }
    /**
     * Save a form submission
     */
    saveFormSubmission(formId, responses) {
        const submissions = this.getItems("submissions");
        const newSubmission = {
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
    deleteFormSubmissions(formId) {
        const submissions = this.getItems("submissions");
        const newSubmissions = submissions.filter((submission) => submission.formId !== formId);
        this.saveItems("submissions", newSubmissions);
    }
}
//# sourceMappingURL=StorageService.js.map