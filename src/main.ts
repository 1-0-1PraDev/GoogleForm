import "./styles.css";

import { StorageService } from "./services/StorageService";
import { FormService } from "./services/FormService";
import { ValidationService } from "./services/ValidationService";
import {
  Form,
  FieldType,
  FieldOption,
  FormField,
  FieldResponse,
  FormSubmission,
} from "./interfaces/DataModal";

// Initialize services
const storageService = new StorageService();
const formService = new FormService(storageService);
const validationService = new ValidationService();

// Check for saved theme preference or use device preference
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
const savedTheme = localStorage.getItem("theme");

// Application state
let currentForm: Form | null = null;
let currentFieldId: string | null = null;
let currentFieldType: FieldType | null = FieldType.TEXT;
let isEditingField: boolean = false;

// Apply the saved theme or default to user's device preference
if (savedTheme === "dark" || (!savedTheme && prefersDarkScheme.matches)) {
  document.documentElement.setAttribute("data-theme", "dark");
} else {
  document.documentElement.setAttribute("data-theme", "light");
}

// DOM Elements
const mainContent = document.getElementById("mainContent") as HTMLElement;
const viewFormsBtn = document.getElementById(
  "viewFormsBtn"
) as HTMLButtonElement;
const createFormBtn = document.getElementById(
  "createFormBtn"
) as HTMLButtonElement;
const formsList = document.getElementById("formsList") as HTMLElement;
const emptyFormsList = document.getElementById("emptyFormsList") as HTMLElement;

// Views
const formsListView = document.getElementById("formsListView") as HTMLElement;
const formBuilderView = document.getElementById(
  "formBuilderView"
) as HTMLElement;
const formPreviewView = document.getElementById(
  "formPreviewView"
) as HTMLElement;
const formResponsesView = document.getElementById(
  "formResponsesView"
) as HTMLElement;

// Form Builder Elements
const formTitle = document.getElementById("formTitle") as HTMLInputElement;
const formDescription = document.getElementById(
  "formDescription"
) as HTMLTextAreaElement;
const formFields = document.getElementById("formFields") as HTMLElement;
const saveFormBtn = document.getElementById("saveFormBtn") as HTMLButtonElement;
const previewFormBtn = document.getElementById(
  "previewFormBtn"
) as HTMLButtonElement;

// Field Type Buttons
const fieldTypeButtons = document.querySelectorAll(
  ".field-type-btn"
) as NodeListOf<HTMLButtonElement>;

// Field Modal Elements
const fieldModal = document.getElementById("fieldModal") as HTMLElement;
const modalTitle = document.getElementById("modalTitle") as HTMLElement;
const fieldLabel = document.getElementById("fieldLabel") as HTMLInputElement;
const fieldRequired = document.getElementById(
  "fieldRequired"
) as HTMLInputElement;
const optionsContainer = document.getElementById(
  "optionsContainer"
) as HTMLElement;
const optionsList = document.getElementById("optionsList") as HTMLElement;
const addOptionBtn = document.getElementById(
  "addOptionBtn"
) as HTMLButtonElement;
const saveFieldBtn = document.getElementById(
  "saveFieldBtn"
) as HTMLButtonElement;
const cancelFieldBtn = document.getElementById(
  "cancelFieldBtn"
) as HTMLButtonElement;
const closeModalBtn = document.querySelector(".close-modal") as HTMLElement;

// Preview Form Elements
const previewFormTitle = document.getElementById(
  "previewFormTitle"
) as HTMLElement;
const previewFormDescription = document.getElementById(
  "previewFormDescription"
) as HTMLElement;
const previewForm = document.getElementById("previewForm") as HTMLFormElement;
const submitPreviewBtn = document.getElementById(
  "submitPreviewBtn"
) as HTMLButtonElement;
const backToEditBtn = document.getElementById(
  "backToEditBtn"
) as HTMLButtonElement;

// Theme Toggle Button
const themeToggleBtn = document.getElementById(
  "theme-toggle"
) as HTMLButtonElement;

