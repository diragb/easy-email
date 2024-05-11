import React from 'react';
import { useFocusIdx } from 'easy-email-editor';
import { InputWithUnitField } from '../../../components/Form';
import { pixelAdapter } from '../adapter';

export function FontSize({ disabled }: { disabled?: boolean; }) {
  const { focusIdx } = useFocusIdx();

  return (
    <InputWithUnitField
      disabled={disabled}
      label={String('Font size (px)')}
      name={`${focusIdx}.attributes.font-size`}
      config={pixelAdapter}
      autoComplete='off'
    />
  );
}
