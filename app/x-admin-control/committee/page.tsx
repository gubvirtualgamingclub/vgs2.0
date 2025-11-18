'use client';

import { useState, useEffect } from 'react';
import AdminHelpButton from '@/components/AdminHelpButton';
import {
  getAllCommittees,
  getCommitteesWithMembers,
  createCommittee,
  updateCommittee,
  deleteCommittee,
  toggleCommitteePublish,
  createCommitteeMember,
  updateCommitteeMember,
  deleteCommitteeMember,
  toggleCommitteeMemberPublish,
  searchCommitteeMembers
} from '@/lib/supabase-queries';
import type { Committee, CommitteeMember } from '@/lib/types/database';

type CommitteeWithMembers = Committee & { members: CommitteeMember[] };

export default function AdminCommitteePage() {
  const [committees, setCommittees] = useState<CommitteeWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCommittees, setExpandedCommittees] = useState<Set<string>>(new Set());
  
  // Committee form state
  const [isCommitteeFormOpen, setIsCommitteeFormOpen] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState<Committee | null>(null);
  const [committeeFormData, setCommitteeFormData] = useState({
    name: '',
    year_range: '',
    description: '',
    is_published: false,
  });

  // Member form state
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);
  const [memberFormData, setMemberFormData] = useState({
    name: '',
    category: 'Student Executives' as 'Faculty Advisors' | 'Student Executives',
    designation: '',
    photo: '',
    email: '',
    student_id: '',
    facebook: '',
    linkedin: '',
    github: '',
    previous_roles: [] as Array<{ year: string; role: string }>,
    order_index: 0,
    is_published: false,
  });
  const [roleYear, setRoleYear] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  
  // Member search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CommitteeMember[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    fetchCommittees();
  }, []);
  
  // Debounced search effect
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const delaySearch = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(delaySearch);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  async function fetchCommittees() {
    try {
      setLoading(true);
      const data = await getCommitteesWithMembers();
      setCommittees(data);
    } catch (error) {
      console.error('Error fetching committees:', error);
      alert('Failed to fetch committees. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  
  async function handleSearch() {
    if (searchQuery.trim().length < 2) return;
    
    try {
      setIsSearching(true);
      const results = await searchCommitteeMembers(searchQuery.trim());
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching members:', error);
    } finally {
      setIsSearching(false);
    }
  }
  
  function handleSelectMember(member: CommitteeMember) {
    // Convert legacy string[] format to new object format if needed
    const previousRoles = Array.isArray(member.previous_roles) 
      ? member.previous_roles.map(role => 
          typeof role === 'string' 
            ? { year: '', role: role } 
            : role
        )
      : [];
    
    setMemberFormData({
      name: member.name,
      category: member.category,
      designation: member.designation,
      photo: member.photo,
      email: member.email || '',
      student_id: member.student_id || '',
      facebook: member.facebook || '',
      linkedin: member.linkedin || '',
      github: member.github || '',
      previous_roles: previousRoles,
      order_index: memberFormData.order_index,
      is_published: false,
    });
    setSearchQuery('');
    setShowSearchResults(false);
    setSearchResults([]);
  }

  const toggleExpanded = (committeeId: string) => {
    setExpandedCommittees((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(committeeId)) {
        newSet.delete(committeeId);
      } else {
        newSet.add(committeeId);
      }
      return newSet;
    });
  };

  // Committee CRUD handlers
  const handleOpenCommitteeForm = (committee?: Committee) => {
    if (committee) {
      setEditingCommittee(committee);
      setCommitteeFormData({
        name: committee.name,
        year_range: committee.year_range,
        description: committee.description || '',
        is_published: committee.is_published,
      });
    } else {
      setEditingCommittee(null);
      const currentYear = new Date().getFullYear();
      setCommitteeFormData({
        name: '',
        year_range: `${currentYear}-${currentYear + 1}`,
        description: '',
        is_published: false,
      });
    }
    setIsCommitteeFormOpen(true);
  };

  const handleCloseCommitteeForm = () => {
    setIsCommitteeFormOpen(false);
    setEditingCommittee(null);
  };

  const handleSubmitCommittee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCommittee) {
        await updateCommittee(editingCommittee.id, committeeFormData);
      } else {
        await createCommittee(committeeFormData);
      }
      
      await fetchCommittees();
      handleCloseCommitteeForm();
    } catch (error) {
      console.error('Error saving committee:', error);
      alert('Failed to save committee. Please try again.');
    }
  };

  const handleDeleteCommittee = async (id: string, name: string) => {
    const committee = committees.find(c => c.id === id);
    const memberCount = committee?.members.length || 0;
    
    const message = memberCount > 0
      ? `Are you sure you want to delete "${name}"? This will also delete ${memberCount} member(s).`
      : `Are you sure you want to delete "${name}"?`;
      
    if (confirm(message)) {
      try {
        await deleteCommittee(id);
        await fetchCommittees();
      } catch (error) {
        console.error('Error deleting committee:', error);
        alert('Failed to delete committee. Please try again.');
      }
    }
  };

  const handleToggleCommitteePublish = async (id: string, currentStatus: boolean) => {
    try {
      await toggleCommitteePublish(id, !currentStatus);
      await fetchCommittees();
    } catch (error) {
      console.error('Error toggling committee publish status:', error);
      alert('Failed to update publish status. Please try again.');
    }
  };

  // Member CRUD handlers
  const handleOpenMemberForm = (committeeId: string, member?: CommitteeMember) => {
    setSelectedCommitteeId(committeeId);
    
    if (member) {
      setEditingMember(member);
      // Convert legacy string[] format to new object format if needed
      const convertedPreviousRoles = member.previous_roles.map(role => 
        typeof role === 'string' ? { year: '', role } : role
      );
      setMemberFormData({
        name: member.name,
        category: member.category,
        designation: member.designation,
        photo: member.photo,
        email: member.email || '',
        student_id: member.student_id || '',
        facebook: member.facebook || '',
        linkedin: member.linkedin || '',
        github: member.github || '',
        previous_roles: convertedPreviousRoles,
        order_index: member.order_index,
        is_published: member.is_published,
      });
    } else {
      setEditingMember(null);
      const committee = committees.find(c => c.id === committeeId);
      const maxOrderIndex = Math.max(0, ...(committee?.members.map(m => m.order_index) || []));
      setMemberFormData({
        name: '',
        category: 'Student Executives',
        designation: '',
        photo: '/members/',
        email: '',
        student_id: '',
        facebook: '',
        linkedin: '',
        github: '',
        previous_roles: [],
        order_index: maxOrderIndex + 1,
        is_published: false,
      });
    }
    setRoleYear('');
    setRoleTitle('');
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setIsMemberFormOpen(true);
  };

  const handleCloseMemberForm = () => {
    setIsMemberFormOpen(false);
    setEditingMember(null);
    setSelectedCommitteeId(null);
    setRoleYear('');
    setRoleTitle('');
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleAddRole = () => {
    if (roleYear.trim() && roleTitle.trim()) {
      setMemberFormData({ 
        ...memberFormData, 
        previous_roles: [...memberFormData.previous_roles, { year: roleYear.trim(), role: roleTitle.trim() }] 
      });
      setRoleYear('');
      setRoleTitle('');
    } else {
      alert('Please enter both year and role');
    }
  };

  const handleRemoveRole = (index: number) => {
    setMemberFormData({
      ...memberFormData,
      previous_roles: memberFormData.previous_roles.filter((_, i) => i !== index),
    });
  };

  const handleSubmitMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCommitteeId) {
      alert('No committee selected');
      return;
    }
    
    try {
      if (editingMember) {
        // When updating, don't send committee_id (it shouldn't change)
        const updateData = { ...memberFormData };
        console.log('Updating member with ID:', editingMember.id);
        console.log('Update data:', updateData);
        const result = await updateCommitteeMember(editingMember.id, updateData);
        console.log('Update result:', result);
      } else {
        // When creating, include committee_id
        console.log('Creating new member');
        await createCommitteeMember({
          ...memberFormData,
          committee_id: selectedCommitteeId,
        });
      }
      
      await fetchCommittees();
      handleCloseMemberForm();
      alert('Member saved successfully!');
    } catch (error) {
      console.error('Error saving committee member:', error);
      alert(`Failed to save committee member: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteCommitteeMember(id);
        await fetchCommittees();
      } catch (error) {
        console.error('Error deleting committee member:', error);
        alert('Failed to delete committee member. Please try again.');
      }
    }
  };

  const handleToggleMemberPublish = async (id: string, currentStatus: boolean) => {
    try {
      await toggleCommitteeMemberPublish(id, !currentStatus);
      await fetchCommittees();
    } catch (error) {
      console.error('Error toggling member publish status:', error);
      alert('Failed to update publish status. Please try again.');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Faculty Advisors': 'bg-purple-900/50 text-purple-300',
      'Executive Committee': 'bg-blue-900/50 text-blue-300',
      'Student Members': 'bg-green-900/50 text-green-300',
    };
    return colors[category] || 'bg-gray-900/50 text-gray-300';
  };

  const totalMembers = committees.reduce((sum, c) => sum + c.members.length, 0);
  const totalPublishedMembers = committees.reduce((sum, c) => sum + c.members.filter(m => m.is_published).length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Committee Manager</h1>
          <p className="text-gray-400">Manage committees and their members hierarchically</p>
        </div>
        <button
          onClick={() => handleOpenCommitteeForm()}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Committee</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-gray-400 text-sm">Total Committees</p>
          <p className="text-2xl font-bold text-white">{committees.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-gray-400 text-sm">Total Members</p>
          <p className="text-2xl font-bold text-white">{totalMembers}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-gray-400 text-sm">Published Committees</p>
          <p className="text-2xl font-bold text-green-400">
            {committees.filter((c) => c.is_published).length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-gray-400 text-sm">Published Members</p>
          <p className="text-2xl font-bold text-green-400">{totalPublishedMembers}</p>
        </div>
      </div>

      {/* Committees List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading committees...</p>
          </div>
        </div>
      ) : committees.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
          <p className="text-gray-400 mb-4">No committees found</p>
          <button
            onClick={() => handleOpenCommitteeForm()}
            className="text-purple-400 hover:text-purple-300 font-semibold"
          >
            Create your first committee
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {committees.map((committee) => (
            <div
              key={committee.id}
              className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
            >
              {/* Committee Header */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <button
                        onClick={() => toggleExpanded(committee.id)}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                      >
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedCommittees.has(committee.id) ? 'transform rotate-90' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <h2 className="text-2xl font-bold text-white">{committee.name}</h2>
                      <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm font-semibold">
                        {committee.year_range}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          committee.is_published
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-yellow-900/50 text-yellow-300'
                        }`}
                      >
                        {committee.is_published ? '✓ Published' : '○ Draft'}
                      </span>
                    </div>
                    {committee.description && (
                      <p className="text-gray-400 ml-9 mb-2">{committee.description}</p>
                    )}
                    <p className="text-gray-500 text-sm ml-9">
                      {committee.members.length} member{committee.members.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenMemberForm(committee.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                    >
                      + Add Member
                    </button>
                    <button
                      onClick={() => handleToggleCommitteePublish(committee.id, committee.is_published)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      title={committee.is_published ? 'Unpublish' : 'Publish'}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleOpenCommitteeForm(committee)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Edit Committee"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteCommittee(committee.id, committee.name)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Delete Committee"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Members (expandable) */}
              {expandedCommittees.has(committee.id) && (
                <div className="border-t border-gray-700 bg-gray-900/50 p-6">
                  {committee.members.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No members in this committee</p>
                      <button
                        onClick={() => handleOpenMemberForm(committee.id)}
                        className="text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        Add first member
                      </button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-3 gap-4">
                      {committee.members.map((member) => (
                        <div
                          key={member.id}
                          className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors"
                        >
                          <div className="flex items-start space-x-3 mb-3">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-700 flex-shrink-0">
                              <img
                                src={member.photo}
                                alt={member.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=374151&color=9CA3AF&size=200`;
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-white truncate">{member.name}</h3>
                              <p className="text-purple-400 text-sm font-semibold truncate">{member.designation}</p>
                              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-1 ${getCategoryColor(member.category)}`}>
                                {member.category}
                              </span>
                            </div>
                          </div>

                          {member.previous_roles.length > 0 && (
                            <div className="mb-3 pt-3 border-t border-gray-700">
                              <p className="text-gray-500 text-xs mb-1">Previous:</p>
                              {member.previous_roles.slice(0, 2).map((role, idx) => {
                                const roleText = typeof role === 'string' ? role : role.role;
                                const roleYear = typeof role === 'string' ? '' : role.year;
                                return (
                                  <p key={idx} className="text-gray-400 text-xs truncate">
                                    • {roleYear && `${roleYear} - `}{roleText}
                                  </p>
                                );
                              })}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                            <button
                              onClick={() => handleToggleMemberPublish(member.id, member.is_published)}
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                member.is_published
                                  ? 'bg-green-900/50 text-green-300 hover:bg-green-900/70'
                                  : 'bg-yellow-900/50 text-yellow-300 hover:bg-yellow-900/70'
                              } transition-colors`}
                            >
                              {member.is_published ? '✓' : '○'}
                            </button>

                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleOpenMemberForm(committee.id, member)}
                                className="p-1 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded transition-colors"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteMember(member.id, member.name)}
                                className="p-1 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Committee Form Modal */}
      {isCommitteeFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseCommitteeForm}></div>
            
            <div className="relative bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full border border-gray-700">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-2xl font-bold text-white">
                  {editingCommittee ? 'Edit Committee' : 'Create Committee'}
                </h2>
                <button onClick={handleCloseCommitteeForm} className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitCommittee} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Committee Name *</label>
                  <input
                    type="text"
                    value={committeeFormData.name}
                    onChange={(e) => setCommitteeFormData({ ...committeeFormData, name: e.target.value })}
                    placeholder="e.g., VGS Executive Committee"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Year Range *</label>
                  <input
                    type="text"
                    value={committeeFormData.year_range}
                    onChange={(e) => setCommitteeFormData({ ...committeeFormData, year_range: e.target.value })}
                    placeholder="e.g., 2025-2026"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                  <p className="text-gray-500 text-sm mt-1">Format: YYYY-YYYY (e.g., 2025-2026)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                  <textarea
                    value={committeeFormData.description}
                    onChange={(e) => setCommitteeFormData({ ...committeeFormData, description: e.target.value })}
                    placeholder="Brief description of this committee..."
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={committeeFormData.is_published}
                      onChange={(e) => setCommitteeFormData({ ...committeeFormData, is_published: e.target.checked })}
                      className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-600 focus:ring-2"
                    />
                    <span className="text-gray-300 font-medium">Publish immediately</span>
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={handleCloseCommitteeForm}
                    className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    {editingCommittee ? 'Update' : 'Create'} Committee
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Member Form Modal */}
      {isMemberFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseMemberForm}></div>
            
            <div className="relative bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-800 flex items-center justify-between p-6 border-b border-gray-700 z-10">
                <h2 className="text-2xl font-bold text-white">
                  {editingMember ? 'Edit Member' : 'Add Committee Member'}
                </h2>
                <button onClick={handleCloseMemberForm} className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitMember} className="p-6 space-y-6">
                {/* Member Search - Only show when adding new member */}
                {!editingMember && (
                  <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-4 border border-purple-700/50">
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      🔍 Search Existing Member
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, email, or student ID..."
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                      {isSearching && (
                        <div className="absolute right-3 top-3 text-purple-400">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mt-2">
                      Type at least 2 characters to search. If found, member details will auto-fill below.
                    </p>
                    
                    {/* Search Results Dropdown */}
                    {showSearchResults && searchResults.length > 0 && (
                      <div className="mt-3 bg-gray-800 border border-gray-600 rounded-lg max-h-64 overflow-y-auto">
                        {searchResults.map((member) => (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => handleSelectMember(member)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={member.photo}
                                alt={member.name}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect fill="%23888" width="40" height="40"/%3E%3C/svg%3E';
                                }}
                              />
                              <div className="flex-1">
                                <p className="text-white font-semibold">{member.name}</p>
                                <p className="text-gray-400 text-sm">{member.designation}</p>
                                <div className="flex gap-3 text-xs text-gray-500 mt-1">
                                  {member.email && <span>📧 {member.email}</span>}
                                  {member.student_id && <span>🆔 {member.student_id}</span>}
                                </div>
                              </div>
                              <div className="text-purple-400">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {showSearchResults && searchResults.length === 0 && searchQuery.length >= 2 && !isSearching && (
                      <div className="mt-3 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-center">
                        <p className="text-gray-400 text-sm">No members found matching "{searchQuery}"</p>
                        <p className="text-gray-500 text-xs mt-1">You can create a new member below</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={memberFormData.name}
                      onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                      placeholder="e.g., John Doe"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Designation *</label>
                    <input
                      type="text"
                      value={memberFormData.designation}
                      onChange={(e) => setMemberFormData({ ...memberFormData, designation: e.target.value })}
                      placeholder="e.g., President, Secretary"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                  <select
                    value={memberFormData.category}
                    onChange={(e) => setMemberFormData({ ...memberFormData, category: e.target.value as any })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  >
                    <option value="Faculty Advisors">Faculty Advisor</option>
                    <option value="Student Executives">Student Executives</option>
                  </select>
                  <p className="text-gray-500 text-sm mt-1">
                    {memberFormData.category === 'Faculty Advisors' 
                      ? 'Faculty Advisor require: Name, Position, Email, Photo'
                      : 'Student Executives require: Name, Position, Student ID, Social Links, Photo'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Photo Path *</label>
                  <input
                    type="text"
                    value={memberFormData.photo}
                    onChange={(e) => setMemberFormData({ ...memberFormData, photo: e.target.value })}
                    placeholder="/members/president-2025.jpg"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    Upload photo to <code className="text-purple-400">public/members/</code> folder first, then enter path here
                  </p>
                  {memberFormData.photo && (
                    <div className="mt-3 flex justify-center">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-700">
                        <img
                          src={memberFormData.photo}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=User&background=374151&color=9CA3AF&size=200';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Email field - Required for Faculty, Optional for Students */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email {memberFormData.category === 'Faculty Advisors' ? '*' : '(Optional)'}
                  </label>
                  <input
                    type="email"
                    value={memberFormData.email}
                    onChange={(e) => setMemberFormData({ ...memberFormData, email: e.target.value })}
                    placeholder="john.doe@example.com"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required={memberFormData.category === 'Faculty Advisors'}
                  />
                </div>

                {/* Student-specific fields */}
                {memberFormData.category === 'Student Executives' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Student ID</label>
                      <input
                        type="text"
                        value={memberFormData.student_id}
                        onChange={(e) => setMemberFormData({ ...memberFormData, student_id: e.target.value })}
                        placeholder="e.g., 20250001"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Facebook
                          </span>
                        </label>
                        <input
                          type="url"
                          value={memberFormData.facebook}
                          onChange={(e) => setMemberFormData({ ...memberFormData, facebook: e.target.value })}
                          placeholder="https://facebook.com/..."
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            LinkedIn
                          </span>
                        </label>
                        <input
                          type="url"
                          value={memberFormData.linkedin}
                          onChange={(e) => setMemberFormData({ ...memberFormData, linkedin: e.target.value })}
                          placeholder="https://linkedin.com/in/..."
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            GitHub
                          </span>
                        </label>
                        <input
                          type="url"
                          value={memberFormData.github}
                          onChange={(e) => setMemberFormData({ ...memberFormData, github: e.target.value })}
                          placeholder="https://github.com/..."
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Previous Roles (Optional)</label>
                  <div className="grid grid-cols-[1fr_2fr_auto] gap-2 mb-3">
                    <input
                      type="text"
                      value={roleYear}
                      onChange={(e) => setRoleYear(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRole())}
                      placeholder="Year (e.g., 2024)"
                      className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    <input
                      type="text"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRole())}
                      placeholder="Role (e.g., Treasurer)"
                      className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    <button
                      type="button"
                      onClick={handleAddRole}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
                    >
                      Add Role
                    </button>
                  </div>
                  {memberFormData.previous_roles.length > 0 && (
                    <div className="space-y-2">
                      {memberFormData.previous_roles.map((roleObj, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gradient-to-r from-purple-900/30 to-pink-900/30 px-4 py-3 rounded-lg border border-purple-700/30">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-purple-600/50 text-purple-200 rounded-full text-xs font-semibold">
                              {roleObj.year || 'N/A'}
                            </span>
                            <span className="text-gray-200 font-medium">{roleObj.role}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveRole(idx)}
                            className="text-red-400 hover:text-red-300 transition-colors p-1"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={memberFormData.is_published}
                      onChange={(e) => setMemberFormData({ ...memberFormData, is_published: e.target.checked })}
                      className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-600 focus:ring-2"
                    />
                    <span className="text-gray-300 font-medium">Publish immediately</span>
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={handleCloseMemberForm}
                    className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    {editingMember ? 'Update' : 'Add'} Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <AdminHelpButton
        title="Committee Management"
        instructions={[
          'Add and manage committee members',
          'Upload member photos',
          'Assign roles and positions',
          'Reorder members by dragging cards',
          'Remove members when needed'
        ]}
        tips={[
          'Use professional photos for committee members',
          'Keep titles short and descriptive',
          'Order members by hierarchy or importance'
        ]}
        actions={[
          { label: 'Add Member', description: 'create new committee entry' },
          { label: 'Edit Member', description: 'modify details' },
          { label: 'Delete Member', description: 'remove from committee' }
        ]}
      />
    </div>
  );
}
