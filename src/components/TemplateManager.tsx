import React, { useEffect, useState } from "react";
import { Modal, ConfirmModal } from "./Modal";
import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiEye, FiMail, FiMessageSquare } from "react-icons/fi";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthProvider";

interface Template {
  id: string;
  name: string;
  channel: "email" | "sms" | "whatsapp";
  subject?: string;
  body: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

interface TemplateManagerProps {
  onStatusChange: (status: string) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({ onStatusChange }) => {
  const { accessToken, csrfToken } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterChannel, setFilterChannel] = useState<string>("");
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    channel: "email" as "email" | "sms" | "whatsapp",
    subject: "",
    body: "",
  });
  
  // Preview state
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({});
  const [previewResult, setPreviewResult] = useState<{ subject?: string; body: string } | null>(null);

  const loadTemplates = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const params = filterChannel ? `?channel=${filterChannel}` : "";
      const response = await apiRequest<{ templates: Template[] }>(
        `/business/templates${params}`,
        { accessToken }
      );
      setTemplates(response.templates);
    } catch (err: any) {
      onStatusChange(`❌ ${err?.message || "Failed to load templates"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [accessToken, filterChannel]);

  const resetForm = () => {
    setFormData({
      name: "",
      channel: "email",
      subject: "",
      body: "",
    });
  };

  const handleAddTemplate = async () => {
    if (!accessToken || !formData.name || !formData.body) return;
    try {
      await apiRequest("/business/templates", {
        method: "POST",
        accessToken,
        csrfToken,
        body: formData,
      });
      onStatusChange("✅ Template created successfully");
      setShowAddModal(false);
      resetForm();
      loadTemplates();
    } catch (err: any) {
      onStatusChange(`❌ ${err?.response?.data?.error || err?.message || "Failed to create template"}`);
    }
  };

  const handleEditTemplate = async () => {
    if (!accessToken || !selectedTemplate) return;
    try {
      await apiRequest(`/business/templates/${selectedTemplate.id}`, {
        method: "PUT",
        accessToken,
        csrfToken,
        body: {
          name: formData.name,
          subject: formData.subject,
          body: formData.body,
        },
      });
      onStatusChange("✅ Template updated successfully");
      setShowEditModal(false);
      setSelectedTemplate(null);
      resetForm();
      loadTemplates();
    } catch (err: any) {
      onStatusChange(`❌ ${err?.response?.data?.error || err?.message || "Failed to update template"}`);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!accessToken || !selectedTemplate) return;
    try {
      await apiRequest(`/business/templates/${selectedTemplate.id}`, {
        method: "DELETE",
        accessToken,
        csrfToken,
      });
      onStatusChange("✅ Template deleted successfully");
      setShowDeleteModal(false);
      setSelectedTemplate(null);
      loadTemplates();
    } catch (err: any) {
      onStatusChange(`❌ ${err?.response?.data?.error || err?.message || "Failed to delete template"}`);
    }
  };

  const handleDuplicateTemplate = async (template: Template) => {
    if (!accessToken) return;
    try {
      await apiRequest(`/business/templates/${template.id}/duplicate`, {
        method: "POST",
        accessToken,
        csrfToken,
      });
      onStatusChange("✅ Template duplicated successfully");
      loadTemplates();
    } catch (err: any) {
      onStatusChange(`❌ ${err?.response?.data?.error || err?.message || "Failed to duplicate template"}`);
    }
  };

  const handlePreview = async () => {
    if (!accessToken || !selectedTemplate) return;
    try {
      const response = await apiRequest<{ subject?: string; body: string }>(
        `/business/templates/${selectedTemplate.id}/preview`,
        {
          method: "POST",
          accessToken,
          csrfToken,
          body: { variables: previewVariables },
        }
      );
      setPreviewResult(response);
    } catch (err: any) {
      onStatusChange(`❌ ${err?.response?.data?.error || err?.message || "Failed to preview template"}`);
    }
  };

  const openEditModal = (template: Template) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      channel: template.channel,
      subject: template.subject || "",
      body: template.body,
    });
    setShowEditModal(true);
  };

  const openPreviewModal = (template: Template) => {
    setSelectedTemplate(template);
    const vars: Record<string, string> = {};
    template.variables.forEach((v) => (vars[v] = `[${v}]`));
    setPreviewVariables(vars);
    setPreviewResult(null);
    setShowPreviewModal(true);
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <FiMail className="w-4 h-4" />;
      case "sms":
      case "whatsapp":
        return <FiMessageSquare className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case "email":
        return "bg-blue-100 text-blue-700";
      case "sms":
        return "bg-green-100 text-green-700";
      case "whatsapp":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const renderForm = (isEdit = false) => (
    <div className="space-y-4">
      <div>
        <label className="label">Template Name *</label>
        <input
          type="text"
          className="input"
          placeholder="e.g., Welcome Email"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      
      {!isEdit && (
        <div>
          <label className="label">Channel *</label>
          <select
            className="input"
            value={formData.channel}
            onChange={(e) => setFormData({ ...formData, channel: e.target.value as any })}
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
      )}
      
      {formData.channel === "email" && (
        <div>
          <label className="label">Subject</label>
          <input
            type="text"
            className="input"
            placeholder="e.g., Welcome to {{company}}!"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          />
        </div>
      )}
      
      <div>
        <label className="label">Message Body *</label>
        <textarea
          className="input min-h-[150px] font-mono text-sm"
          placeholder="Hi {{firstName}},&#10;&#10;Welcome to our platform!&#10;&#10;Best regards,&#10;The Team"
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
        />
        <p className="text-xs text-gray-500 mt-1">
          Use {"{{variableName}}"} for dynamic content. Example: {"{{firstName}}"}, {"{{email}}"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Notification Templates</h2>
        <div className="flex gap-2">
          <select
            className="input w-40"
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
          >
            <option value="">All Channels</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="btn btn-primary flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" /> Create Template
          </button>
        </div>
      </div>
      
      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="card text-center py-12">
          <FiMessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-500 mb-4">Create reusable notification templates for your messages</p>
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="btn btn-primary"
          >
            Create Your First Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getChannelColor(template.channel)}`}>
                    {getChannelIcon(template.channel)}
                    {template.channel}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openPreviewModal(template)}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Preview"
                  >
                    <FiEye className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDuplicateTemplate(template)}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Duplicate"
                  >
                    <FiCopy className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => openEditModal(template)}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Edit"
                  >
                    <FiEdit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => { setSelectedTemplate(template); setShowDeleteModal(true); }}
                    className="p-1.5 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
              
              {template.subject && (
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Subject:</strong> {template.subject}
                </p>
              )}
              
              <p className="text-sm text-gray-500 line-clamp-3 mb-3">{template.body}</p>
              
              {template.variables.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {template.variables.map((v) => (
                    <span key={v} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Add Template Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        title="Create Template"
        size="md"
        footer={
          <>
            <button onClick={() => { setShowAddModal(false); resetForm(); }} className="btn btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleAddTemplate}
              className="btn btn-primary"
              disabled={!formData.name || !formData.body}
            >
              Create Template
            </button>
          </>
        }
      >
        {renderForm()}
      </Modal>
      
      {/* Edit Template Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedTemplate(null); resetForm(); }}
        title="Edit Template"
        size="md"
        footer={
          <>
            <button onClick={() => { setShowEditModal(false); setSelectedTemplate(null); resetForm(); }} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleEditTemplate} className="btn btn-primary">
              Save Changes
            </button>
          </>
        }
      >
        {renderForm(true)}
      </Modal>
      
      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => { setShowPreviewModal(false); setSelectedTemplate(null); setPreviewResult(null); }}
        title="Preview Template"
        size="lg"
      >
        {selectedTemplate && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {selectedTemplate.variables.map((v) => (
                <div key={v}>
                  <label className="label">{v}</label>
                  <input
                    type="text"
                    className="input"
                    placeholder={`Enter ${v}...`}
                    value={previewVariables[v] || ""}
                    onChange={(e) => setPreviewVariables({ ...previewVariables, [v]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            
            <button onClick={handlePreview} className="btn btn-secondary w-full">
              Generate Preview
            </button>
            
            {previewResult && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {previewResult.subject && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Subject</p>
                    <p className="font-medium">{previewResult.subject}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 uppercase">Message</p>
                  <p className="whitespace-pre-wrap">{previewResult.body}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
      
      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedTemplate(null); }}
        onConfirm={handleDeleteTemplate}
        title="Delete Template"
        message={
          <p>
            Are you sure you want to delete the template <strong>{selectedTemplate?.name}</strong>?
            This action cannot be undone.
          </p>
        }
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
