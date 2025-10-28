import React, { useState, useEffect } from "react";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import { toast } from "react-toastify";
import { format } from "date-fns";

const ActivityForm = ({ activity, contacts, deals, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    type_c: "",
    date_c: "",
    description_c: "",
    contact_id_c: "",
    deal_id_c: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activity) {
      setFormData({
        type_c: activity.type_c || "",
        date_c: activity.date_c ? format(new Date(activity.date_c), "yyyy-MM-dd'T'HH:mm") : "",
        description_c: activity.description_c || "",
        contact_id_c: activity.contact_id_c?.Id || activity.contact_id_c || "",
        deal_id_c: activity.deal_id_c?.Id || activity.deal_id_c || ""
      });
    } else {
      setFormData({
        type_c: "",
        date_c: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        description_c: "",
        contact_id_c: "",
        deal_id_c: ""
      });
    }
  }, [activity]);

  const activityTypes = [
    { value: "", label: "Select Type" },
    { value: "call", label: "Call" },
    { value: "email", label: "Email" },
    { value: "meeting", label: "Meeting" },
    { value: "note", label: "Note" },
    { value: "task", label: "Task" }
  ];

  const contactOptions = [
    { value: "", label: "Select Contact" },
    ...contacts.map((contact) => ({
      value: contact.Id,
      label: contact.name_c
    }))
  ];

  const dealOptions = [
    { value: "", label: "No Deal (Optional)" },
    ...deals.map((deal) => ({
      value: deal.Id,
      label: deal.name_c
    }))
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.type_c) {
      newErrors.type_c = "Activity type is required";
    }

    if (!formData.description_c?.trim()) {
      newErrors.description_c = "Description is required";
    }

    if (!formData.contact_id_c) {
      newErrors.contact_id_c = "Contact is required";
    }

    if (!formData.date_c) {
      newErrors.date_c = "Date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        type_c: formData.type_c,
        date_c: new Date(formData.date_c).toISOString(),
        description_c: formData.description_c.trim(),
        contact_id_c: parseInt(formData.contact_id_c)
      };

      if (formData.deal_id_c) {
        submitData.deal_id_c = parseInt(formData.deal_id_c);
      }

      await onSave(submitData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Activity Type"
        name="type_c"
        value={formData.type_c}
        onChange={handleChange}
        options={activityTypes}
        error={errors.type_c}
        required
      />

      <Input
        label="Date & Time"
        type="datetime-local"
        name="date_c"
        value={formData.date_c}
        onChange={handleChange}
        error={errors.date_c}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description_c"
          value={formData.description_c}
          onChange={handleChange}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.description_c ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter activity description..."
        />
        {errors.description_c && (
          <p className="mt-1 text-sm text-red-500">{errors.description_c}</p>
        )}
      </div>

      <Select
        label="Contact"
        name="contact_id_c"
        value={formData.contact_id_c}
        onChange={handleChange}
        options={contactOptions}
        error={errors.contact_id_c}
        required
      />

      <Select
        label="Deal (Optional)"
        name="deal_id_c"
        value={formData.deal_id_c}
        onChange={handleChange}
        options={dealOptions}
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : activity ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
};

export default ActivityForm;