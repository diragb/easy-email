import React from 'react';
import { ColorPickerField } from '../../../components/Form';
import { useFocusIdx } from 'easy-email-editor';
import { TreeSelectDataType } from '@arco-design/web-react/es/TreeSelect/interface';

export function Color({
  title = 'Color',
  showThemeColorDropdown,
  paletteTree,
  resetToDefaultColor,
  allowClear,
}: {
  title?: string;
  inline?: boolean;
  showThemeColorDropdown?: boolean;
  paletteTree?: TreeSelectDataType[];
  resetToDefaultColor?: () => void;
  allowClear?: boolean;
}) {
  const { focusIdx } = useFocusIdx();

  return (
    <ColorPickerField
      label={title}
      name={`${focusIdx}.attributes.color`}
      showThemeColorDropdown={showThemeColorDropdown}
      paletteTree={paletteTree}
      resetToDefaultColor={resetToDefaultColor}
      allowClear={allowClear}
    />
  );
}
