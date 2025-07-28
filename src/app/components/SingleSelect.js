'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactIconRenderer from './ReactIconRenderer';
import styles from './SingleSelect.module.css';

export default function SingleSelect({ options, selectedValue, onValueChange, disabled, placeholder = "Select an option" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (value) => {
    onValueChange(value);
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

  const displayOption = options.find(option => option.value === selectedValue);

  return (
    <div className={styles.singleSelectContainer} ref={dropdownRef}>
      <button
        type="button"
        className={`${styles.selectButton} form-control form-control-sm`}
        onClick={handleToggle}
        disabled={disabled}
      >
        <div className={styles.selectedDisplay}>
          {displayOption?.icon && (
            <ReactIconRenderer IconComponent={displayOption.icon} size={16} color={displayOption.color} className="me-2" />
          )}
          {displayOption?.label || placeholder}
        </div>
        <i className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'} ${styles.dropdownArrow}`}></i>
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div
            className={`${styles.dropdownItem} ${selectedValue === '' ? styles.selected : ''}`}
            onClick={() => handleSelect('')}
          >
            {placeholder}
          </div>
          {options.map(option => {
            const isSelected = selectedValue === option.value;
            return (
              <div
                key={option.value}
                className={`${styles.dropdownItem} ${isSelected ? styles.selected : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.icon && (
                  <ReactIconRenderer IconComponent={option.icon} size={16} color={option.color} className="me-2" />
                )}
                {option.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
