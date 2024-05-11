import React, { useMemo } from 'react';
import { useFocusIdx } from 'easy-email-editor';
import { AutoCompleteField } from '../../../components/Form';
import { useFontFamily } from '@extensions/hooks/useFontFamily';

export function FontFamily({ name, disabled }: { name?: string; disabled?: boolean; }) {
  const { focusIdx } = useFocusIdx();
  const { fontList } = useFontFamily();

  return useMemo(() => {
    return (
      <AutoCompleteField
        disabled={disabled}
        style={{ minWidth: 100, flex: 1 }}
        showSearch
        label={String('Font family')}
        name={name || `${focusIdx}.attributes.font-family`}
        options={fontList}
      />
    );
  }, [disabled, focusIdx, fontList, name]);
}
