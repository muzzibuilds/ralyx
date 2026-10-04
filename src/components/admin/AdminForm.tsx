/**
 * Admin Form Component
 * Reusable form for add/edit operations
 */

import React, { useState } from 'react';
import './AdminForm.css';

export interface FormFieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'number' | 'select' | 'textarea';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface AdminFormProps<T> {
  fields: FormFieldConfig[];
  initialValues?: Partial<T>;
  onSubmit: (values: T) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function AdminForm<T extends {}>(
  { fields, initialValues = {}, onSubmit, isSubmitting = false }: AdminFormProps<T>,
) {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required && !values[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(values as T);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      {fields.map((field) => (
        <div key={field.name} className="admin-form__field">
          <label className="admin-form__label">{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea
              name={field.name}
              value={values[field.name] || ''}
              onChange={handleChange}
              placeholder={field.placeholder}
              className="admin-form__textarea"
              required={field.required}
            />
          ) : field.type === 'select' ? (
            <select
              name={field.name}
              value={values[field.name] || ''}
              onChange={handleChange}
              className="admin-form__select"
              required={field.required}
            >
              <option value="">Select an option</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type || 'text'}
              name={field.name}
              value={values[field.name] || ''}
              onChange={handleChange}
              placeholder={field.placeholder}
              className="admin-form__input"
              required={field.required}
            />
          )}
          {errors[field.name] && (
            <span className="admin-form__error">{errors[field.name]}</span>
          )}
        </div>
      ))}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
