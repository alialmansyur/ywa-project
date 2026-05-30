import React from 'react';
import Select from 'react-select';

export function SearchableSelect({ options, value, onChange, placeholder = 'Pilih...', className = '', disabled = false, isClearable = true }) {
  // Custom styles to match the dark theme Tailwind UI
  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: 'rgb(30 41 59 / 0.5)', // bg-slate-800/50
      borderColor: state.isFocused ? '#3b82f6' : 'rgb(51 65 85)', // border-blue-500 or border-slate-700
      color: 'white',
      borderRadius: '0.75rem', // rounded-xl
      padding: '2px',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      '&:hover': {
        borderColor: '#3b82f6',
      },
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer'
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'rgb(30 41 59)', // bg-slate-800
      border: '1px solid rgb(51 65 85)', // border-slate-700
      borderRadius: '0.75rem', // rounded-xl
      overflow: 'hidden',
      zIndex: 50,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? '#3b82f6' // bg-blue-500
        : state.isFocused 
          ? 'rgb(51 65 85)' // bg-slate-700
          : 'transparent',
      color: 'white',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#2563eb', // bg-blue-600
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: 'white',
      fontSize: '0.875rem', // text-sm
    }),
    input: (base) => ({
      ...base,
      color: 'white',
    }),
    placeholder: (base) => ({
      ...base,
      color: 'rgb(148 163 184)', // text-slate-400
      fontSize: '0.875rem',
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: 'rgb(51 65 85)',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: 'rgb(148 163 184)',
      '&:hover': {
        color: 'white',
      }
    }),
    clearIndicator: (base) => ({
      ...base,
      color: 'rgb(148 163 184)',
      '&:hover': {
        color: 'white',
      }
    })
  };

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      styles={customStyles}
      className={className}
      isDisabled={disabled}
      isClearable={isClearable}
      noOptionsMessage={() => "Tidak ada data"}
    />
  );
}
