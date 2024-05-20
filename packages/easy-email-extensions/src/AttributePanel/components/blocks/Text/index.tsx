import { useField, useForm } from 'react-final-form';
import React, { useEffect, useState } from 'react';
import { Padding } from '@extensions/AttributePanel/components/attributes/Padding';
import { TextDecoration } from '@extensions/AttributePanel/components/attributes/TextDecoration';
import { FontWeight } from '@extensions/AttributePanel/components/attributes/FontWeight';
import { FontStyle } from '@extensions/AttributePanel/components/attributes/FontStyle';
import { FontFamily } from '@extensions/AttributePanel/components/attributes/FontFamily';
import { Height } from '@extensions/AttributePanel/components/attributes/Height';
import { ContainerBackgroundColor } from '@extensions/AttributePanel/components/attributes/ContainerBackgroundColor';
import { FontSize } from '@extensions/AttributePanel/components/attributes/FontSize';
import { Color } from '@extensions/AttributePanel/components/attributes/Color';
import { Align } from '@extensions/AttributePanel/components/attributes/Align';
import { LineHeight } from '@extensions/AttributePanel/components/attributes/LineHeight';
import { LetterSpacing } from '@extensions/AttributePanel/components/attributes/LetterSpacing';

import { AttributesPanelWrapper } from '@extensions/AttributePanel/components/attributes/AttributesPanelWrapper';
import { Collapse, Grid, Space, Tooltip, Button } from '@arco-design/web-react';
import { IconFont, Stack, useFocusIdx } from 'easy-email-editor';
import { HtmlEditor } from '../../UI/HtmlEditor';
import { ClassName } from '../../attributes/ClassName';
import { CollapseWrapper } from '../../attributes/CollapseWrapper';
import { SelectField, TextField } from '@extensions/components/Form';
import { isIDValid } from '@extensions/utils/blockIDManager';
import { getTemplateTheme, Palette, Typography } from 'template-theme-manager';
import { TreeSelectDataType } from '@arco-design/web-react/es/TreeSelect/interface';
import ColorController from 'color';