// Navigation Event Listeners
viewFormsBtn.addEventListener("click", () => {
  showView(formsListView);
  loadFormsList();
  // currentForm = null;
});

// Create Form Button Event Listener.
createFormBtn.addEventListener("click", () => {
  // Don't create a new form automatically, just show the form builder view
  showView(formBuilderView);

  // Just show the form builder view and reset fields
  formTitle.value = "Untitled Form";
  formDescription.value = "";
  formFields.innerHTML = "";
  currentForm = null; // Reset currentForm
  fieldModal.classList.add("hidden");

  currentForm = null; // Reset currentForm

  // Ensure modal is closed
  fieldModal.classList.add("hidden");
});

// Form Builder Event Listeners
// formTitle.addEventListener("change", () => {
//   if (currentForm) {
//     currentForm = formService.updateFormDetails(
//       currentForm.id,
//       formTitle.value,
//       formDescription.value
//     );
//   }
// });

// formDescription.addEventListener("change", () => {
//   if (currentForm) {
//     currentForm = formService.updateFormDetails(
//       currentForm.id,
//       formTitle.value,
//       formDescription.value
//     );
//   }
// });

// Field Type Button Event Listeners
fieldTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // If no current form, create one from the current title/description
    if (!currentForm) {
      currentForm = formService.createForm(
        formTitle.value || "Untitled Form",
        formDescription.value
      );
    }

    const fieldType = button.getAttribute("data-type") as FieldType;
    if (fieldType) {
      openFieldModal(fieldType);
    }
  });
});

// Field Modal Event Listeners
saveFieldBtn.addEventListener("click", saveField);
cancelFieldBtn.addEventListener("click", closeFieldModal);
closeModalBtn.addEventListener("click", closeFieldModal);
addOptionBtn.addEventListener("click", addOption);

// Theme Toggle Button Event Listener
themeToggleBtn.addEventListener("click", toggleTheme);

// Form Action Buttons
saveFormBtn.addEventListener("click", () => {
  console.log("saveFormBtn clicked");
  console.log(currentForm);

  // Only create new form if there isn't a current form
  if (!currentForm) {
    // First time saving - create new form
    const newForm = formService.createForm(
      formTitle.value || "Untitled Form",
      formDescription.value
    );
    currentForm = newForm;
  } else {
    // Update the form details one last time before saving
    currentForm = formService.updateFormDetails(
      currentForm.id,
      formTitle.value,
      formDescription.value
    );
  }

  alert("Form saved successfully!");
  showView(formsListView);
  loadFormsList();

  // Reset currentForm after saving
  currentForm = null;
});

previewFormBtn.addEventListener("click", () => {
  if (currentForm) {
    renderFormPreview();
    showView(formPreviewView);
  }
});

backToEditBtn.addEventListener("click", () => {
  showView(formBuilderView);
});

submitPreviewBtn.addEventListener("click", submitForm);

// Initialize the application
loadFormsList();

// Helper Functions

// Theme Toggle Function
function toggleTheme() {
  const currentTheme: string | null =
    document.documentElement.getAttribute("data-theme");
  const newTheme: string = currentTheme === "light" ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);

  updateThemeIcon();
}

// Update button icon based on current theme
function updateThemeIcon() {
  const currentTheme: string | null =
    document.documentElement.getAttribute("data-theme");
  const themeIcon: HTMLElement | null = document.getElementById("theme-icon");

  if (themeIcon) {
    if (currentTheme === "dark") {
      themeIcon.textContent = "☀️"; // Sun icon for light mode option
    } else {
      themeIcon.textContent = "🌙"; // Moon icon for dark mode option
    }
  }
}

function showView(view: HTMLElement) {
  // Hide all views
  formsListView.classList.add("hidden");
  formBuilderView.classList.add("hidden");
  formPreviewView.classList.add("hidden");
  formResponsesView.classList.add("hidden");

  // Show the requested view
  view.classList.remove("hidden");

  // Update navigation buttons
  viewFormsBtn.classList.remove("active");
  createFormBtn.classList.remove("active");

  if (view === formsListView) {
    viewFormsBtn.classList.add("active");
  } else if (view === formBuilderView) {
    createFormBtn.classList.add("active");
  }
}

