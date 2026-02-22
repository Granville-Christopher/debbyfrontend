import React, { useEffect, useState } from "react";
import { Modal, ConfirmModal } from "./Modal";
import { Collapsible } from "./Collapsible";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiDownload, FiUpload, FiTag, FiMail, FiPhone, FiUser } from "react-icons/fi";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthProvider";

interface Customer {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  notes?: string;
  tags: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  _count?: {
    payments: number;
    notifications: number;
  };
}

interface CustomField {
  id: string;
  name: string;
  label: string;
  type: "text" | "number" | "date" | "dropdown" | "checkbox";
  options?: string[] | null;
  required?: boolean;
  defaultValue?: string | null;
}

interface CustomerManagerProps {
  onStatusChange: (status: string) => void;
}

export const CustomerManager: React.FC<CustomerManagerProps> = ({ onStatusChange }) => {
  const { accessToken, csrfToken } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [allTags, setAllTags] = useState<string[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    company: "",
    notes: "",
    tags: [] as string[],
    metadata: {} as Record<string, any>,
  });
  const [newTag, setNewTag] = useState("");

  const loadCustomers = React.useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedTag) params.append("tag", selectedTag);
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());
      
      const response = await apiRequest<{
        customers: Customer[];
        pagination: typeof pagination;
      }>(`/business/customers?${params}`, { accessToken });
      
      setCustomers(response.customers || []);
      setPagination(response.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
    } catch (err: any) {
      const errorMsg = err?.message || "Failed to load customers";
      setError(errorMsg);
      onStatusChange(`❌ ${errorMsg}`);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, search, selectedTag, pagination.page, onStatusChange]);

  const loadTags = React.useCallback(async () => {
    if (!accessToken) return;
    try {
      const response = await apiRequest<{ tags: string[] }>("/business/customers/tags/list", { accessToken });
      setAllTags(response.tags);
    } catch (err) {
      // Ignore
    }
  }, [accessToken]);

  const loadCustomFields = React.useCallback(async () => {
    if (!accessToken) return;
    try {
      const response = await apiRequest<{ fields: CustomField[] }>("/business/custom-fields", { accessToken });
      setCustomFields(response.fields || []);
    } catch {
      setCustomFields([]);
    }
  }, [accessToken]);

  useEffect(() => {
    loadCustomers();
    loadTags();
    loadCustomFields();
  }, [loadCustomers, loadTags, loadCustomFields]);

  const resetForm = () => {
    setFormData({
      email: "",
      phone: "",
      firstName: "",
      lastName: "",
      company: "",
      notes: "",
      tags: [],
      metadata: {},
    });
    setNewTag("");
  };

  const handleAddCustomer = async () => {
    if (!accessToken || !formData.email) return;
    try {
      await apiRequest("/business/customers", {
        method: "POST",
        accessToken,
        csrfToken,
        body: formData,
      });
      onStatusChange("✅ Customer added successfully");
      setShowAddModal(false);
      resetForm();
      loadCustomers();
      loadTags();
    } catch (err: any) {
      onStatusChange(`❌ ${err?.response?.data?.error || err?.message || "Failed to add customer"}`);
    }
  };

  const handleEditCustomer = async () => {
    if (!accessToken || !selectedCustomer) return;
    try {
      await apiRequest(`/business/customers/${selectedCustomer.id}`, {
        method: "PUT",
        accessToken,
        csrfToken,
        body: formData,
      });
      onStatusChange("✅ Customer updated successfully");
      setShowEditModal(false);
      setSelectedCustomer(null);
      resetForm();
      loadCustomers();
      loadTags();
    } catch (err: any) {
      onStatusChange(`❌ ${err?.response?.data?.error || err?.message || "Failed to update customer"}`);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!accessToken || !selectedCustomer) return;
    try {
      await apiRequest(`/business/customers/${selectedCustomer.id}`, {
        method: "DELETE",
        accessToken,
        csrfToken,
      });
      onStatusChange("✅ Customer deleted successfully");
      setShowDeleteModal(false);
      setSelectedCustomer(null);
      loadCustomers();
    } catch (err: any) {
      onStatusChange(`❌ ${err?.response?.data?.error || err?.message || "Failed to delete customer"}`);
    }
  };

  const handleExport = async () => {
    if (!accessToken) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"}/business/customers/export/csv`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `customers-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      onStatusChange("✅ Customers exported successfully");
    } catch (err: any) {
      onStatusChange(`❌ ${err?.message || "Failed to export customers"}`);
    }
  };

  const handleImport = async () => {
    if (!accessToken || !importFile) return;
    setImporting(true);
    try {
      const text = await importFile.text();
      const lines = text.split("\n").filter(line => line.trim());
      const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
      
      const customers = lines.slice(1).map(line => {
        const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
        const customer: any = { email: "" };
        
        headers.forEach((header, idx) => {
          const value = values[idx] || "";
          if (header.toLowerCase() === "email") customer.email = value;
          else if (header.toLowerCase().includes("first")) customer.firstName = value;
          else if (header.toLowerCase().includes("last")) customer.lastName = value;
          else if (header.toLowerCase() === "phone") customer.phone = value;
          else if (header.toLowerCase() === "company") customer.company = value;
          else if (header.toLowerCase() === "tags") customer.tags = value.split(";").map((t: string) => t.trim()).filter(Boolean);
        });
        
        return customer;
      }).filter(c => c.email);

      const response = await apiRequest<{ created: number; skipped: number; errors: string[] }>("/business/customers/import", {
        method: "POST",
        accessToken,
        csrfToken,
        body: { customers },
      });

      onStatusChange(`✅ Imported ${response.created} customers. ${response.skipped} skipped.`);
      setShowImportModal(false);
      setImportFile(null);
      loadCustomers();
      loadTags();
    } catch (err: any) {
      onStatusChange(`❌ ${err?.message || "Failed to import customers"}`);
    } finally {
      setImporting(false);
    }
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      email: customer.email,
      phone: customer.phone || "",
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      company: customer.company || "",
      notes: customer.notes || "",
      tags: customer.tags || [],
      metadata: (customer.metadata as Record<string, any>) || {},
    });
    setShowEditModal(true);
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({ ...formData, tags: [...formData.tags, newTag] });
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const renderForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">First Name</label>
          <input
            type="text"
            className="input"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Last Name</label>
          <input
            type="text"
            className="input"
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>
      </div>
      
      <div>
        <label className="label">Email *</label>
        <input
          type="email"
          className="input"
          placeholder="john@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      
      <div>
        <label className="label">Phone</label>
        <input
          type="tel"
          className="input"
          placeholder="+1234567890"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>
      
      <div>
        <label className="label">Company</label>
        <input
          type="text"
          className="input"
          placeholder="Acme Inc."
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />
      </div>
      
      <div>
        <label className="label">Tags</label>
        <div className="flex gap-2 flex-wrap mb-2">
          {formData.tags.map((tag) => (
            <span key={tag} className="badge badge-info flex items-center gap-1">
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-red-500">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            className="input flex-1"
            placeholder="Add a tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
          />
          <button onClick={addTag} className="btn btn-secondary">Add</button>
        </div>
      </div>
      
      <div>
        <label className="label">Notes</label>
        <textarea
          className="input min-h-[80px]"
          placeholder="Additional notes..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      {customFields.length > 0 && (
        <div className="space-y-3 border-t border-gray-200/70 pt-3">
          <p className="text-sm font-semibold text-gray-800 m-0">Custom Fields</p>
          {customFields.map((field) => {
            const currentValue = formData.metadata?.[field.name] ?? field.defaultValue ?? "";
            if (field.type === "checkbox") {
              return (
                <label key={field.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={Boolean(currentValue)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metadata: {
                          ...formData.metadata,
                          [field.name]: e.target.checked
                        }
                      })
                    }
                  />
                  <span>{field.label}</span>
                </label>
              );
            }
            if (field.type === "dropdown") {
              return (
                <div key={field.id}>
                  <label className="label">{field.label}{field.required ? " *" : ""}</label>
                  <select
                    className="input"
                    value={String(currentValue || "")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metadata: {
                          ...formData.metadata,
                          [field.name]: e.target.value
                        }
                      })
                    }
                  >
                    <option value="">Select {field.label}</option>
                    {(field.options || []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }
            return (
              <div key={field.id}>
                <label className="label">{field.label}{field.required ? " *" : ""}</label>
                <input
                  type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                  className="input"
                  value={String(currentValue || "")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      metadata: {
                        ...formData.metadata,
                        [field.name]: field.type === "number" ? Number(e.target.value || 0) : e.target.value
                      }
                    })
                  }
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (!accessToken) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Please log in to view customers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExport} className="btn btn-secondary flex items-center gap-2">
            <FiDownload className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setShowImportModal(true)} className="btn btn-secondary flex items-center gap-2">
            <FiUpload className="w-4 h-4" /> Import
          </button>
          <button onClick={() => { resetForm(); setShowAddModal(true); }} className="btn btn-primary flex items-center gap-2">
            <FiPlus className="w-4 h-4" /> Add Customer
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-full md:w-48"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
        >
          <option value="">All Tags</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error loading customers</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Customer List */}
      <div className="card min-w-0 overflow-hidden">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading customers...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            Failed to load customers. Please try again.
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {search || selectedTag ? "No customers found matching your filters" : "No customers yet. Add your first customer!"}
          </div>
        ) : (
          <div className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-auto max-h-[65vh] pb-2 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]">
            <table className="table w-full min-w-[900px] table-auto text-xs sm:text-sm [&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-20 [&_thead_th]:bg-gray-50 [&_th]:px-2 [&_th]:py-2 [&_th]:text-[10px] [&_th]:whitespace-nowrap [&_td]:px-2 [&_td]:py-2 [&_td]:text-xs [&_td]:whitespace-nowrap sm:[&_th]:px-5 sm:[&_th]:py-4 sm:[&_th]:text-xs sm:[&_td]:px-5 sm:[&_td]:py-4 sm:[&_td]:text-sm">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Company</th>
                  <th>Tags</th>
                  <th>Activity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FiUser className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {customer.firstName || customer.lastName
                              ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
                              : customer.email.split("@")[0]}
                          </p>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <FiMail className="w-3 h-3" /> {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <FiPhone className="w-3 h-3" /> {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{customer.company || "—"}</td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        {customer.tags?.slice(0, 3).map((tag) => (
                          <span key={tag} className="badge badge-info text-xs">{tag}</span>
                        ))}
                        {customer.tags.length > 3 && (
                          <span className="badge text-xs">+{customer.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-gray-600">
                        <p>{customer._count?.payments || 0} payments</p>
                        <p>{customer._count?.notifications || 0} notifications</p>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(customer)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => { setSelectedCustomer(customer); setShowDeleteModal(true); }}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/50">
            <p className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="btn btn-secondary px-3 py-1.5 text-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page >= pagination.pages}
                className="btn btn-secondary px-3 py-1.5 text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Add Customer Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        title="Add Customer"
        size="md"
        footer={
          <>
            <button onClick={() => { setShowAddModal(false); resetForm(); }} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleAddCustomer} className="btn btn-primary" disabled={!formData.email}>
              Add Customer
            </button>
          </>
        }
      >
        {renderForm()}
      </Modal>
      
      {/* Edit Customer Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedCustomer(null); resetForm(); }}
        title="Edit Customer"
        size="md"
        footer={
          <>
            <button onClick={() => { setShowEditModal(false); setSelectedCustomer(null); resetForm(); }} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleEditCustomer} className="btn btn-primary">
              Save Changes
            </button>
          </>
        }
      >
        {renderForm()}
      </Modal>
      
      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedCustomer(null); }}
        onConfirm={handleDeleteCustomer}
        title="Delete Customer"
        message={
          <p>
            Are you sure you want to delete <strong>{selectedCustomer?.email}</strong>? 
            This will also remove them from all contact lists.
          </p>
        }
        confirmText="Delete"
        variant="danger"
      />

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => { setShowImportModal(false); setImportFile(null); }}
        title="Import Customers"
        size="md"
        footer={
          <>
            <button onClick={() => { setShowImportModal(false); setImportFile(null); }} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleImport} className="btn btn-primary" disabled={!importFile || importing}>
              {importing ? "Importing..." : "Import"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Upload a CSV file with columns: Email, First Name, Last Name, Phone, Company, Tags
          </p>
          <div>
            <label className="label">CSV File</label>
            <input
              type="file"
              accept=".csv"
              className="input"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
            {importFile && (
              <p className="text-sm text-gray-500 mt-2">Selected: {importFile.name}</p>
            )}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Duplicate emails will be skipped. Tags should be separated by semicolons (;).
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};







