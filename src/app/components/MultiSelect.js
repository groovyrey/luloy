'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactIconRenderer from './ReactIconRenderer';
import styles from './MultiSelect.module.css';

export default function MultiSelect({ options, selectedValues, onValuesChange, disabled, placeholder = "Select options" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (value) => {
    let newSelectedValues;
    if (selectedValues.includes(value)) {
      newSelectedValues = selectedValues.filter(item => item !== value);
    } else {
      newSelectedValues = [...selectedValues, value];
    }
    onValuesChange(newSelectedValues);
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

  const displayValue = selectedValues.length > 0
    ? options.filter(option => selectedValues.includes(option.value)).map(option => option.label).join(', ')
    : placeholder;

  return (
    <div className={styles.multiSelectContainer} ref={dropdownRef}>
      <button
        type="button"
        className={`${styles.selectButton} form-control form-control-sm`}
        onClick={handleToggle}
        disabled={disabled}
      >
        {displayValue}
        <i className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'} ${styles.dropdownArrow}`}></i>
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          {options.map(option => {
            const isSelected = selectedValues.includes(option.value);
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