function loadFormsList() {
  const forms = formService.getAllForms();

  if (forms.length === 0) {
    formsList.innerHTML = "";
    emptyFormsList.style.display = "block";
  } else {
    emptyFormsList.style.display = "none";

    formsList.innerHTML = forms
      .map(
        (form) => `
            <div class="form-card" data-id="${form.id}">
                <h3>${form.title || "Untitled Form"}</h3>
                <p>${form.description || "No description"}</p>
                <div class="form-card-actions">
                    <button class="card-btn edit-form-btn" data-id="${
                      form.id
                    }">Edit</button>
                    <button class="card-btn view-responses-btn" data-id="${
                      form.id
                    }">View Responses</button>
                    <button class="card-btn delete-form-btn" data-id="${
                      form.id
                    }">Delete</button>
                </div>
            </div>
        `
      )
      .join("");

    // Add event listeners to form cards
    document.querySelectorAll(".edit-form-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const formId = (btn as HTMLElement).getAttribute("data-id");
        if (formId) {
          editForm(formId);
        }
      });
    });

    document.querySelectorAll(".view-responses-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const formId = (btn as HTMLElement).getAttribute("data-id");
        if (formId) {
          viewResponses(formId);
        }
      });
    });

    document.querySelectorAll(".delete-form-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const formId = (btn as HTMLElement).getAttribute("data-id");
        if (formId && confirm("Are you sure you want to delete this form?")) {
          formService.deleteForm(formId);
          loadFormsList();
        }
      });
    });

    // Make the entire card clickable for editing
    document.querySelectorAll(".form-card").forEach((card) => {
      card.addEventListener("click", () => {
        const formId = (card as HTMLElement).getAttribute("data-id");
        if (formId) {
          editForm(formId);
        }
      });
    });
  }
}

function editForm(formId: string) {
  currentForm = formService.getForm(formId);

  if (currentForm) {
    formTitle.value = currentForm.title;
    formDescription.value = currentForm.description;

    // Render form fields
    renderFormFields();

    showView(formBuilderView);
  }
}

function renderFormFields() {
  if (!currentForm) return;

  formFields.innerHTML = currentForm.fields
    .sort((a, b) => a.order - b.order)
    .map((field) => {
      let fieldContent = "";

      switch (field.type) {
        case FieldType.TEXT:
          fieldContent = `<input type="text" disabled placeholder="Text field" class="preview-input">`;
          break;
        case FieldType.RADIO:
          fieldContent = (field.options || [])
            .map(
              (option) => `
                        <div class="option-preview">
                            <input type="radio" disabled>
                            <label>${option.value}</label>
                        </div>
                    `
            )
            .join("");
          break;
        case FieldType.CHECKBOX:
          fieldContent = (field.options || [])
            .map(
              (option) => `
                        <div class="option-preview">
                            <input type="checkbox" disabled>
                            <label>${option.value}</label>
                        </div>
                    `
            )
            .join("");
          break;
        case FieldType.DROPDOWN:
          fieldContent = `
                        <select disabled class="preview-select">
                            <option value="">Select an option</option>
                            ${(field.options || [])
                              .map(
                                (option) => `
                                <option value="${option.id}">${option.value}</option>
                            `
                              )
                              .join("")}
                        </select>
                    `;
          break;
      }

      return `
                <div class="form-field" data-id="${field.id}">
                    <div class="field-actions">
                        <button class="field-action edit-field-btn" data-id="${
                          field.id
                        }">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="field-action delete-field-btn" data-id="${
                          field.id
                        }">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                    <div class="field-label">
                        ${field.label} ${
        field.required ? '<span class="field-required">*</span>' : ""
      }
                    </div>
                    <div class="field-content">
                        ${fieldContent}
                    </div>
                </div>
            `;
    })
    .join("");

  // Add event listeners to field actions
  document.querySelectorAll(".edit-field-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const fieldId = (btn as HTMLElement).getAttribute("data-id");
      if (fieldId && currentForm) {
        const field = currentForm.fields.find((f) => f.id === fieldId);
        if (field) {
          editField(field);
        }
      }
    });
  });

  document.querySelectorAll(".delete-field-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const fieldId = (btn as HTMLElement).getAttribute("data-id");
      if (
        fieldId &&
        currentForm &&
        confirm("Are you sure you want to delete this field?")
      ) {
        currentForm = formService.deleteField(currentForm.id, fieldId);
        renderFormFields();
      }
    });
  });
}

