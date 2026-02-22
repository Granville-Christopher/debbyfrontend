import React, { useEffect, useState } from "react";
import { Modal, ConfirmModal } from "./Modal";
import { FiUserPlus, FiTrash2, FiMail, FiClock, FiShield, FiUser, FiRefreshCw } from "react-icons/fi";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthProvider";

interface TeamMember {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  teamRole: "owner" | "admin" | "member" | "viewer";
  createdAt: string;
}

interface TeamInvite {
  id: string;
  email: string;
  role: "admin" | "member" | "viewer";
  expiresAt: string;
  createdAt: string;
}

interface TeamManagerProps {
  onStatusChange: (status: string) => void;
}

export const TeamManager: React.FC<TeamManagerProps> = ({ onStatusChange }) => {
  const { accessToken, csrfToken, user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedInvite, setSelectedInvite] = useState<TeamInvite | null>(null);
  
  // Form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "viewer">("member");
  const [newRole, setNewRole] = useState<"admin" | "member" | "viewer">("member");

  const loadTeam = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const [membersRes, invitesRes] = await Promise.all([
        apiRequest<{ members: TeamMember[] }>("/developer/team/members", { accessToken }),
        apiRequest<{ invites: TeamInvite[] }>("/developer/team/invites", { accessToken }),
      ]);
      setMembers(membersRes.members);
      setInvites(invitesRes.invites);
    } catch (err: any) {
      onStatusChange(`❌ ${err?.message || "Failed to load team"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, [accessToken]);

  const handleInvite = async () => {
    if (!accessToken || !inviteEmail) return;
    try {
      await apiRequest("/developer/team/invites", {
        method: "POST",
        accessToken,
        csrfToken,
        body: { email: inviteEmail, role: inviteRole },
      });
      onStatusChange("✅ Invitation sent successfully");
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteRole("member");
      loadTeam();
    } catch (err: any) {
      onStatusChange(`❌ ${err?.response?.data?.error || err?.message || "Failed to send invitation"}`);
    }
  };

  const handleResendInvite = async (invite: TeamInvite) => {
    if (!accessToken) return;
    try {
      await apiRequest(`/developer/team/invites/${invite.id}/resend`, {
        method: "POST",
        accessToken,
        csrfToken,
      });
      onStatusChange("✅ Invitation resent successfully");
      loadTeam();
    } catch (err: any) {
      onStatusChange(`❌ ${err?.response?.data?.error || err?.message || "Failed to resend invitation"}`);
    }
  };

  const handleCancelInvite = async (invite: TeamInvite) => {
    if (!accessToken) return;
    try {
      await apiRequest(`/developer/team/invites/${invite.id}`, {
        method: "DELETE",
        accessToken,
        csrfToken,
      });
      onStatusChange("✅ Invitation cancelled");
      loadTeam();
    } catch (err: any) {
      onStatusChange(`❌ ${err?.response?.data?.error || err?.message || "Failed to cancel invitation"}`);
    }
  };

  const handleUpdateRole = async () => {
    if (!accessToken || !selectedMember) return;
    try {
      await apiRequest(`/developer/team/members/${selectedMember.id}`, {
        method: "PUT",
        accessToken,
        csrfToken,
        body: { teamRole: newRole },
      });
      onStatusChange("✅ Role updated successfully");
      setShowRoleModal(false);
      setSelectedMember(null);
      loadTeam();
    } catch (err: any) {
      onStatusChange(`❌ ${err?.response?.data?.error || err?.message || "Failed to update role"}`);
    }
  };

  const handleRemoveMember = async () => {
    if (!accessToken || !selectedMember) return;
    try {
      await apiRequest(`/developer/team/members/${selectedMember.id}`, {
        method: "DELETE",
        accessToken,
        csrfToken,
      });
      onStatusChange("✅ Member removed successfully");
      setShowRemoveModal(false);
      setSelectedMember(null);
      loadTeam();
    } catch (err: any) {
      onStatusChange(`❌ ${err?.response?.data?.error || err?.message || "Failed to remove member"}`);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-700";
      case "admin":
        return "bg-blue-100 text-blue-700";
      case "member":
        return "bg-green-100 text-green-700";
      case "viewer":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "owner":
        return "Full access, can manage team and billing";
      case "admin":
        return "Can manage team members and most settings";
      case "member":
        return "Can create and manage resources";
      case "viewer":
        return "Read-only access to resources";
      default:
        return "";
    }
  };

  const canManageMember = (member: TeamMember) => {
    const currentMember = members.find((m) => m.id === user?.id);
    if (!currentMember) return false;
    if (member.teamRole === "owner") return false;
    if (currentMember.teamRole === "owner") return true;
    if (currentMember.teamRole === "admin" && member.teamRole !== "admin") return true;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage your team and their access levels
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <FiUserPlus className="w-4 h-4" /> Invite Member
        </button>
      </div>
      
      {/* Members List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Members ({members.length})
        </h3>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50/70 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {member.firstName?.[0] || member.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.firstName || member.lastName
                        ? `${member.firstName || ""} ${member.lastName || ""}`.trim()
                        : member.email.split("@")[0]}
                      {member.id === user?.id && (
                        <span className="ml-2 text-xs text-gray-500">(You)</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(member.teamRole)}`}>
                    {member.teamRole}
                  </span>
                  
                  {canManageMember(member) && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setNewRole(member.teamRole as any);
                          setShowRoleModal(true);
                        }}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Change Role"
                      >
                        <FiShield className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setShowRemoveModal(true);
                        }}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <FiTrash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Pending Invitations */}
      {invites.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pending Invitations ({invites.length})
          </h3>
          
          <div className="space-y-4">
            {invites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-4 bg-yellow-50/70 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                    <FiMail className="w-5 h-5 text-yellow-700" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{invite.email}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      Expires {new Date(invite.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(invite.role)}`}>
                    {invite.role}
                  </span>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleResendInvite(invite)}
                      className="p-2 hover:bg-yellow-200 rounded-lg transition-colors"
                      title="Resend"
                    >
                      <FiRefreshCw className="w-4 h-4 text-yellow-700" />
                    </button>
                    <button
                      onClick={() => handleCancelInvite(invite)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <FiTrash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Role Permissions Info */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["owner", "admin", "member", "viewer"].map((role) => (
            <div key={role} className="p-4 bg-gray-50/70 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role)}`}>
                  {role}
                </span>
              </div>
              <p className="text-sm text-gray-600">{getRoleDescription(role)}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => { setShowInviteModal(false); setInviteEmail(""); }}
        title="Invite Team Member"
        size="sm"
        footer={
          <>
            <button onClick={() => { setShowInviteModal(false); setInviteEmail(""); }} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleInvite} className="btn btn-primary" disabled={!inviteEmail}>
              Send Invitation
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              className="input"
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="label">Role</label>
            <select
              className="input"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
            >
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">{getRoleDescription(inviteRole)}</p>
          </div>
        </div>
      </Modal>
      
      {/* Change Role Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => { setShowRoleModal(false); setSelectedMember(null); }}
        title="Change Role"
        size="sm"
        footer={
          <>
            <button onClick={() => { setShowRoleModal(false); setSelectedMember(null); }} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleUpdateRole} className="btn btn-primary">
              Update Role
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Change role for <strong>{selectedMember?.email}</strong>
          </p>
          
          <div>
            <label className="label">New Role</label>
            <select
              className="input"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
            >
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">{getRoleDescription(newRole)}</p>
          </div>
        </div>
      </Modal>
      
      {/* Remove Member Confirmation */}
      <ConfirmModal
        isOpen={showRemoveModal}
        onClose={() => { setShowRemoveModal(false); setSelectedMember(null); }}
        onConfirm={handleRemoveMember}
        title="Remove Team Member"
        message={
          <p>
            Are you sure you want to remove <strong>{selectedMember?.email}</strong> from the team?
            They will lose access to all resources.
          </p>
        }
        confirmText="Remove"
        variant="danger"
      />
    </div>
  );
};
