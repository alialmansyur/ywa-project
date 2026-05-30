import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Search, Calendar, X } from 'lucide-react-native';
import { theme } from '../../constants/AppTheme';
import DateTimePicker from '@react-native-community/datetimepicker';

export function SearchFilterPanel({ 
  onSearch, 
  onFilter, 
  placeholder = "Cari...", 
  hideSearch = false 
}) {
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('from'); // 'from' or 'to'

  const handleSearchChange = (text) => {
    setSearch(text);
    if (onSearch) onSearch(text);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      if (pickerMode === 'from') {
        setFromDate(selectedDate);
      } else {
        setToDate(selectedDate);
      }
    }
  };

  const openPicker = (mode) => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const applyFilter = () => {
    if (onFilter) {
      const fromStr = fromDate ? fromDate.toISOString().split('T')[0] : null;
      const toStr = toDate ? toDate.toISOString().split('T')[0] : null;
      onFilter({ from: fromStr, to: toStr, search });
    }
  };

  const clearFilter = () => {
    setFromDate(null);
    setToDate(null);
    setSearch('');
    if (onFilter) {
      onFilter({ from: null, to: null, search: '' });
    }
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <View style={styles.container}>
      {!hideSearch && (
        <View style={styles.searchBox}>
          <Search size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textSecondary}
            value={search}
            onChangeText={handleSearchChange}
            onSubmitEditing={applyFilter}
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity onPress={() => handleSearchChange('')}>
              <X size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      <View style={styles.dateRow}>
        <TouchableOpacity style={styles.dateBtn} onPress={() => openPicker('from')}>
          <Calendar size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.dateText, !fromDate && styles.placeholder]}>
            {fromDate ? fromDate.toLocaleDateString('id-ID') : 'Dari Tanggal'}
          </Text>
        </TouchableOpacity>

        <Text style={{ marginHorizontal: 8, color: theme.colors.textSecondary }}>-</Text>

        <TouchableOpacity style={styles.dateBtn} onPress={() => openPicker('to')}>
          <Calendar size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.dateText, !toDate && styles.placeholder]}>
            {toDate ? toDate.toLocaleDateString('id-ID') : 'Sampai Tanggal'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.applyBtn} onPress={applyFilter}>
          <Text style={styles.applyBtnText}>Terapkan Filter</Text>
        </TouchableOpacity>
        {(fromDate || toDate || search) && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearFilter}>
            <Text style={styles.clearBtnText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {showPicker && (
        <DateTimePicker
          value={(pickerMode === 'from' ? fromDate : toDate) || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    height: 44,
    marginBottom: theme.spacing.sm,
  },
  searchInput: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  dateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    height: 40,
  },
  dateText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginLeft: 8,
    flex: 1,
  },
  placeholder: {
    color: theme.colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  applyBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    height: 40,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    ...theme.typography.caption,
    fontWeight: 'bold',
    color: '#fff',
  },
  clearBtn: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 40,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtnText: {
    ...theme.typography.caption,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
});
