'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactIconRenderer from './ReactIconRenderer';
import { GENDER_ICONS } from '@/app/utils/BadgeSystem';
import styles from './GenderSelect.module.css';

export default function GenderSelect({ selectedGender, onGenderChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const availableGenders = [
    'Male',
    'Female',
    'Prefer not to say',
  ];

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (gender) => {
    onGenderChange(gender);
    setIsOpen(false);
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

  const displayGender = selectedGender || 'None';
  const displayIcon = GENDER_ICONS[displayGender];

  return (
    <div className={styles.genderSelectContainer} ref={dropdownRef}>
      <button
        type="button"
        className={`${styles.selectButton} form-control form-control-sm`}
        onClick={handleToggle}
        disabled={disabled}
      >
        <div className={styles.selectedDisplay}>
          {displayIcon && (
            <ReactIconRenderer IconComponent={displayIcon.icon} size={16} color={displayIcon.color} className="me-2" />
          )}
          {displayGender}
        </div>
        <i className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'} ${styles.dropdownArrow}`}></i>
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div
            className={`${styles.dropdownItem} ${selectedGender === '' ? styles.selected : ''}`}
            onClick={() => handleSelect('')}
          >
            None
          </div>
          {availableGenders.map(gender => {
            const isSelected = selectedGender === gender;
            const genderIcon = GENDER_OPTIONS.find(option => option.value === gender);
            return (
              <div
                key={gender}
                className={`${styles.dropdownItem} ${isSelected ? styles.selected : ''}`}
                onClick={() => handleSelect(gender)}
              >
                {genderIcon && (
                  <ReactIconRenderer IconComponent={genderIcon.icon} size={16} color={genderIcon.color} className="me-2" />
                )}
                {gender}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