export function Text() {
  // Constants:
  const { change } = useForm();
  const { focusIdx } = useFocusIdx();
  const fontFamily = useField(`${focusIdx}.attributes.font-family`);
  const fontSize = useField(`${focusIdx}.attributes.font-size`);
  const fontWeight = useField(`${focusIdx}.attributes.font-weight`);
  const dataTypography = useField(`${focusIdx}.attributes.data-typography`);

  // For Text Color:
  const dataColorPaletteTree = useField(`${focusIdx}.attributes.data-color-palette-tree`);
  const color = useField(`${focusIdx}.attributes.color`);
  const dataColorPaletteColorCode = useField(`${focusIdx}.attributes.data-color-palette-color-code`);

  // For Background Color:
  const dataBackgroundColorPaletteTree = useField(`${focusIdx}.attributes.data-background-color-palette-tree`);
  const backgroundColor = useField(`${focusIdx}.attributes.container-background-color`);
  const dataBackgroundColorPaletteColorCode = useField(`${focusIdx}.attributes.data-background-color-palette-color-code`);

  // State:
  const [visible, setVisible] = useState(false);
  const [typography, setTypography] = useState<Typography[]>([]);
  const [typographyList, setTypographyList] = useState<{ label: string; value: string; }[]>([]);
  const [selectedTypography, setSelectedTypography] = useState<Typography>();
  const [defaultTypographicStyling, setDefaultTypographicStyling] = useState<Typography>();
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [paletteTree, setPaletteTree] = useState<TreeSelectDataType[]>([]);
  const [defaultColor, setDefaultColor] = useState<string>();
  const [defaultBackgroundColor, setDefaultBackgroundColor] = useState<string>();
  const [allowClearForColor, setAllowClearForColor] = useState(false);
  const [allowClearForBackgroundColor, setAllowClearForBackgroundColor] = useState(false);

  // Functions:
  const resetToDefaultColor = () => {
    change(`${focusIdx}.attributes.color`, defaultColor ?? '');
  };

  const resetToDefaultBackgroundColor = () => {
    change(`${focusIdx}.attributes.container-background-color`, defaultBackgroundColor ?? '');
  };

  // Effects:
  useEffect(() => {
    const _selectedTypography = typography.find(typographyItem => typographyItem.name === dataTypography.input.value);
    setSelectedTypography(_selectedTypography);
    if (_selectedTypography) {
      change(`${focusIdx}.attributes.font-family`, _selectedTypography.fontFamily ?? '');
      change(`${focusIdx}.attributes.font-size`, _selectedTypography.fontSize ?? '');
      change(`${focusIdx}.attributes.font-weight`, _selectedTypography.fontWeight ?? '');
    } else {
      change(`${focusIdx}.attributes.font-family`, defaultTypographicStyling?.fontFamily ?? '');
      change(`${focusIdx}.attributes.font-size`, defaultTypographicStyling?.fontSize ?? '');
      change(`${focusIdx}.attributes.font-weight`, defaultTypographicStyling?.fontWeight ?? '');
    }
  }, [typography, dataTypography.input.value, defaultTypographicStyling]);

  useEffect(() => {
    setDefaultTypographicStyling({
      name: 'Default',
      fontFamily: fontFamily.input.value,
      fontSize: fontSize.input.value,
      fontWeight: fontWeight.input.value,
    });
  }, []);

  useEffect(() => {
    const _typography = getTemplateTheme()?.typography ?? [];
    setTypography(_typography);
    setTypographyList(_typography.map(typographyItem => ({ label: typographyItem.name, value: typographyItem.name })));
  }, []);

  useEffect(() => {
    const _palettes = getTemplateTheme()?.palettes ?? [];
    setPalettes(_palettes);
    setPaletteTree(_palettes.map(palette => {
      return {
        title: palette.name,
        value: palette.name,
        selectable: false,
        expanded: true,
        children: palette.colors.map(color => {
          return {
            title: (
              <div
                style={{
                  display: 'flex',
                  gap: '5px',
                  alignItems: 'center'
                }}
              >
                <div
                  style={{
                    height: '20px',
                    aspectRatio: '1',
                    backgroundColor: color.color,
                    border: `1px solid ${ColorController(color.color).isLight() ? '#000' : '#FFF'}`
                  }}
                />
                {color.name}
              </div>
            ),
            value: color.name,
          };
        })
      };
    }));
  }, []);

  // For Text Color:
  useEffect(() => {
    if (dataColorPaletteTree.input.value) {
      const indexes = (dataColorPaletteTree.input.value as string)
        .split('-')
        .filter(token => token.length > 0)
        .map(token => parseInt(token));
      const paletteIndex = indexes[0];
      const colorIndex = indexes[1];
      change(`${focusIdx}.attributes.data-color-palette-name`, palettes?.[paletteIndex]?.name ?? '');
      change(`${focusIdx}.attributes.data-color-palette-color-name`, palettes?.[paletteIndex]?.colors?.[colorIndex]?.name ?? '');
      change(`${focusIdx}.attributes.data-color-palette-color-code`, palettes?.[paletteIndex]?.colors?.[colorIndex]?.color ?? '');
      change(`${focusIdx}.attributes.color`, palettes?.[paletteIndex]?.colors?.[colorIndex]?.color ?? '');
      setAllowClearForColor(true);
    } else {
      change(`${focusIdx}.attributes.data-color-palette-name`, '');
      change(`${focusIdx}.attributes.data-color-palette-color-name`, '');
      change(`${focusIdx}.attributes.data-color-palette-color-code`, '');
      setAllowClearForColor(false);
    }
  }, [palettes, dataColorPaletteTree.input.value]);

  useEffect(() => {
    if (!dataColorPaletteTree.input.value) {
      setDefaultColor(color.input.value);
    }
  }, [dataColorPaletteTree.input.value, color.input.value]);

  useEffect(() => {
    if (
      color.input.value &&
      dataColorPaletteColorCode.input.value &&
      color.input.value !== dataColorPaletteColorCode.input.value
    ) {
      change(`${focusIdx}.attributes.data-color-palette-tree`, '');
      change(`${focusIdx}.attributes.data-color-palette-name`, '');
      change(`${focusIdx}.attributes.data-color-palette-color-name`, '');
      change(`${focusIdx}.attributes.data-color-palette-color-code`, '');
      setAllowClearForColor(false);
    }
  }, [dataColorPaletteColorCode.input.value, color.input.value]);

  // For Background Color:
  useEffect(() => {
    if (dataBackgroundColorPaletteTree.input.value) {
      const indexes = (dataBackgroundColorPaletteTree.input.value as string)
        .split('-')
        .filter(token => token.length > 0)
        .map(token => parseInt(token));
      const paletteIndex = indexes[0];
      const colorIndex = indexes[1];
      change(`${focusIdx}.attributes.data-background-color-palette-name`, palettes?.[paletteIndex]?.name ?? '');
      change(`${focusIdx}.attributes.data-background-color-palette-color-name`, palettes?.[paletteIndex]?.colors?.[colorIndex]?.name ?? '');
      change(`${focusIdx}.attributes.data-background-color-palette-color-code`, palettes?.[paletteIndex]?.colors?.[colorIndex]?.color ?? '');
      change(`${focusIdx}.attributes.container-background-color`, palettes?.[paletteIndex]?.colors?.[colorIndex]?.color ?? '');
      setAllowClearForBackgroundColor(true);
    } else {
      change(`${focusIdx}.attributes.data-background-color-palette-name`, '');
      change(`${focusIdx}.attributes.data-background-color-palette-color-name`, '');
      change(`${focusIdx}.attributes.data-background-color-palette-color-code`, '');
      setAllowClearForBackgroundColor(false);
    }
  }, [palettes, dataBackgroundColorPaletteTree.input.value]);

  useEffect(() => {
    if (!dataBackgroundColorPaletteTree.input.value) {
      setDefaultBackgroundColor(backgroundColor.input.value);
    }
  }, [dataBackgroundColorPaletteTree.input.value, backgroundColor.input.value]);

  useEffect(() => {
    if (
      backgroundColor.input.value &&
      dataBackgroundColorPaletteColorCode.input.value &&
      backgroundColor.input.value !== dataBackgroundColorPaletteColorCode.input.value
    ) {
      change(`${focusIdx}.attributes.data-background-color-palette-tree`, '');
      change(`${focusIdx}.attributes.data-background-color-palette-name`, '');
      change(`${focusIdx}.attributes.data-background-color-palette-color-name`, '');
      change(`${focusIdx}.attributes.data-background-color-palette-color-code`, '');
      setAllowClearForBackgroundColor(false);
    }
  }, [dataBackgroundColorPaletteColorCode.input.value, backgroundColor.input.value]);

  // Return:
  return (
    <AttributesPanelWrapper
      extra={(
        <Tooltip content={String('Html mode')}>
          <Button
            onClick={() => setVisible(true)}
            icon={<IconFont iconName='icon-html' />}
          />
        </Tooltip>
      )}
    >
      <CollapseWrapper defaultActiveKey={['-1', '0', '1', '2']}>
        <Collapse.Item name='-1' header={String('Settings')}>
          {/* @ts-ignore */}
          <Stack vertical spacing='tight'>
            <TextField
              label={(
                <Space>
                  <span>{String('ID')}</span>
                </Space>
              )}
              name={`${focusIdx}.attributes.data-id`}
              validate={value => isIDValid(focusIdx, value)}
              style={{
                paddingBottom: '1rem',
              }}
            />
          </Stack>
        </Collapse.Item>
        <Collapse.Item
          name='0'
          header={String('Dimension')}
        >
          <Space direction='vertical'>
            <Height />
            <Padding showResetAll />
          </Space>
        </Collapse.Item>
        <Collapse.Item
          name='1'
          header={String('Color')}
        >
          <Grid.Row>
            <Grid.Col span={11}>
              <Color
                showThemeColorDropdown
                paletteTree={paletteTree}
                resetToDefaultColor={resetToDefaultColor}
                allowClear={allowClearForColor}
              />
            </Grid.Col>
            <Grid.Col
              offset={1}
              span={11}
            >
              <ContainerBackgroundColor
                title={String('Background color')}
                showThemeColorDropdown
                paletteTree={paletteTree}
                resetToDefaultBackgroundColor={resetToDefaultBackgroundColor}
                allowClear={allowClearForBackgroundColor}
              />
            </Grid.Col>
          </Grid.Row>
        </Collapse.Item>
        <Collapse.Item
          name='2'
          header={String('Typography')}
        >
          <Space direction='vertical'>
            <SelectField
              label={'Typography Style'}
              name={`${focusIdx}.attributes.data-typography`}
              options={typographyList}
              allowClear
              style={{ paddingRight: '5%' }}
            />
            <Grid.Row>
              <Grid.Col span={11}>
                <FontFamily disabled={!!selectedTypography} />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <FontSize disabled={!!selectedTypography} />
              </Grid.Col>
            </Grid.Row>

            <Grid.Row>
              <Grid.Col span={11}>
                <LineHeight />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <LetterSpacing />
              </Grid.Col>
            </Grid.Row>

            <Grid.Row>
              <Grid.Col span={11}>
                <TextDecoration />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <FontWeight disabled={!!selectedTypography} />
              </Grid.Col>
            </Grid.Row>

            <Align />

            <FontStyle />

            <Grid.Row>
              <Grid.Col span={11} />
              <Grid.Col
                offset={1}
                span={11}
              />
            </Grid.Row>
          </Space>
        </Collapse.Item>
        <Collapse.Item
          name='4'
          header={String('Extra')}
        >
          <Grid.Col span={24}>
            <ClassName />
          </Grid.Col>
        </Collapse.Item>
      </CollapseWrapper>
      <HtmlEditor
        visible={visible}
        setVisible={setVisible}
      />
    </AttributesPanelWrapper>
  );
}
