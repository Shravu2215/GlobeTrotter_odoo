import { useTrip } from '@/hooks/useTrip';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { ArrowLeft, Wallet, AlertTriangle, CheckCircle, TrendingDown, TrendingUp } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  Sightseeing: '#3B82F6',
  Museum:      '#8B5CF6',
  Food:        '#F59E0B',
  Adventure:   '#10B981',
  Nature:      '#34D399',
  Historical:  '#EF4444',
  Shopping:    '#EC4899',
  Transport:   '#6B7280',
};

const getColor = (category: string) =>
  CATEGORY_COLORS[category] ?? '#9CA3AF';

const BudgetView = () => {
  const { currentTrip } = useTrip();
  const navigate = useNavigate();

  if (!currentTrip) {
    return (
      <div className="min-h-screen bg-roamora-bg flex flex-col items-center justify-center p-8 text-center">
        <h2 className="font-display text-3xl font-semibold text-roamora-green mb-4">No active trip found</h2>
        <button
          onClick={() => navigate('/create-trip')}
          className="bg-roamora-green text-white px-6 py-3 rounded-xl font-medium"
        >
          Create Trip
        </button>
      </div>
    );
  }

  // ── Calculations ──
  const totalBudget = currentTrip.sections.reduce((sum, s) => sum + Number(s.budget), 0);
  const allActivities = currentTrip.sections.flatMap(s => s.activities);
  const activityExpenses = allActivities.reduce((sum, a) => sum + Number(a.cost), 0);
  const remainingBudget = totalBudget - activityExpenses;
  const isOverBudget = remainingBudget < 0;
  const isAtBudget = remainingBudget === 0;

  // ── Category breakdown ──
  const categoryTotals = allActivities.reduce<Record<string, { total: number; activities: string[] }>>(
    (acc, a) => {
      if (!acc[a.category]) acc[a.category] = { total: 0, activities: [] };
      acc[a.category].total += Number(a.cost);
      acc[a.category].activities.push(a.name);
      return acc;
    },
    {}
  );
  const sortedCategories = Object.entries(categoryTotals).sort(([, a], [, b]) => b.total - a.total);
  const maxCost = Math.max(...sortedCategories.map(([, v]) => v.total), 1);

  // ── Budget usage percentage ──
  const usagePercent = totalBudget > 0 ? Math.min((activityExpenses / totalBudget) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-roamora-bg text-roamora-text font-body">
      <Header />

      <main className="px-4 md:px-8 pb-24 max-w-5xl mx-auto mt-6">

        {/* ── Page Header ── */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/view-itinerary')}
            className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-gray-400 hover:text-roamora-green hover:border-roamora-green transition-colors shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-roamora-green">
              Budget & Cost Breakdown
            </h1>
            <p className="text-gray-500 font-medium">{currentTrip.name}</p>
          </div>
        </div>

        {/* ── Status Banner ── */}
        {isOverBudget ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 className="font-bold text-red-800 text-lg leading-tight">
                ⚠ You are over budget by ₹{Math.abs(remainingBudget).toLocaleString()}
              </h3>
              <p className="text-red-600 text-sm mt-0.5 font-medium">
                Review your activities or increase your section budgets.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle size={22} />
            </div>
            <div>
              <h3 className="font-bold text-emerald-800 text-lg leading-tight">
                {isAtBudget ? '✓ You have exactly reached your budget.' : '✓ You are within your budget.'}
              </h3>
              {!isAtBudget && (
                <p className="text-emerald-600 text-sm mt-0.5 font-medium">
                  ₹{remainingBudget.toLocaleString()} remaining to spend.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── 3 Summary Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Wallet size={20} className="text-gray-500" />
              </div>
              <span className="text-gray-500 font-medium">Total Budget</span>
            </div>
            <div className="font-display text-4xl font-bold text-gray-900">
              ₹{totalBudget.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 mt-2 font-medium">
              Across {currentTrip.sections.length} section{currentTrip.sections.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <TrendingDown size={20} className="text-orange-500" />
              </div>
              <span className="text-gray-500 font-medium">Activity Costs</span>
            </div>
            <div className="font-display text-4xl font-bold text-orange-600">
              ₹{activityExpenses.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 mt-2 font-medium">
              {allActivities.length} activit{allActivities.length !== 1 ? 'ies' : 'y'} planned
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOverBudget ? 'bg-red-50' : 'bg-roamora-green/10'}`}>
                <TrendingUp size={20} className={isOverBudget ? 'text-red-500' : 'text-roamora-green'} />
              </div>
              <span className="text-gray-500 font-medium">Remaining</span>
            </div>
            <div className={`font-display text-4xl font-bold ${isOverBudget ? 'text-red-600' : 'text-roamora-green'}`}>
              {isOverBudget ? '-' : ''}₹{Math.abs(remainingBudget).toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 mt-2 font-medium">
              {isOverBudget ? 'Over budget' : 'Left to spend'}
            </div>
          </div>
        </div>

        {/* ── Budget Usage Progress Bar ── */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex justify-between items-end mb-3">
            <h2 className="font-display text-xl font-semibold text-gray-800">Budget Usage</h2>
            <span className="text-sm font-semibold text-gray-500">
              {usagePercent.toFixed(1)}% used
            </span>
          </div>
          <div className="h-5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${isOverBudget ? 'bg-red-500' : 'bg-roamora-green'}`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
            <span>₹0</span>
            <span>₹{totalBudget.toLocaleString()}</span>
          </div>
        </div>

        {/* ── Section Budget Breakdown ── */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
          <h2 className="font-display text-xl font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-100">
            Budget by Section
          </h2>
          {currentTrip.sections.length === 0 ? (
            <p className="text-gray-400 italic text-center py-8">No sections added yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {currentTrip.sections.map(section => {
                const sectionActivitiesCost = section.activities.reduce((s, a) => s + Number(a.cost), 0);
                const sectionUsage = section.budget > 0 ? (sectionActivitiesCost / section.budget) * 100 : 0;
                const sectionOver = sectionActivitiesCost > section.budget;

                return (
                  <div key={section.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">{section.city}</h3>
                        <span className="text-xs text-gray-400 font-medium">
                          {section.startDate} – {section.endDate}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">₹{Number(section.budget).toLocaleString()}</div>
                        <div className={`text-xs font-medium ${sectionOver ? 'text-red-500' : 'text-gray-400'}`}>
                          {sectionOver
                            ? `Over by ₹${(sectionActivitiesCost - section.budget).toLocaleString()}`
                            : `₹${sectionActivitiesCost.toLocaleString()} spent`}
                        </div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${sectionOver ? 'bg-red-400' : 'bg-roamora-green'}`}
                        style={{ width: `${Math.min(sectionUsage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Section totals divider */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-2">
                <span className="font-semibold text-gray-700 uppercase tracking-wide text-sm">Total Trip Budget</span>
                <span className="font-display text-xl font-bold text-roamora-green">₹{totalBudget.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Category Bar Chart ── */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h2 className="font-display text-xl font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-100">
            Spending by Category
          </h2>

          {sortedCategories.length === 0 ? (
            <div className="text-center py-12 text-gray-400 font-medium">
              No activity expenses recorded yet.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {sortedCategories.map(([category, { total, activities: acts }]) => {
                const pct = (total / maxCost) * 100;
                const ofTotal = activityExpenses > 0 ? ((total / activityExpenses) * 100).toFixed(1) : '0';
                const color = getColor(category);

                return (
                  <div key={category}>
                    <div className="flex justify-between items-baseline mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                        <span className="font-semibold text-gray-800">{category}</span>
                        <span className="text-xs text-gray-400 font-medium">
                          ({ofTotal}% of expenses)
                        </span>
                      </div>
                      <span className="font-bold text-gray-900 text-lg">₹{total.toLocaleString()}</span>
                    </div>

                    {/* Bar */}
                    <div className="h-5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>

                    {/* Activities under bar */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {acts.map(name => (
                        <span
                          key={name}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Total summary */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-2">
                <span className="font-semibold text-gray-700 uppercase tracking-wide text-sm">Total Activity Expenses</span>
                <span className="font-display text-xl font-bold text-orange-600">₹{activityExpenses.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default BudgetView;
