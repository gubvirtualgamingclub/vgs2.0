'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminHelpButton from '@/components/AdminHelpButton';
import AdminImage from '@/components/AdminImage';
import Modal from '@/components/Modal';
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
import {
  UserGroupIcon,
  AcademicCapIcon,
  UsersIcon,
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
  BuildingLibraryIcon,
  ArrowPathRoundedSquareIcon
} from '@heroicons/react/24/outline';

import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  rectSortingStrategy 
} from '@dnd-kit/sortable';
import { SortableMemberCard } from './SortableMemberCard';

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
  
  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchCommittees();
  }, []);
  
  const handleSearch = useCallback(async () => {
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
  }, [searchQuery]);

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
  }, [searchQuery, handleSearch]);

  async function fetchCommittees() {
    try {
      setLoading(true);
      const data = await getCommitteesWithMembers();
      setCommittees(data);
       // Auto-expand the first committee if none are expanded
      if (expandedCommittees.size === 0 && data.length > 0) {
        setExpandedCommittees(new Set([data[0].id]));
      }
    } catch (error) {
      console.error('Error fetching committees:', error);
      alert('Failed to fetch committees. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  
  function handleSelectMember(member: CommitteeMember) {
    const previousRoles = Array.isArray(member.previous_roles) 
      ? member.previous_roles.map(role => 
          typeof role === 'string' ? { year: '', role: role } : role
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
      is_published: false, // Default to unpublished when importing for a new year
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

  const getFilteredSearchResults = (results: CommitteeMember[]) => {
    const memberMap = new Map<string, CommitteeMember>();
    
    // Group by name, keep latest profile
    results.forEach(member => {
      const existingMember = memberMap.get(member.name);
      if (!existingMember) {
        memberMap.set(member.name, member);
      } else {
        const existingOrder = existingMember.order_index || 0;
        const newOrder = member.order_index || 0;
        if (newOrder > existingOrder) {
          memberMap.set(member.name, member);
        }
      }
    });
    
    return Array.from(memberMap.values());
  };

  const handleDragEnd = async (event: DragEndEvent, committeeId: string) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Find the committee
    const committeeIndex = committees.findIndex(c => c.id === committeeId);
    if (committeeIndex === -1) return;

    const committee = committees[committeeIndex];
    
    const oldIndex = committee.members.findIndex(m => m.id === active.id);
    const newIndex = committee.members.findIndex(m => m.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistic Update
    const newMembers = arrayMove(committee.members, oldIndex, newIndex);
    
    const updatedCommittees = [...committees];
    updatedCommittees[committeeIndex] = {
      ...committee,
      members: newMembers,
    };
    
    setCommittees(updatedCommittees);

    // Persist changes
    try {
        // We need to update the order_index for ALL members between the old and new index
        // Simpler approach: update the moved member and the target member swapping orders?
        // Better approach for strict ordering: Update indices for affected items.
        
        // Let's just update the order_index of *all* members in the array to match their new position
        const updates = newMembers.map((member, index) => ({
            ...member,
            order_index: index + 1 // 1-based index
        }));

        // In a real app, you'd batch update. Here we iterate (not efficient but checking robust for now)
        // Or simply update the swapped two? No, arrayMove shifts everything.
        // Let's iterate and update only those whose index changed conceptually.
        
        for (let i = 0; i < updates.length; i++) {
            const member = updates[i];
            const originalMember = committee.members.find(m => m.id === member.id);
            // Only update if index changed relative to list position (which we just set)
            // Actually simplest is just to save the new order_index for the moved item
            // But arrayMove shifts others up/down.
            // Dnd-kit logic: visually moved.
            // Database logic: order_index.
            
            await updateCommitteeMember(member.id, { 
                ...member, 
                order_index: i + 1 
            });
        }
        
    } catch (error) {
        console.error('Error reordering members:', error);
        alert('Failed to save order.');
        fetchCommittees(); // Revert
    }
  };

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

  const handleToggleCommitteePublish = async (id: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleCommitteePublish(id, !currentStatus);
      await fetchCommittees();
    } catch (error) {
      console.error('Error toggling committee publish status:', error);
      alert('Failed to update publish status. Please try again.');
    }
  };

  const handleOpenMemberForm = (committeeId: string, member?: CommitteeMember, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedCommitteeId(committeeId);
    
    if (member) {
      setEditingMember(member);
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
    if (!selectedCommitteeId) return;
    
    try {
      if (editingMember) {
        await updateCommitteeMember(editingMember.id, memberFormData);
      } else {
        await createCommitteeMember({
          ...memberFormData,
          committee_id: selectedCommitteeId,
        });
      }
      await fetchCommittees();
      handleCloseMemberForm();
    } catch (error) {
      console.error('Error saving committee member:', error);
      alert('Failed to save committee member.');
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteCommitteeMember(id);
        await fetchCommittees();
      } catch (error) {
        console.error('Error deleting committee member:', error);
        alert('Failed to delete committee member.');
      }
    }
  };

  const handleToggleMemberPublish = async (id: string, currentStatus: boolean) => {
    try {
      await toggleCommitteeMemberPublish(id, !currentStatus);
      await fetchCommittees();
    } catch (error) {
      console.error('Error toggling member publish status:', error);
      alert('Failed to update publish status.');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Faculty Advisors': 'bg-purple-500/10 text-purple-300 border-purple-500/20',
      'Executive Committee': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      'Student Members': 'bg-green-500/10 text-green-300 border-green-500/20',
    };
    return colors[category] || 'bg-gray-700/50 text-gray-300 border-gray-600';
  };

  const totalMembers = committees.reduce((sum, c) => sum + c.members.length, 0);
  const totalPublishedMembers = committees.reduce((sum, c) => sum + c.members.filter(m => m.is_published).length, 0);

  // Helper for input styles
  const inputClassName = "w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-white placeholder-gray-500 hover:bg-black/30";
  const labelClassName = "block text-sm font-medium text-gray-300 mb-2 ml-1";

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">Committee Manager</h1>
          <p className="text-gray-400 text-lg">Manage committees, members, and organizational hierarchy</p>
        </div>
        <button
          onClick={() => handleOpenCommitteeForm()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] transition-all"
        >
          <BuildingLibraryIcon className="w-5 h-5" />
          <span>New Committee</span>
        </button>
      </div>

       {/* Stats Cards */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Committees', value: committees.length, color: 'text-white', icon: BuildingLibraryIcon, border: 'border-white/10' },
          { label: 'Total Members', value: totalMembers, color: 'text-blue-400', icon: UserGroupIcon, border: 'border-blue-500/20' },
          { label: 'Active Members', value: totalPublishedMembers, color: 'text-green-400', icon: CheckCircleIcon, border: 'border-green-500/20' },
          { label: 'Student Execs', value: committees.reduce((sum, c) => sum + c.members.filter(m => m.category === 'Student Executives').length, 0), color: 'text-purple-400', icon: AcademicCapIcon, border: 'border-purple-500/20' },
        ].map((stat, index) => (
          <div key={index} className={`bg-gray-900/60 backdrop-blur-xl border ${stat.border} p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-lg`}>
            <stat.icon className={`w-6 h-6 mb-2 ${stat.color} opacity-80`} />
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Committees Accordion */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
           <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 animate-pulse">Loading committees...</p>
          </div>
        </div>
      ) : committees.length === 0 ? (
        <div className="bg-gray-900/40 border border-white/5 rounded-2xl p-16 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <BuildingLibraryIcon className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No committees found</h3>
          <p className="text-gray-400 mb-6">Create your first committee to start managing members.</p>
           <button
             onClick={() => handleOpenCommitteeForm()}
             className="text-purple-400 hover:text-purple-300 font-semibold"
           >
             + Create Committee
           </button>
        </div>
      ) : (
        <div className="space-y-4">
          {committees.map((committee) => (
            <div key={committee.id} className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-lg transition-all hover:border-purple-500/30">
              
              {/* Committee Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => toggleExpanded(committee.id)}
              >
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-300 transition-transform duration-300 ${expandedCommittees.has(committee.id) ? 'rotate-180' : ''}`}>
                             <ChevronDownIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-white">{committee.name}</h2>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-gray-300 border border-white/5">
                                    {committee.year_range}
                                </span>
                                 <button
                                    onClick={(e) => handleToggleCommitteePublish(committee.id, committee.is_published, e)}
                                    className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                      committee.is_published
                                        ? 'bg-green-500/10 text-green-300 border-green-500/20 hover:bg-green-500/20'
                                        : 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20 hover:bg-yellow-500/20'
                                    } transition-colors`}
                                  >
                                    {committee.is_published ? 'Published' : 'Draft'}
                                  </button>
                            </div>
                            <p className="text-gray-400 text-sm mt-1">{committee.members.length} member{committee.members.length !== 1 ? 's' : ''} • {committee.description || 'No description'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleOpenMemberForm(committee.id, undefined, e)}
                          className="px-4 py-2 bg-purple-600/20 text-purple-300 border border-purple-600/30 rounded-lg hover:bg-purple-600/30 transition-all text-sm font-semibold flex items-center gap-2"
                        >
                          <PlusIcon className="w-4 h-4" /> Add Member
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenCommitteeForm(committee); }}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                         <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteCommittee(committee.id, committee.name); }}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                 </div>
              </div>

              {/* Members Grid (Expanded) */}
              {expandedCommittees.has(committee.id) && (
                <div className="border-t border-white/5 bg-black/20 p-6 animate-fadeIn">
                   {committee.members.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
                        <UsersIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 mb-4">No members in this committee yet.</p>
                        <button
                            onClick={(e) => handleOpenMemberForm(committee.id, undefined, e)}
                            className="text-purple-400 hover:text-purple-300 font-semibold"
                        >
                            + Add First Member
                        </button>
                      </div>
                   ) : (
                      <div>
                         <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-4 flex items-center gap-2">
                            <ArrowPathRoundedSquareIcon className="w-4 h-4" /> Drag to reorder members
                         </p>
                         
                         <DndContext 
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(e) => handleDragEnd(e, committee.id)}
                         >
                             <SortableContext 
                                items={[...committee.members].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)).map(m => m.id)}
                                strategy={rectSortingStrategy}
                             >
                                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                   {[...committee.members]
                                     .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                                     .map((member) => (
                                       <SortableMemberCard
                                          key={member.id}
                                          member={member}
                                          committeeId={committee.id}
                                          getCategoryColor={getCategoryColor}
                                          onTogglePublish={handleToggleMemberPublish}
                                          onEdit={(e) => handleOpenMemberForm(committee.id, member, e)}
                                          onDelete={(e) => handleDeleteMember(member.id, member.name)}
                                       />
                                   ))}
                                 </div>
                             </SortableContext>
                         </DndContext>
                      </div>
                   )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Committee Modal */}
      <Modal
        isOpen={isCommitteeFormOpen}
        onClose={handleCloseCommitteeForm}
        title={editingCommittee ? 'Edit Committee' : 'New Committee'}
      >
        <form id="committee-form" onSubmit={handleSubmitCommittee} className="space-y-6">
            <div>
              <label className={labelClassName}>Committee Name *</label>
              <input
                type="text"
                value={committeeFormData.name}
                onChange={(e) => setCommitteeFormData({ ...committeeFormData, name: e.target.value })}
                placeholder="e.g. Executive Committee"
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label className={labelClassName}>Year Range *</label>
              <input
                type="text"
                value={committeeFormData.year_range}
                onChange={(e) => setCommitteeFormData({ ...committeeFormData, year_range: e.target.value })}
                placeholder="e.g. 2024-2025"
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label className={labelClassName}>Description</label>
              <textarea
                value={committeeFormData.description}
                onChange={(e) => setCommitteeFormData({ ...committeeFormData, description: e.target.value })}
                placeholder="Brief description..."
                rows={3}
                className={inputClassName}
              />
            </div>

            <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <input
                  type="checkbox"
                  checked={committeeFormData.is_published}
                  onChange={(e) => setCommitteeFormData({ ...committeeFormData, is_published: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-500 text-purple-600 focus:ring-purple-500 bg-transparent"
                />
                <span className="text-gray-300 font-medium text-sm">Publish immediately</span>
            </label>

            <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
              {editingCommittee ? 'Update Committee' : 'Create Committee'}
            </button>
        </form>
      </Modal>

      {/* Member Modal */}
      <Modal
        isOpen={isMemberFormOpen}
        onClose={handleCloseMemberForm}
        title={editingMember ? 'Edit Member' : 'Add Member'}
      >
        <div className="space-y-6">
          {/* Member Search */}
          {!editingMember && (
              <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-4 border border-white/10 mb-6">
                  <label className="text-sm font-medium text-purple-300 mb-2 block flex items-center gap-2">
                    <MagnifyingGlassIcon className="w-4 h-4" /> Import Existing Member
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or email..."
                      className={inputClassName}
                    />
                    {isSearching && <div className="absolute right-3 top-3.5"><div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"/></div>}
                  </div>

                  {showSearchResults && searchResults.length > 0 && (
                    <div className="mt-2 bg-gray-800 border border-white/10 rounded-xl overflow-hidden max-h-48 overflow-y-auto custom-scrollbar shadow-2xl z-20">
                        {getFilteredSearchResults(searchResults).map(member => (
                          <button
                              key={member.id}
                              onClick={() => handleSelectMember(member)}
                              className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 flex items-center gap-3 transition-colors"
                          >
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
                                <AdminImage src={member.photo} alt={member.name} width={32} height={32} className="w-full h-full object-cover"/>
                              </div>
                              <div>
                                <p className="text-white text-sm font-semibold">{member.name}</p>
                                <p className="text-gray-500 text-xs">{member.designation} ({member.email})</p>
                              </div>
                          </button>
                        ))}
                    </div>
                  )}
              </div>
          )}

          <form id="member-form" onSubmit={handleSubmitMember} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className={labelClassName}>Full Name *</label>
                    <input
                      type="text"
                      value={memberFormData.name}
                      onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                      className={inputClassName}
                      required
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className={labelClassName}>Designation *</label>
                    <input
                      type="text"
                      value={memberFormData.designation}
                      onChange={(e) => setMemberFormData({ ...memberFormData, designation: e.target.value })}
                      className={inputClassName}
                      required
                    />
                  </div>
              </div>

              <div>
                  <label className={labelClassName}>Category *</label>
                  <select
                      value={memberFormData.category}
                      onChange={(e) => setMemberFormData({ ...memberFormData, category: e.target.value as any })}
                      className={inputClassName}
                  >
                      <option value="Student Executives" className="bg-gray-900">Student Executive</option>
                      <option value="Faculty Advisors" className="bg-gray-900">Faculty Advisor</option>
                  </select>
              </div>

              <div>
                    <label className={labelClassName}>Photo Path *</label>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={memberFormData.photo}
                        onChange={(e) => setMemberFormData({ ...memberFormData, photo: e.target.value })}
                        className={inputClassName}
                        placeholder="/members/name.jpg"
                        required
                      />
                      <div className="w-12 h-12 bg-black/40 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                          <AdminImage src={memberFormData.photo} alt="Preview" width={48} height={48} className="w-full h-full object-cover" />
                      </div>
                    </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Contact & Social</h3>

                  <div>
                    <label className={labelClassName}>Email</label>
                    <input
                      type="email"
                      value={memberFormData.email}
                      onChange={(e) => setMemberFormData({ ...memberFormData, email: e.target.value })}
                      className={inputClassName}
                    />
                  </div>

                  {memberFormData.category === 'Student Executives' && (
                    <>
                      <div>
                        <label className={labelClassName}>Student ID</label>
                        <input
                          type="text"
                          value={memberFormData.student_id}
                          onChange={(e) => setMemberFormData({ ...memberFormData, student_id: e.target.value })}
                          className={inputClassName}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={memberFormData.facebook}
                          onChange={(e) => setMemberFormData({ ...memberFormData, facebook: e.target.value })}
                          className={inputClassName}
                          placeholder="Facebook URL"
                        />
                          <input
                          type="text"
                          value={memberFormData.linkedin}
                          onChange={(e) => setMemberFormData({ ...memberFormData, linkedin: e.target.value })}
                          className={inputClassName}
                          placeholder="LinkedIn URL"
                        />
                          <input
                          type="text"
                          value={memberFormData.github}
                          onChange={(e) => setMemberFormData({ ...memberFormData, github: e.target.value })}
                          className={inputClassName}
                          placeholder="GitHub URL"
                        />
                      </div>
                    </>
                  )}
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Previous Roles</h3>
                  <div className="flex gap-2">
                    <input
                      value={roleYear}
                      onChange={(e) => setRoleYear(e.target.value)}
                      className={`${inputClassName} w-24`}
                      placeholder="Year"
                    />
                    <input
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      className={inputClassName}
                      placeholder="Role (e.g. Treasurer)"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRole())}
                    />
                    <button type="button" onClick={handleAddRole} className="px-4 bg-purple-600 rounded-xl text-white font-bold hover:bg-purple-500 transition-colors">Add</button>
                  </div>
                  <div className="space-y-2">
                    {memberFormData.previous_roles.map((role, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                          <span className="text-sm text-gray-300"><span className="text-purple-400 font-bold">{role.year}</span> - {role.role}</span>
                          <button type="button" onClick={() => handleRemoveRole(idx)} className="text-red-400 hover:text-red-300"><XMarkIcon className="w-4 h-4"/></button>
                        </div>
                    ))}
                  </div>
              </div>

              <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={memberFormData.is_published}
                    onChange={(e) => setMemberFormData({ ...memberFormData, is_published: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-500 text-purple-600 focus:ring-purple-500 bg-transparent"
                  />
                  <span className="text-gray-300 font-medium text-sm">Publish member immediately</span>
              </label>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {editingMember ? 'Update Member' : 'Add Member'}
              </button>
          </form>
        </div>
      </Modal>

      <AdminHelpButton
        title="👥 Committee Manager"
        instructions={[
          "**Committee Management**: Create and manage executive committees for different terms (e.g., 2024-2025).",
          "**Member Directory**: Store data for Faculty Advisors, Executives, and General Members.",
          "**Import Flow**: Use the search bar to import a member from a previous year to the current committee.",
          "**Ordering**: Drag and drop member cards to arrange the public 'Our Team' page hierarchy."
        ]}
        tips={[
          "**Photo Paths**: Ensure images are uploaded to `/public/members/` before referencing them.",
          "**Social Links**: Only `LinkedIn` and `Facebook` icons appear on the card if provided.",
          "**Previous Roles**: You can tag a member's history (e.g., '2023 - Volunteer') to build their profile."
        ]}
        actions={[
          { 
            title: "🔃 Drag & Drop Reordering", 
            description: "Click and hold any member card to drag it into a new position. The order saves automatically." 
          },
          {
            title: "🎓 Importing Members",
            description: "1. Click `Add Member`.\n2. Use the **Import Existing Member** search bar.\n3. Keep their profile but assign a new designation for this year."
          }
        ]}
      />

      <style jsx global>{`
        @keyframes slideRight {
            from { opacity: 0; transform: translateX(100%); }
            to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideRight {
            animation: slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}


