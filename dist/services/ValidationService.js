import { FieldType } from "../interfaces/DataModal.js";
export class ValidationService {
    /**
     * Validate a form submission
     * Returns an array of error messages. Empty array means validation passed.
     */
    validateFormSubmission(form, responses) {
        const errors = [];
        // Create a map of field responses for quick lookup
        const responseMap = responses.reduce((map, response) => {
            map[response.fieldId] = response;
            return map;
        }, {});
        // Check each field
        form.fields.forEach((field) => {
            const response = responseMap[field.id];
            // Check if required field is missing
            if (field.required) {
                if (!response) {
                    errors.push(`Field "${field.label}" is required but no response was provided.`);
                    return;
                }
                // Check if response value is empty
                if (field.type === FieldType.TEXT &&
                    (!response.value || response.value.trim() === "")) {
                    errors.push(`Field "${field.label}" is required but was left empty.`);
                }
                else if (field.type === FieldType.RADIO &&
                    (!response.value || response.value.trim() === "")) {
                    errors.push(`Field "${field.label}" is required but no option was selected.`);
                }
                else if (field.type === FieldType.DROPDOWN &&
                    (!response.value || response.value.trim() === "")) {
                    errors.push(`Field "${field.label}" is required but no option was selected.`);
                }
                else if (field.type === FieldType.CHECKBOX &&
                    (!response.value || response.value.length === 0)) {
                    errors.push(`Field "${field.label}" is required but no option was selected.`);
                }
            }
            // For non-required fields, if a response is provided, validate it
            if (response) {
                // Check if response matches field type
                if (field.type === FieldType.TEXT &&
                    typeof response.value !== "string") {
                    errors.push(`Field "${field.label}" requires a text response.`);
                }
                else if (field.type === FieldType.RADIO &&
                    typeof response.value !== "string") {
                    errors.push(`Field "${field.label}" requires a single selected option.`);
                }
                else if (field.type === FieldType.DROPDOWN &&
                    typeof response.value !== "string") {
                    errors.push(`Field "${field.label}" requires a single selected option.`);
                }
                else if (field.type === FieldType.CHECKBOX &&
                    !Array.isArray(response.value)) {
                    errors.push(`Field "${field.label}" requires checkbox selections.`);
                }
                // For radio, dropdown, and checkbox fields, check if selected options exist
                if ((field.type === FieldType.RADIO ||
                    field.type === FieldType.DROPDOWN) &&
                    field.options) {
                    const validOptions = field.options.map((option) => option.id);
                    if (!validOptions.includes(response.value)) {
                        errors.push(`Field "${field.label}" contains an invalid selection.`);
                    }
                }
                else if (field.type === FieldType.CHECKBOX && field.options) {
                    const validOptions = field.options.map((option) => option.id);
                    if (!response.value.every((value) => validOptions.includes(value))) {
                        errors.push(`Field "${field.label}" contains invalid selections.`);
                    }
                }
            }
        });
        return errors;
    }
}
//# sourceMappingURL=ValidationService.js.map