function openFieldModal(type: FieldType, field?: FormField) {
  currentFieldType = type;
  isEditingField = !!field;
  currentFieldId = field?.id || null;

  // Reset modal fields
  fieldLabel.value = field?.label || "";
  fieldRequired.checked = field?.required || false;

  // Show/hide options container based on field type
  if (
    type === FieldType.RADIO ||
    type === FieldType.CHECKBOX ||
    type === FieldType.DROPDOWN
  ) {
    optionsContainer.classList.remove("hidden");

    // Reset options list
    optionsList.innerHTML = "";

    // Add existing options if editing
    if (field && field.options) {
      field.options.forEach((option) => {
        addOptionToList(option.id, option.value);
      });
    } else {
      // Add two default options
      addOption();
      addOption();
    }
  } else {
    optionsContainer.classList.add("hidden");
  }

  // Update modal title
  modalTitle.textContent = isEditingField ? "Edit Field" : "Add New Field";

  // Show the modal
  fieldModal.classList.remove("hidden");
}

function closeFieldModal() {
  fieldModal.classList.add("hidden");
  currentFieldType = null;
  isEditingField = false;
  currentFieldId = null;
}

function addOption() {
  const optionId =
    Date.now().toString(36) + Math.random().toString(36).substring(2);
  addOptionToList(optionId, "");
}

function addOptionToList(id: string, value: string) {
  const optionItem = document.createElement("div");
  optionItem.className = "option-item";
  optionItem.innerHTML = `
        <input type="text" class="option-value" value="${value}" placeholder="Option text" data-id="${id}">
        <button type="button" class="remove-option">✕</button>
    `;

  // Add event listener to remove button
  const removeBtn = optionItem.querySelector(
    ".remove-option"
  ) as HTMLButtonElement;
  removeBtn.addEventListener("click", () => {
    optionItem.remove();
  });

  optionsList.appendChild(optionItem);
}

function saveField() {
  if (!currentForm || !currentFieldType) {
    alert("Please select a field type.");
    return;
  }

  const label = fieldLabel.value.trim();
  if (!label) {
    alert("Please enter a field label.");
    return;
  }
  console.log(currentForm);
  const required = fieldRequired.checked;

  // Get options for radio, checkbox, or dropdown fields
  let options: FieldOption[] = [];
  if (
    currentFieldType === FieldType.RADIO ||
    currentFieldType === FieldType.CHECKBOX ||
    currentFieldType === FieldType.DROPDOWN
  ) {
    const optionInputs = optionsList.querySelectorAll(
      ".option-value"
    ) as NodeListOf<HTMLInputElement>;

    if (optionInputs.length < 2) {
      alert("Please add at least two options.");
      return;
    }

    options = Array.from(optionInputs).map((input) => ({
      id: input.getAttribute("data-id") || "",
      value: input.value.trim(),
    }));

    // Check for empty options
    if (options.some((option) => !option.value)) {
      alert("Please fill in all option values.");
      return;
    }
  }

  if (isEditingField && currentFieldId) {
    // Update existing field
    currentForm = formService.updateField(currentForm!.id, currentFieldId, {
      label,
      required,
      ...(options.length ? { options } : {}),
    });
  } else {
    // Add new field
    currentForm = formService.addField(
      currentForm.id,
      currentFieldType,
      label,
      required,
      options
    );
  }

  closeFieldModal();
  renderFormFields();
}

