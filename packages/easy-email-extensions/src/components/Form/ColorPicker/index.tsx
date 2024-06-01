import { Input, Popover, PopoverProps } from '@arco-design/web-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import { getImg } from '@extensions/AttributePanel/utils/getImg';
import Color from 'color';
import { PresetColorsContext } from '@extensions/AttributePanel/components/provider/PresetColorsProvider';
import { ColorPickerContent } from './ColorPickerContent';
import { TreeSelectDataType } from '@arco-design/web-react/es/TreeSelect/interface';
import { useField } from 'react-final-form';
import { useFocusIdx } from 'easy-email-editor';

export interface ColorPickerProps extends PopoverProps {
  onChange?: (val: string) => void;
  value?: string;
  label: string;
  children?: React.ReactNode;
  showInput?: boolean;
  fixed?: boolean;
  showThemeColorDropdown?: boolean;
  paletteTree?: TreeSelectDataType[];
  isForBackgroundColor?: boolean;
  resetToDefaultColor?: () => void;
  resetToDefaultBackgroundColor?: () => void;
  allowClear?: boolean;
}

const getCollapseItemEle = (node: HTMLElement | null): HTMLElement => {
  if (!node) return document.body;
  if (node.classList.contains('arco-collapse-item')) {
    return node;
  }
  return getCollapseItemEle(node.parentElement);
};
const transparentColor = 'rgba(0,0,0,0)';

export function ColorPicker(props: ColorPickerProps) {
  // Constants:
  const { value = '', onChange, children, showInput = true } = props;
  const { addCurrentColor } = useContext(PresetColorsContext);
  const { focusIdx } = useFocusIdx();
  const dataColorPaletteName = useField(`${focusIdx}.attributes.data-color-palette-name`);
  const dataColorPaletteColorName = useField(`${focusIdx}.attributes.data-color-palette-color-name`);

  const dataBackgroundColorPaletteName = useField(`${focusIdx}.attributes.data-background-color-palette-name`);
  const dataBackgroundColorPaletteColorName = useField(`${focusIdx}.attributes.data-background-color-palette-color-name`);

  // State:
  const [refEle, setRefEle] = useState<HTMLElement | null>(null);

  // Functions:
  const onInputChange = useCallback(
    (value: string) => {
      onChange?.(value);
      addCurrentColor(value);
    },
    [addCurrentColor, onChange],
  );

  const getPopupContainer = useCallback(() => {
    return getCollapseItemEle(refEle);
  }, [refEle]);

  // Memo:
  const inputColor = useMemo(() => {
    if (props.value?.startsWith('#') && props.value?.length === 7)
      return props.value?.replace('#', '');
    return props.value;
  }, [props.value]);

  const adapterColor = useMemo(() => {
    try {
      if (value.length === 6 && Color(`#${value}`).hex()) return `#${value}`;
    } catch (error) {
      console.log('err', value);
    }
    return value;
  }, [value]);

  // Return:
  return (
    <div style={{ flex: 1, display: 'flex' }}>
      <Popover
        title={props.label}
        trigger='click'
        className='color-picker-popup'
        content={(
          <ColorPickerContent
            value={adapterColor}
            onChange={onInputChange}
            showThemeColorDropdown={props.showThemeColorDropdown}
            paletteTree={props.paletteTree}
            isForBackgroundColor={props.isForBackgroundColor}
          />
        )}
        getPopupContainer={getPopupContainer}
        disabled={
          (props.isForBackgroundColor && dataBackgroundColorPaletteName.input.value) ||
          (!props.isForBackgroundColor && dataColorPaletteName.input.value)
        }
        {...props}
      >
        {children || (
          <div
            ref={setRefEle}
            style={{
              display: 'inline-block',
              height: 32,
              width: 32,
              boxSizing: 'border-box',
              padding: 4,
              border: '1px solid var(--color-neutral-3, rgb(229, 230, 235))',
              borderRadius: showInput ? undefined : 4,
              fontSize: 0,
              borderRight: showInput ? 'none' : undefined,
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            {props.value ? (
              <span
                style={{
                  position: 'relative',
                  display: 'block',
                  border: '1px solid var(--color-neutral-3, rgb(229, 230, 235))',

                  borderRadius: 2,
                  width: '100%',
                  height: '100%',
                  textAlign: 'center',
                  backgroundColor: adapterColor,
                }}
              />
            ) : (
              <img
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  filter: 'invert(  0.78  )  drop-shadow(0 0px 0 rgb(0 0 0 / 45%))',
                }}
                src={getImg('AttributePanel_02')}
              />
            )}
            <style>
              {`
                [title="${transparentColor}"] {
                  background-image: url("https://res.cloudinary.com/flashmail/image/upload/v1656944736/cl4vlvzcm05911zsaor6aktl0/ce7qm7lxs5jm47ggabha.png") !important
                }

                `}
            </style>
          </div>
        )}
      </Popover>
      {showInput &&
        ((
          (props.isForBackgroundColor && dataBackgroundColorPaletteName.input.value) ||
          (!props.isForBackgroundColor && dataColorPaletteName.input.value)
        ) ?
          (
            <Input
              value={
                props.isForBackgroundColor ?
                  `${dataBackgroundColorPaletteName.input.value}.${dataBackgroundColorPaletteColorName.input.value}` :
                  `${dataColorPaletteName.input.value}.${dataColorPaletteColorName.input.value}`
              }
              style={{ outline: 'none', flex: 1 }}
              disabled
            />
          )
          :
          (
            <Input
              value={inputColor}
              style={{ outline: 'none', flex: 1 }}
              onChange={onInputChange}
              allowClear={props.allowClear}
            />
          ))
      }
    </div>
  );
}
