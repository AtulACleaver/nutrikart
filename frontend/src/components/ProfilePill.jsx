import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import { useProfile } from '../store/ProfileContext';

const CONDITIONS = [
  { id: null, label: 'All Foods (No Profile)' },
  { id: 'diabetic', label: 'Diabetic-Friendly' },
  { id: 'hypertension', label: 'Hypertension-Conscious' },
  { id: 'weight_loss', label: 'Weight Management' },
];

export function ProfilePill() {
  const { profile, setCondition, setShowAll } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  const activeLabel =
    CONDITIONS.find((c) => c.id === profile.condition)?.label || 'General';

  const summaryText = profile.condition
    ? `${activeLabel} · ${profile.household} ${profile.household === 1 ? 'person' : 'people'}`
    : 'No profile set';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-[40px] px-4 rounded-full bg-[var(--color-sage-100,#f0fae1)] text-[var(--color-sage-900,#272e1b)] font-semibold text-[14px] flex items-center gap-2 cursor-pointer transition-colors hover:bg-[var(--color-sage-200,#e1eecc)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-terracotta-500)]"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <span
          className={`w-2 h-2 rounded-full ${
            profile.condition
              ? 'bg-[var(--color-sage-600,#728157)]'
              : 'bg-[var(--color-neutral-400,#c0b6a5)]'
          }`}
        />
        <span className="truncate max-w-[170px] md:max-w-[240px]">
          {summaryText}
        </span>
        <ChevronDown size={14} strokeWidth={2.75} className="shrink-0" />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Profile Settings"
          className="absolute right-0 top-12 z-50 w-[300px] md:w-[340px] bg-[var(--color-ground,#f5ead8)] rounded-[24px] shadow-lg border border-[var(--color-divider)] p-5 text-left animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--color-divider)]">
            <h4 className="font-['Caprasimo',serif] text-[18px] text-[var(--color-ink,#201e1d)]">
              Health Profile
            </h4>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-[var(--color-neutral-700,#645c50)] hover:bg-[var(--color-surface,#ebddc5)] cursor-pointer"
            >
              <X size={16} strokeWidth={2.75} />
            </button>
          </div>

          <div className="space-y-2 mb-4">
            <span className="text-[12px] font-bold text-[var(--color-neutral-700,#645c50)] uppercase tracking-wider block mb-1">
              Dietary Condition
            </span>
            {CONDITIONS.map((cond) => {
              const isSelected = profile.condition === cond.id;
              return (
                <button
                  key={String(cond.id)}
                  type="button"
                  onClick={() => {
                    setCondition(cond.id);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-semibold text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--color-sage-200,#e1eecc)] text-[var(--color-sage-900,#272e1b)]'
                      : 'hover:bg-[var(--color-surface,#ebddc5)] text-[var(--color-ink,#201e1d)]'
                  }`}
                >
                  <span>{cond.label}</span>
                  {isSelected && <Check size={16} strokeWidth={2.75} className="text-[var(--color-sage-700,#56633f)]" />}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[var(--color-divider)] flex items-center justify-between">
            <label
              htmlFor="show-all-switch"
              className="text-[13px] font-medium text-[var(--color-neutral-800,#474238)] cursor-pointer"
            >
              Show items outside profile
            </label>
            <input
              id="show-all-switch"
              type="checkbox"
              checked={profile.showAll}
              onChange={(e) => setShowAll(e.target.checked)}
              className="accent-[var(--color-terracotta-500,#c67139)] w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePill;