function renderFormPreview() {
  if (!currentForm) return;

  previewFormTitle.textContent = currentForm.title || "Untitled Form";
  previewFormDescription.textContent = currentForm.description || "";

  previewForm.innerHTML = currentForm.fields
    .sort((a, b) => a.order - b.order)
    .map((field) => {
      let fieldContent = "";
      const fieldId = `preview_${field.id}`;

      switch (field.type) {
        case FieldType.TEXT:
          fieldContent = `
                        <input type="text" id="${fieldId}" name="${field.id}" class="preview-input">
                    `;
          break;
        case FieldType.RADIO:
          fieldContent = (field.options || [])
            .map(
              (option) => `
                        <div class="option-item">
                            <input type="radio" id="${fieldId}_${option.id}" name="${field.id}" value="${option.id}">
                            <label for="${fieldId}_${option.id}">${option.value}</label>
                        </div>
                    `
            )
            .join("");
          break;
        case FieldType.CHECKBOX:
          fieldContent = (field.options || [])
            .map(
              (option) => `
                        <div class="option-item">
                            <input type="checkbox" id="${fieldId}_${option.id}" name="${field.id}" value="${option.id}">
                            <label for="${fieldId}_${option.id}">${option.value}</label>
                        </div>
                    `
            )
            .join("");
          break;
        case FieldType.DROPDOWN:
          fieldContent = `
                        <select id="${fieldId}" name="${
            field.id
          }" class="preview-select">
                            <option value="">-- Select an option --</option>
                            ${(field.options || [])
                              .map(
                                (option) => `
                                <option value="${option.id}">${option.value}</option>
                            `
                              )
                              .join("")}
                        </select>
                    `;
          break;
      }

      return `
                <div class="preview-field">
                    <div class="preview-label">
                        ${field.label} ${
        field.required ? '<span class="field-required">*</span>' : ""
      }
                    </div>
                    <div class="preview-field-content">
                        ${fieldContent}
                    </div>
                </div>
            `;
    })
    .join("");
}

function submitForm(e: Event) {
  e.preventDefault();

  if (!currentForm) return;

  const responses: FieldResponse[] = [];

  // Collect responses from the form
  currentForm.fields.forEach((field) => {
    let value: string | string[] = "";

    switch (field.type) {
      case FieldType.TEXT:
        const textInput = document.getElementById(
          `preview_${field.id}`
        ) as HTMLInputElement;
        value = textInput?.value || "";
        break;
      case FieldType.RADIO:
        const selectedRadio = document.querySelector(
          `input[name="${field.id}"]:checked`
        ) as HTMLInputElement;
        value = selectedRadio?.value || "";
        break;
      case FieldType.DROPDOWN:
        const select = document.getElementById(
          `preview_${field.id}`
        ) as HTMLSelectElement;
        value = select?.value || "";
        break;
      case FieldType.CHECKBOX:
        const checkboxes = document.querySelectorAll(
          `input[name="${field.id}"]:checked`
        ) as NodeListOf<HTMLInputElement>;
        value = Array.from(checkboxes).map((cb) => cb.value);
        break;
    }

    responses.push({
      fieldId: field.id,
      value,
    });
  });

  // Validate the submission
  const validationErrors = validationService.validateFormSubmission(
    currentForm,
    responses
  );

  if (validationErrors.length > 0) {
    alert(`Please fix the following errors:\n${validationErrors.join("\n")}`);
    return;
  }

  // Save the submission
  const submission = formService.submitFormResponses(currentForm.id, responses);

  if (submission) {
    alert("Form submitted successfully!");
    showView(formsListView);
    loadFormsList();
  } else {
    alert("An error occurred while submitting the form.");
  }
}

function editField(field: FormField) {
  openFieldModal(field.type, field);
}

