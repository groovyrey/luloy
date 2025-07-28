'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactIconRenderer from './ReactIconRenderer';
import { INTEREST_ICONS } from '@/app/utils/BadgeSystem';
import styles from './InterestMultiSelect.module.css';

export default function InterestMultiSelect({ availableInterests, selectedInterests, onInterestsChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (interest) => {
    let newSelectedInterests;
    if (selectedInterests.includes(interest)) {
      newSelectedInterests = selectedInterests.filter(item => item !== interest);
    } else {
      newSelectedInterests = [...selectedInterests, interest];
    }
    onInterestsChange(newSelectedInterests);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.multiSelectContainer} ref={dropdownRef}>
      <button
        type="button"
        className={`${styles.selectButton} form-control form-control-sm`}
        onClick={handleToggle}
        disabled={disabled}
      >
        {selectedInterests.length > 0 ? selectedInterests.join(', ') : 'Select Interests'}
        <i className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'} ${styles.dropdownArrow}`}></i>
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          {availableInterests.map(interest => {
            const isSelected = selectedInterests.includes(interest);
            const interestIcon = INTEREST_OPTIONS.find(option => option.value === interest);
            return (
              <div
                key={interest}
                className={`${styles.dropdownItem} ${isSelected ? styles.selected : ''}`}
                onClick={() => handleSelect(interest)}
              >
                {interestIcon && (
                  <ReactIconRenderer IconComponent={interestIcon.icon} size={16} color={interestIcon.color} className="me-2" />
                )}
                {interest}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
