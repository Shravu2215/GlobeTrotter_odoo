import { useState } from 'react';
import { Section, Activity } from '@/types/trip';
import { Calendar, DollarSign, MapPin, Edit2, Trash2, Plus, Clock } from 'lucide-react';
import { useTrip } from '@/hooks/useTrip';

interface SectionCardProps {
  section: Section;
  index: number;
  onAssignActivities: (sectionId: string) => void;
}

const SectionCard = ({ section, index, onAssignActivities }: SectionCardProps) => {
  const { updateSection, removeSection, removeActivity } = useTrip();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    city: section.city,
    startDate: section.startDate,
    endDate: section.endDate,
    budget: section.budget.toString(),
  });

  const handleSave = () => {
    updateSection(section.id, {
      city: editForm.city,
      startDate: editForm.startDate,
      endDate: editForm.endDate,
      budget: Number(editForm.budget) || 0
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
        <h3 className="font-display text-xl font-semibold text-roamora-green mb-4">Edit Section {index + 1}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-600">City</label>
            <input 
              type="text" 
              value={editForm.city}
              onChange={e => setEditForm({...editForm, city: e.target.value})}
              className="w-full bg-roamora-bg/50 border border-gray-200 rounded-xl px-4 py-2 mt-1 outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Budget (₹)</label>
            <input 
              type="number" 
              value={editForm.budget}
              onChange={e => setEditForm({...editForm, budget: e.target.value})}
              className="w-full bg-roamora-bg/50 border border-gray-200 rounded-xl px-4 py-2 mt-1 outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Start Date</label>
            <input 
              type="date" 
              value={editForm.startDate}
              onChange={e => setEditForm({...editForm, startDate: e.target.value})}
              className="w-full bg-roamora-bg/50 border border-gray-200 rounded-xl px-4 py-2 mt-1 outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">End Date</label>
            <input 
              type="date" 
              value={editForm.endDate}
              onChange={e => setEditForm({...editForm, endDate: e.target.value})}
              className="w-full bg-roamora-bg/50 border border-gray-200 rounded-xl px-4 py-2 mt-1 outline-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-xl">Cancel</button>
          <button onClick={handleSave} className="bg-roamora-green text-white px-6 py-2 rounded-xl">Save</button>
        </div>
      </div>
    );
  }

  // Calculate activity cost
  const activityCost = section.activities.reduce((sum, act) => sum + Number(act.cost), 0);
  const exceedsBudget = activityCost > section.budget;

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="font-display text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">
            Section {index + 1}
          </h2>
          <h3 className="font-display text-2xl font-semibold text-roamora-green flex items-center gap-2">
            <MapPin size={24} className="text-roamora-gold" />
            {section.city}
          </h3>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-roamora-green transition-colors">
            <Edit2 size={18} />
          </button>
          <button onClick={() => removeSection(section.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex items-center gap-2 bg-roamora-bg/80 border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700">
          <Calendar size={16} className="text-roamora-green" />
          {section.startDate} — {section.endDate}
        </div>
        <div className="flex items-center gap-2 bg-roamora-bg/80 border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700">
          <DollarSign size={16} className="text-roamora-green" />
          Budget: ₹{section.budget}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h4 className="font-medium text-gray-700 mb-4 flex justify-between items-center">
          Assigned Activities
          <span className="text-xs text-gray-400 font-normal">{section.activities.length} planned</span>
        </h4>
        
        {section.activities.length > 0 ? (
          <div className="flex flex-col gap-3 mb-6">
            {section.activities.map(activity => (
              <div key={activity.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                    {activity.image ? (
                      <img src={activity.image} alt={activity.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-roamora-green/10 flex items-center justify-center text-roamora-green font-display">{activity.name.charAt(0)}</div>
                    )}
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">{activity.name}</h5>
                    <div className="flex gap-3 text-xs text-gray-500 mt-1 font-medium">
                      <span className="text-roamora-green">{activity.category}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {activity.date}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {activity.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-700">₹{activity.cost}</span>
                  <button onClick={() => removeActivity(section.id, activity.id)} className="text-gray-400 hover:text-red-500 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            
            {exceedsBudget && (
              <div className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2">
                ⚠ Activities exceed this section's budget by ₹{activityCost - section.budget}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400 mb-6 italic">No activities assigned yet.</p>
        )}

        <button 
          onClick={() => onAssignActivities(section.id)}
          className="flex items-center gap-2 text-roamora-green font-medium hover:text-roamora-greenHover transition-colors"
        >
          <Plus size={18} strokeWidth={2.5} />
          Assign Activities
        </button>
      </div>
    </div>
  );
};

export default SectionCard;
