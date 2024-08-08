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
import { IconFont, Stack, getShadowRoot, useFocusIdx } from 'easy-email-editor';
import { HtmlEditor } from '../../UI/HtmlEditor';
import { ClassName } from '../../attributes/ClassName';
import { CollapseWrapper } from '../../attributes/CollapseWrapper';
import { SelectField, TextField } from '@extensions/components/Form';
import { validateBlockID } from '@extensions/utils/blockIDManager';
import { getTemplateTheme, Palette, StaticText, Typography } from 'template-theme-manager';
import { TreeSelectDataType } from '@arco-design/web-react/es/TreeSelect/interface';
import ColorController from 'color';
import { useExtensionProps } from '@extensions/components/Providers/ExtensionProvider';
import useBlockID from '@extensions/AttributePanel/hooks/useBlockID';
import { getConditionalMappingConditions } from 'conditional-mapping-manager';

export function Text() {
  // Constants:
  const { change } = useForm();
  const { focusIdx } = useFocusIdx();
  const { isConditionalMapping = false } = useExtensionProps();
  const { lastValidDataID, onBlurCapture } = useBlockID();

  // For Typography:
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

  // For Static Text:
  const dataStaticText = useField(`${focusIdx}.attributes.data-static-text`);
  const textContent = useField(`${focusIdx}.data.value.content`);

  // State:
  const [visible, setVisible] = useState(false);
  const [typography, setTypography] = useState<Typography[]>([]);
  const [typographyList, setTypographyList] = useState<{ label: string; value: string; }[]>([]);
  const [selectedTypography, setSelectedTypography] = useState<Typography>();
  const [defaultTypographicStyling, setDefaultTypographicStyling] = useState<Typography>();
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [paletteTree, setPaletteTree] = useState<TreeSelectDataType[]>([]);
  const [allowClearForColor, setAllowClearForColor] = useState(false);
  const [allowClearForBackgroundColor, setAllowClearForBackgroundColor] = useState(false);
  const [staticText, setStaticText] = useState<StaticText[]>([]);
  const [staticTextTree, setStaticTextTree] = useState<{
    value: string;
    label: React.ReactNode;
  }[]>([]);
  const [disableTypographySelection, setDisableTypographySelection] = useState(false);

  // Functions:
  const resetToDefaultColor = () => {
    change(`${focusIdx}.attributes.color`, '');
    change(`${focusIdx}.attributes.data-color-palette-tree`, '');
  };

  const resetToDefaultBackgroundColor = () => {
    change(`${focusIdx}.attributes.container-background-color`, '');
    change(`${focusIdx}.attributes.data-background-color-palette-tree`, '');
  };

  const setTextNode = (contentEditable: 'true' | 'false', value?: string) => {
    const container = document.getElementById('VisualEditorEditMode');
    const shadowRoot = container?.shadowRoot;
    const textNode = shadowRoot?.querySelector(`[data-content_editable-idx="${focusIdx}.data.value.content"]`);
    if (textNode) {
      (textNode as HTMLDivElement).contentEditable = contentEditable;
      if (value) (textNode as HTMLDivElement).innerText = value;
    }
  };

  // Effects:
  useEffect(() => {
    const _selectedTypography = typography.find(typographyItem => typographyItem.name === dataTypography.input.value);
    setSelectedTypography(_selectedTypography);
    if (_selectedTypography) {
      change(`${focusIdx}.attributes.font-family`, _selectedTypography.fontFamily ? `'${_selectedTypography.fontFamily}'` : '');
      change(`${focusIdx}.attributes.font-size`, _selectedTypography.fontSize ?? '');
      change(`${focusIdx}.attributes.font-weight`, _selectedTypography.fontWeight ?? '');
    } else {
      change(`${focusIdx}.attributes.font-family`, defaultTypographicStyling?.fontFamily ? `'${defaultTypographicStyling?.fontFamily}'` : '');
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

  useEffect(() => {
    const _staticText = getTemplateTheme()?.staticText ?? [];
    setStaticText(_staticText);
    setStaticTextTree(_staticText.map(staticTextUnit => {
      return {
        label: (
          <div style={{ display: 'flex' }}>
            <div style={{ fontWeight: 'bold', paddingRight: '5px' }}>
              {staticTextUnit.name}:
            </div>
            <div style={{ textOverflow: 'ellipsis', wordBreak: 'break-all', overflow: 'hidden' }}>
              {staticTextUnit.text}
            </div>
          </div>
        ),
        value: staticTextUnit.name,
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
      change(`${focusIdx}.attributes.color`, '');
      setAllowClearForColor(false);
    }
  }, [palettes, dataColorPaletteTree.input.value]);

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
      change(`${focusIdx}.attributes.container-background-color`, '');
      setAllowClearForBackgroundColor(false);
    }
  }, [palettes, dataBackgroundColorPaletteTree.input.value]);

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

  // For Static Text:
  useEffect(() => {
    if (dataStaticText.input.value?.trim().length > 0) {
      const staticTextValue = staticText.find(_staticText => _staticText.name === dataStaticText.input.value);
      change(`${focusIdx}.data.value.content`, staticTextValue?.text);
      setTextNode('false', staticTextValue?.text ?? '');
      if (staticTextValue?.typographyName) {
        const _selectedTypography = typography.find(typographyItem => typographyItem.name === staticTextValue.typographyName);
        setSelectedTypography(_selectedTypography);
        if (_selectedTypography) {
          setDisableTypographySelection(true);
          change(`${focusIdx}.attributes.data-typography`, _selectedTypography.name);
          change(`${focusIdx}.attributes.font-family`, _selectedTypography.fontFamily ?? '');
          change(`${focusIdx}.attributes.font-size`, _selectedTypography.fontSize ?? '');
          change(`${focusIdx}.attributes.font-weight`, _selectedTypography.fontWeight ?? '');
        }
      }
    } else {
      setTextNode(isConditionalMapping ? 'false' : 'true');
    }
  }, [
    dataStaticText.input.value,
    textContent.input.value,
    staticText,
    isConditionalMapping,
    typography,
  ]);

  useEffect(() => {
    if (isConditionalMapping) {
      const shadowRoot = getShadowRoot();
      const textNode = shadowRoot?.querySelector(`[data-content_editable-idx="${focusIdx}.data.value.content"]`);
      if (textNode) {
        (textNode as HTMLDivElement).contentEditable = 'false';
      }
    }
  }, [focusIdx, isConditionalMapping]);

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
      <CollapseWrapper defaultActiveKey={['0', '1', '2', '3', '4']}>
        <Collapse.Item name='0' header={String('Settings')}>
          {/* @ts-ignore */}
          <Stack vertical spacing='tight'>
            <TextField
              label={(
                <Space>
                  <span>{String('ID')}</span>
                </Space>
              )}
              name={`${focusIdx}.attributes.data-id`}
              validate={value => {
                const validationMessage = validateBlockID(focusIdx, value);
                if (
                  !validationMessage &&
                  (!value || (value ?? '').length === 0)
                ) {
                  const conditions = getConditionalMappingConditions();
                  const isDataIDUsedInAnyCondition = conditions.findIndex(condition => condition.id === lastValidDataID) !== -1;
                  if (isDataIDUsedInAnyCondition) return 'If ID is left empty, all conditions related to this block will be removed!';
                } else return validationMessage;
              }}
              style={{
                paddingBottom: '1rem',
              }}
              disabled={isConditionalMapping}
              onBlurCapture={onBlurCapture}
            />
          </Stack>
        </Collapse.Item>
        <Collapse.Item name='1' header={String('Dimension')}>
          <Space direction='vertical'>
            <Height />
            <Padding showResetAll />
          </Space>
        </Collapse.Item>
        <Collapse.Item name='2' header={String('Color')}>
          <Space direction='vertical' style={{ paddingBottom: '1rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'end',
                flexDirection: 'row',
                width: '18rem',
              }}
            >
              <Color
                showThemeColorDropdown
                paletteTree={paletteTree}
                resetToDefaultColor={resetToDefaultColor}
                allowClear={allowClearForColor}
              />
              <Button
                onClick={resetToDefaultColor}
                disabled={!color.input.value}
                status='danger'
                style={{
                  marginLeft: '1rem'
                }}
              >
                Reset
              </Button>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'end',
                flexDirection: 'row',
                width: '18rem',
              }}
            >
              <ContainerBackgroundColor
                title={'Background color'}
                showThemeColorDropdown
                paletteTree={paletteTree}
                resetToDefaultBackgroundColor={resetToDefaultBackgroundColor}
                allowClear={allowClearForBackgroundColor}
              />
              <Button
                onClick={resetToDefaultBackgroundColor}
                disabled={!backgroundColor.input.value}
                status='danger'
                style={{
                  marginLeft: '1rem'
                }}
              >
                Reset
              </Button>
            </div>
          </Space>
          {/* <Grid.Row>
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
          </Grid.Row> */}
        </Collapse.Item>
        <Collapse.Item name='3' header={String('Typography')}>
          <Space direction='vertical'>
            <div
              style={{
                display: 'flex',
                alignItems: 'end',
                flexDirection: 'row',
                width: '19rem',
              }}
            >
              <SelectField
                label={'Theme Phrases'}
                name={`${focusIdx}.attributes.data-static-text`}
                options={staticTextTree}
                style={{ width: '72%', paddingRight: '1rem' }}
              />
              <Button
                onClick={() => {
                  change(`${focusIdx}.attributes.data-static-text`, '');
                  change(`${focusIdx}.data.value.content`, '');
                  setDisableTypographySelection(false);
                }}
                disabled={(dataStaticText.input.value?.trim().length ?? 0) === 0}
                status='danger'
              >
                Reset
              </Button>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'end',
                flexDirection: 'row',
                width: '19rem',
              }}
            >
              <SelectField
                label={'Theme Font Presets'}
                name={`${focusIdx}.attributes.data-typography`}
                options={typographyList}
                style={{ width: '72%', paddingRight: '1rem' }}
                disabled={disableTypographySelection}
              />
              <Button
                onClick={() => change(`${focusIdx}.attributes.data-typography`, '')}
                disabled={disableTypographySelection || (dataTypography.input.value?.trim().length ?? 0) === 0}
                status='danger'
              >
                Reset
              </Button>
            </div>
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
        <Collapse.Item name='4' header={String('Extra')}>
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
