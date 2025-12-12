import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AdminImage from '@/components/AdminImage';
import { PencilIcon, TrashIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { CommitteeMember } from '@/lib/types/database';

interface SortableMemberCardProps {
  member: CommitteeMember;
  committeeId: string;
  getCategoryColor: (category: string) => string;
  onTogglePublish: (id: string, status: boolean) => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export function SortableMemberCard({
  member,
  committeeId,
  getCategoryColor,
  onTogglePublish,
  onEdit,
  onDelete
}: SortableMemberCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes} 
      {...listeners}
      className={`group bg-gray-800/40 border rounded-xl p-4 transition-all flex items-start gap-4 cursor-grab active:cursor-grabbing hover:bg-gray-800/60 touch-none ${
        isDragging
          ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] bg-gray-800 opacity-50 z-50'
          : 'border-white/5'
      }`}
    >
       <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 flex-shrink-0 bg-black/40 pointer-events-none">
          <AdminImage
            src={member.photo}
            alt={member.name}
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
       </div>
       
       <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-start justify-between mb-1 pr-6">
             <h3 className="font-bold text-white truncate">{member.name}</h3>
             <button
                onClick={(e) => { e.stopPropagation(); onTogglePublish(member.id, member.is_published); }}
                className={`w-2 h-2 rounded-full flex-shrink-0 ${member.is_published ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-600'}`}
                title={member.is_published ? 'Published' : 'Draft'}
             />
          </div>
          <p className="text-purple-400 text-sm font-medium truncate mb-1">{member.designation}</p>
          
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wide font-bold border ${getCategoryColor(member.category)}`}>
            {member.category === 'Student Executives' ? 'Student' : 'Faculty'}
          </span>

          <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
              <button
                onClick={onEdit}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Edit Member"
              >
                <PencilIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete Member"
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
          </div>
       </div>
    </div>
  );
}
