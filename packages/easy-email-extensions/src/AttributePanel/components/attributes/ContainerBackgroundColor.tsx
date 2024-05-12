import React, { useMemo } from 'react';
import { ColorPickerField } from '../../../components/Form';
import { useFocusIdx } from 'easy-email-editor';
import { TreeSelectDataType } from '@arco-design/web-react/es/TreeSelect/interface';

export function ContainerBackgroundColor({
  title = String('Container background color'),
  showThemeColorDropdown,
  paletteTree,
  resetToDefaultBackgroundColor,
  allowClear,
}: {
  title?: string;
  showThemeColorDropdown?: boolean;
  paletteTree?: TreeSelectDataType[];
  resetToDefaultBackgroundColor: () => void;
  allowClear: boolean;
}) {
  const { focusIdx } = useFocusIdx();

  return useMemo(() => {
    return (
      <ColorPickerField
        label={title}
        name={`${focusIdx}.attributes.container-background-color`}
        showThemeColorDropdown={showThemeColorDropdown}
        paletteTree={paletteTree}
        isForBackgroundColor
        allowClear={allowClear}
      />
    );
  }, [focusIdx, title, showThemeColorDropdown, paletteTree]);
}