function viewResponses(formId: string) {
  const form = formService.getForm(formId);
  const submissions = formService.getFormSubmissions(formId);

  if (!form) return;

  const responsesFormTitle = document.getElementById(
    "responsesFormTitle"
  ) as HTMLElement;
  const responsesSummary = document.getElementById(
    "responsesSummary"
  ) as HTMLElement;
  const responsesList = document.getElementById("responsesList") as HTMLElement;

  responsesFormTitle.textContent = `Responses for: ${
    form.title || "Untitled Form"
  }`;

  // Display summary
  responsesSummary.innerHTML = `
        <div class="summary-card">
            <h3>Total Submissions</h3>
            <p class="summary-number">${submissions.length}</p>
        </div>
    `;

  // Display individual responses
  if (submissions.length === 0) {
    responsesList.innerHTML =
      '<div class="empty-state">No responses yet.</div>';
  } else {
    // Create a map of field IDs to field objects for easier lookup
    const fieldsMap = form.fields.reduce((map: any, field: any) => {
      map[field.id] = field;
      return map;
    }, {} as Record<string, FormField>);

    // Display responses
    responsesList.innerHTML = submissions
      .map((submission, index) => {
        // Format the date
        const date = new Date(submission.submittedAt);
        const formattedDate =
          date.toLocaleDateString() + " " + date.toLocaleTimeString();

        // Format the responses
        const responseItems = submission.responses
          .map((response: any) => {
            const field = fieldsMap[response.fieldId];
            if (!field) return ""; // Skip if field doesn't exist anymore

            let displayValue = "";

            switch (field.type) {
              case FieldType.TEXT:
                displayValue = response.value as string;
                break;
              case FieldType.RADIO:
              case FieldType.DROPDOWN:
                const optionId = response.value as string;
                const option = field.options?.find(
                  (opt: any) => opt.id === optionId
                );
                displayValue = option ? option.value : "Unknown option";
                break;
              case FieldType.CHECKBOX:
                const optionIds = response.value as string[];
                displayValue = optionIds
                  .map((id) => {
                    const option = field.options?.find(
                      (opt: any) => opt.id === id
                    );
                    return option ? option.value : "Unknown option";
                  })
                  .join(", ");
                break;
            }

            return `
                    <div class="response-item">
                        <div class="response-question">${field.label}</div>
                        <div class="response-answer">${
                          displayValue || "No response"
                        }</div>
                    </div>
                `;
          })
          .join("");

        return `
                <div class="response-card">
                    <div class="response-header">
                        <h3>Response #${index + 1}</h3>
                        <div class="response-date">${formattedDate}</div>
                    </div>
                    <div class="response-body">
                        ${responseItems}
                    </div>
                </div>
            `;
      })
      .join("");
  }

  // Add event listener to export button
  const exportResponsesBtn = document.getElementById(
    "exportResponsesBtn"
  ) as HTMLButtonElement;
  exportResponsesBtn.addEventListener("click", () => {
    // exportResponsesToJSON(form, submissions);
  });

  // Add event listener to back button
  const backToFormsBtn = document.getElementById(
    "backToFormsBtn"
  ) as HTMLButtonElement;
  backToFormsBtn.addEventListener("click", () => {
    showView(formsListView);
  });

  showView(formResponsesView);
}

// function exportResponsesToJSON(form: Form, submissions: FormSubmission[]) {
//     // Create a map of field IDs to field objects for easier lookup
//     const fieldsMap = form.fields.reduce((map, field) => {
//         map[field.id] = field;
//         return map;
//     }, {} as Record<string, FormField>);

//     // Format the data for export
//     const exportData = {
//         formTitle: form.title,
//         formDescription: form.description,
//         submissions: submissions.map(submission => {
//             const formattedResponses = submission.responses.reduce((formatted, response) => {
//                 const field = fieldsMap[response.fieldId];
//                 if (field) {
//                     let value = response.value;

//                     // For radio and dropdown, replace option ID with text
//                     if ((field.type === FieldType.RADIO || field.type === FieldType.DROPDOWN) && typeof value === 'string') {
//                         const option = field.options?.find(opt => opt.id === value);
//                         value = option ? option.value : value;
//                     }

//                     // For checkbox, replace option IDs with text
//                     if (field.type === FieldType.CHECKBOX && Array.isArray(value)) {
//                         value = value.map(id => {
//                             const option = field.options?.find(opt => opt.id === id);
//                             return option ? option.value : id;
//                         });
//                     }

//                     formatted[field.label] = value;
//                 }
//                 return formatted;
//             }, {} as Record<string, any>);

//             return {
//                 submissionDate: new Date(submission.submittedAt
