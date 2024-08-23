import { useField, useForm } from 'react-final-form';
import React, { useEffect, useRef, useState } from 'react';
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
import { getTemplateTheme, getUsedTemplateTheme, Palette, setUsedTemplateTheme, StaticText, Typography, UsedPaletteColor } from 'template-theme-manager';
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

  // Ref:
  const themeSettingTypography = useRef<Typography | null>(null);
  const themeSettingStaticText = useRef<StaticText | null>(null);
  const themeSettingTextColorPaletteColor = useRef<UsedPaletteColor | null>(null);
  const themeSettingBackgroundColorPaletteColor = useRef<UsedPaletteColor | null>(null);

  // For Typography:
  const fontFamily = useField(`${focusIdx}.attributes.font-family`);
  const fontSize = useField(`${focusIdx}.attributes.font-size`);
  const fontWeight = useField(`${focusIdx}.attributes.font-weight`);
  const dataTypography = useField(`${focusIdx}.attributes.data-typography`);

  // For Text Color:
  const dataColorPaletteName = useField(`${focusIdx}.attributes.data-color-palette-name`);
  const dataColorPaletteTree = useField(`${focusIdx}.attributes.data-color-palette-tree`);
  const dataColorPaletteColorName = useField(`${focusIdx}.attributes.data-color-palette-color-name`);
  const color = useField(`${focusIdx}.attributes.color`);
  const dataColorPaletteColorCode = useField(`${focusIdx}.attributes.data-color-palette-color-code`);

  // For Background Color:
  const dataBackgroundColorPaletteName = useField(`${focusIdx}.attributes.data-background-color-palette-name`);
  const dataBackgroundColorPaletteTree = useField(`${focusIdx}.attributes.data-background-color-palette-tree`);
  const dataBackgroundColorPaletteColorName = useField(`${focusIdx}.attributes.data-background-color-palette-color-name`);
  const backgroundColor = useField(`${focusIdx}.attributes.container-background-color`);
  const dataBackgroundColorPaletteColorCode = useField(`${focusIdx}.attributes.data-background-color-palette-color-code`);

  // For Static Text:
  const dataStaticText = useField(`${focusIdx}.attributes.data-static-text`);
  const textContent = useField(`${focusIdx}.data.value.content`);

  // Custom Fonts:
  const customFonts = getTemplateTheme().customFonts ?? [];

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

  // Typography:
  useEffect(() => {
    if (dataTypography.input.value === '') {
      const _previousThemeSettingTypography = themeSettingTypography.current;
      if (_previousThemeSettingTypography === null) {
        // Since nothing was set before, nothing needs to be changed for usedTemplate.
        themeSettingTypography.current = null;
      } else {
        // An typography was indeed set before, so we remove the focusIdx from usedIn, and remove if usedIn.length === 0
        setUsedTemplateTheme(_usedTemplateTheme => {
          const _typography = _usedTemplateTheme.typography;
          const typography = _typography.find(_typography => _typography.name === _previousThemeSettingTypography.name);

          if (typography) {
            // Typography has already been used somewhere in the template.
            const usedIn = typography.usedIn;

            if (usedIn.length === 1) {
              // Implying typography is only being used once across the template, so we can delete this entry.
              return {
                ..._usedTemplateTheme,
                typography: _typography.filter(_typography => _typography.name !== typography.name)
              };
            } else if (usedIn.length > 1) {
              // Impling typography is being used elsewhere, so we just remove the focusIdx from usedIn.
              return {
                ..._usedTemplateTheme,
                typography: _typography.map(_typography => {
                  if (_typography.name !== typography.name) return _typography;
                  else return {
                    ..._typography,
                    usedIn: _typography.usedIn.filter(_usedInIdx => _usedInIdx !== focusIdx),
                  };
                })
              };
            } else return _usedTemplateTheme;
          } else return _usedTemplateTheme;
        });

        themeSettingTypography.current = null;
      }
    } else {
      const _previousThemeSettingTypography = themeSettingTypography.current;
      const typographyBeingUsed = getUsedTemplateTheme().typography.find(_typography => _typography.name === dataTypography.input.value) ?? null;

      if (_previousThemeSettingTypography === null) {
        // No typography was set before, so no other typography where we need to remove the focusIdx from usedIn.
        setUsedTemplateTheme(_usedTemplateTheme => {
          const _typography = _usedTemplateTheme.typography;
          const typography = _typography.find(_typography => _typography.name === dataTypography.input.value);

          if (typography) {
            // The typography exists before in usedTemplateTheme, so add focusIdx to usedIn.
            const usedIn = typography.usedIn;

            return {
              ..._usedTemplateTheme,
              typography: _typography.map(_typography => {
                if (_typography.name !== typography.name) return _typography;
                else return {
                  ..._typography,
                  usedIn: [...new Set([...usedIn, focusIdx])],
                };
              })
            };
          } else {
            // The typography does not exist, create it.
            const typographyToAdd = getTemplateTheme().typography.find(_typography => _typography.name === dataTypography.input.value);

            if (!typographyToAdd) return _usedTemplateTheme;
            else return {
              ..._usedTemplateTheme,
              typography: [
                ..._usedTemplateTheme.typography,
                {
                  ...typographyToAdd,
                  usedIn: [focusIdx],
                }
              ]
            };
          }
        });

        themeSettingTypography.current = typographyBeingUsed;
      } else {
        // A typography was set indeed set before, so we remove the focusIdx from its usedIn as well as adding focusIdx to the usedIn of the typography selected.
        setUsedTemplateTheme(_usedTemplateTheme => {
          const _typography = _usedTemplateTheme.typography;
          const typography = _typography.find(_typography => _typography.name === dataTypography.input.value);
          const previousTypography = _typography.find(_typography => _typography.name === _previousThemeSettingTypography.name);

          if (typography) {
            // The typography exists before in usedTemplateTheme, so bump it up.
            const usedIn = typography.usedIn;

            return {
              ..._usedTemplateTheme,
              typography: _typography
                .map(_typography => {
                  if (_typography.name === typography.name) {
                    return {
                      ..._typography,
                      usedIn: [...new Set([...usedIn, focusIdx])],
                    };
                  } else if (_typography.name === previousTypography?.name) {
                    return {
                      ..._typography,
                      usedIn: _typography.usedIn.filter(_usedInIdx => _usedInIdx !== focusIdx),
                    };
                  } else return _typography;
                })
                .filter(_typography => (_typography.usedIn.length ?? 0) > 0)
            };
          } else {
            // The typography does not exist, create it.
            const typographyToAdd = getTemplateTheme().typography.find(_typography => _typography.name === dataTypography.input.value);

            if (!typographyToAdd) return _usedTemplateTheme;
            else return {
              ..._usedTemplateTheme,
              typography: [
                ..._usedTemplateTheme.typography,
                {
                  ...typographyToAdd,
                  usedIn: [focusIdx],
                }
              ].map(_typography => {
                if (_typography.name === previousTypography?.name) {
                  return {
                    ..._typography,
                    usedIn: _typography.usedIn.filter(_usedInIdx => _usedInIdx !== focusIdx),
                  };
                } else return _typography;
              })
                .filter(_typography => (_typography.usedIn.length ?? 0) > 0)
            };
          }
        });

        themeSettingTypography.current = typographyBeingUsed;
      }
    }
  }, [themeSettingTypography.current, dataTypography, focusIdx]);

  // Static Text:
  useEffect(() => {
    if (dataStaticText.input.value === '') {
      const _previousThemeSettingStaticText = themeSettingStaticText.current;
      if (_previousThemeSettingStaticText === null) {
        // Since nothing was set before, nothing needs to be changed for usedTemplate.
        themeSettingStaticText.current = null;
      } else {
        // An staticText was indeed set before, so we remove the focusIdx from usedIn, and remove if usedIn.length === 0
        setUsedTemplateTheme(_usedTemplateTheme => {
          const _staticText = _usedTemplateTheme.staticText;
          const staticText = _staticText.find(_staticText => _staticText.name === _previousThemeSettingStaticText.name);

          if (staticText) {
            // StaticText has already been used somewhere in the template.
            const usedIn = staticText.usedIn;

            if (usedIn.length === 1) {
              // Implying staticText is only being used once across the template, so we can delete this entry.
              return {
                ..._usedTemplateTheme,
                staticText: _staticText.filter(_staticText => _staticText.name !== staticText.name)
              };
            } else if (usedIn.length > 1) {
              // Impling staticText is being used elsewhere, so we just remove the focusIdx from usedIn.
              return {
                ..._usedTemplateTheme,
                staticText: _staticText.map(_staticText => {
                  if (_staticText.name !== staticText.name) return _staticText;
                  else return {
                    ..._staticText,
                    usedIn: _staticText.usedIn.filter(_usedInIdx => _usedInIdx !== focusIdx),
                  };
                })
              };
            } else return _usedTemplateTheme;
          } else return _usedTemplateTheme;
        });

        themeSettingStaticText.current = null;
      }
    } else {
      const _previousThemeSettingStaticText = themeSettingStaticText.current;
      const staticTextBeingUsed = getUsedTemplateTheme().staticText.find(_staticText => _staticText.name === dataStaticText.input.value) ?? null;

      if (_previousThemeSettingStaticText === null) {
        // No staticText was set before, so no other staticText where we need to remove the focusIdx from usedIn.
        setUsedTemplateTheme(_usedTemplateTheme => {
          const _staticText = _usedTemplateTheme.staticText;
          const staticText = _staticText.find(_staticText => _staticText.name === dataStaticText.input.value);

          if (staticText) {
            // The staticText exists before in usedTemplateTheme, so add focusIdx to usedIn.
            const usedIn = staticText.usedIn;

            return {
              ..._usedTemplateTheme,
              staticText: _staticText.map(_staticText => {
                if (_staticText.name !== staticText.name) return _staticText;
                else return {
                  ..._staticText,
                  usedIn: [...new Set([...usedIn, focusIdx])],
                };
              })
            };
          } else {
            // The staticText does not exist, create it.
            const staticTextToAdd = getTemplateTheme().staticText.find(_staticText => _staticText.name === dataStaticText.input.value);

            if (!staticTextToAdd) return _usedTemplateTheme;
            else return {
              ..._usedTemplateTheme,
              staticText: [
                ..._usedTemplateTheme.staticText,
                {
                  ...staticTextToAdd,
                  usedIn: [focusIdx],
                }
              ]
            };
          }
        });

        themeSettingStaticText.current = staticTextBeingUsed;
      } else {
        // An staticText was set indeed set before, so we remove the focusIdx from its usedIn as well as adding focusIdx to the usedIn of the staticText selected.
        setUsedTemplateTheme(_usedTemplateTheme => {
          const _staticText = _usedTemplateTheme.staticText;
          const staticText = _staticText.find(_staticText => _staticText.name === dataStaticText.input.value);
          const previousStaticText = _staticText.find(_staticText => _staticText.name === _previousThemeSettingStaticText.name);

          if (staticText) {
            // The staticText exists before in usedTemplateTheme, so bump it up.
            const usedIn = staticText.usedIn;

            return {
              ..._usedTemplateTheme,
              staticText: _staticText
                .map(_staticText => {
                  if (_staticText.name === staticText.name) {
                    return {
                      ..._staticText,
                      usedIn: [...new Set([...usedIn, focusIdx])],
                    };
                  } else if (_staticText.name === previousStaticText?.name) {
                    return {
                      ..._staticText,
                      usedIn: _staticText.usedIn.filter(_usedInIdx => _usedInIdx !== focusIdx),
                    };
                  } else return _staticText;
                })
                .filter(_staticText => (_staticText.usedIn.length ?? 0) > 0)
            };
          } else {
            // The staticText does not exist, create it.
            const staticTextToAdd = getTemplateTheme().staticText.find(_staticText => _staticText.name === dataStaticText.input.value);

            if (!staticTextToAdd) return _usedTemplateTheme;
            else return {
              ..._usedTemplateTheme,
              staticText: [
                ..._usedTemplateTheme.staticText,
                {
                  ...staticTextToAdd,
                  usedIn: [focusIdx],
                }
              ].map(_staticText => {
                if (_staticText.name === previousStaticText?.name) {
                  return {
                    ..._staticText,
                    usedIn: _staticText.usedIn.filter(_usedInIdx => _usedInIdx !== focusIdx),
                  };
                } else return _staticText;
              })
                .filter(_staticText => (_staticText.usedIn.length ?? 0) > 0)
            };
          }
        });

        themeSettingStaticText.current = staticTextBeingUsed;
      }
    }
  }, [themeSettingStaticText.current, dataStaticText, focusIdx]);

  // Palettes Text Color:
  useEffect(() => {
    if (dataColorPaletteName.input.value === '') {
      const _previousthemeSettingBackgroundColorPaletteColor = themeSettingBackgroundColorPaletteColor.current;
      if (_previousthemeSettingBackgroundColorPaletteColor === null) {
        // Since nothing was set before, nothing needs to be changed for usedTemplate.
        themeSettingBackgroundColorPaletteColor.current = null;
      } else {
        // A palette color was indeed set before, so we remove the focusIdx from usedIn, and remove if usedIn.length === 0
        setUsedTemplateTheme(_usedTemplateTheme => {
          const _paletteColors = _usedTemplateTheme.paletteColors;
          const paletteColor = _paletteColors.textColor.find(_paletteColor => _paletteColor.paletteColor === _previousthemeSettingBackgroundColorPaletteColor.paletteColor);

          if (paletteColor) {
            // Image has already been used somewhere in the template.
            const usedIn = paletteColor.usedIn;

            if (usedIn.length === 1) {
              // Implying paletteColor is only being used once across the template, so we can delete this entry.
              return {
                ..._usedTemplateTheme,
                paletteColors: {
                  ..._usedTemplateTheme.paletteColors,
                  textColor: _paletteColors.textColor.filter(_paletteColor => _paletteColor.paletteColor !== paletteColor.paletteColor)
                }
              };
            } else if (usedIn.length > 1) {
              // Impling paletteColor is being used elsewhere, so we just remove the focusIdx from usedIn.
              return {
                ..._usedTemplateTheme,
                paletteColors: {
                  ..._usedTemplateTheme.paletteColors,
                  textColor: _paletteColors.textColor.map(_paletteColor => {
                    if (_paletteColor !== paletteColor) return _paletteColor;
                    else return {
                      ..._paletteColor,
                      usedIn: _paletteColor.usedIn.filter(_usedInIdx => _usedInIdx !== focusIdx),
                    };
                  })
                }
              };
            } else return _usedTemplateTheme;
          } else return _usedTemplateTheme;
        });

        themeSettingBackgroundColorPaletteColor.current = null;
      }
    } else {
      const normalizedPaletteName = (dataColorPaletteName.input.value as string).toLocaleLowerCase().split(' ').join('-');
      const normalizedColorName = (dataColorPaletteColorName.input.value as string).toLocaleLowerCase().split(' ').join('-');
      const paletteColorInUse = `${normalizedPaletteName}.${normalizedColorName}`;
      const _previousthemeSettingBackgroundColorPaletteColor = themeSettingBackgroundColorPaletteColor.current;
      const paletteColorsBeingUsed = getUsedTemplateTheme().paletteColors.textColor.find(_paletteColor => _paletteColor.paletteColor === paletteColorInUse) ?? null;

      if (_previousthemeSettingBackgroundColorPaletteColor === null) {
        // No paletteColor was set before, so no other paletteColor where we need to remove the focusIdx from usedIn.
        setUsedTemplateTheme(_usedTemplateTheme => {
          const _paletteColors = _usedTemplateTheme.paletteColors;
          const paletteColor = _paletteColors.textColor.find(_paletteColor => _paletteColor.paletteColor === paletteColorInUse);

          if (paletteColor) {
            // The paletteColor exists before in usedTemplateTheme, so add focusIdx to usedIn.
            const usedIn = paletteColor.usedIn;

            return {
              ..._usedTemplateTheme,
              paletteColors: {
                ..._usedTemplateTheme.paletteColors,
                textColor: _paletteColors.textColor.map(_paletteColor => {
                  if (_paletteColor.paletteColor !== paletteColor.paletteColor) return _paletteColor;
                  else return {
                    ..._paletteColor,
                    usedIn: [...new Set([...usedIn, focusIdx])],
                  };
                })
              }
            };
          } else {
            // The paletteColor does not exist, create it.
            const doesPaletteColorExist = !!getTemplateTheme().palettes
              .find(palette => palette.name === dataColorPaletteName.input.value)?.colors
              .find(color => color.name === dataColorPaletteColorName.input.value);

            if (!doesPaletteColorExist) return _usedTemplateTheme;
            else return {
              ..._usedTemplateTheme,
              paletteColors: {
                ..._usedTemplateTheme.paletteColors,
                textColor: [
                  ..._usedTemplateTheme.paletteColors.textColor,
                  {
                    paletteColor: paletteColorInUse,
                    usedIn: [focusIdx],
                  }
                ]
              }
            };
          }
        });

        themeSettingBackgroundColorPaletteColor.current = paletteColorsBeingUsed;
      } else {
        // An paletteColor was set indeed set before, so we remove the focusIdx from its usedIn as well as adding focusIdx to the usedIn of the paletteColor selected.
        setUsedTemplateTheme(_usedTemplateTheme => {
          const _paletteColors = _usedTemplateTheme.paletteColors;
          const paletteColor = _paletteColors.textColor.find(_paletteColor => _paletteColor.paletteColor === paletteColorInUse);
          const previousPaletteColor = _paletteColors.textColor.find(_paletteColor => _paletteColor.paletteColor === _previousthemeSettingBackgroundColorPaletteColor.paletteColor);

          if (paletteColor) {
            // The paletteColor exists before in usedTemplateTheme, so bump it up.
            const usedIn = paletteColor.usedIn;

            return {
              ..._usedTemplateTheme,
              paletteColors: {
                ..._usedTemplateTheme.paletteColors,
                textColor: _usedTemplateTheme.paletteColors.textColor
                  .map(_paletteColor => {
                    if (_paletteColor.paletteColor === paletteColor.paletteColor) {
                      return {
                        ..._paletteColor,
                        usedIn: [...new Set([...usedIn, focusIdx])],
                      };
                    } else if (_paletteColor.paletteColor === previousPaletteColor?.paletteColor) {
                      return {
                        ..._paletteColor,
                        usedIn: _paletteColor.usedIn.filter(_usedInIdx => _usedInIdx !== focusIdx),
                      };
                    } else return _paletteColor;
                  })
                  .filter(_paletteColor => (_paletteColor.usedIn.length ?? 0) > 0)
              }
            };
          } else {
            // The paletteColor does not exist, create it.
            const doesPaletteColorExist = !!getTemplateTheme().palettes
              .find(palette => palette.name === dataColorPaletteName.input.value)?.colors
              .find(color => color.name === dataColorPaletteColorName.input.value);

            if (!doesPaletteColorExist) return _usedTemplateTheme;
            else return {
              ..._usedTemplateTheme,
              paletteColors: {
                ..._usedTemplateTheme.paletteColors,
                textColor: [
                  ..._usedTemplateTheme.paletteColors.textColor,
                  {
                    paletteColor: paletteColorInUse,
                    usedIn: [focusIdx],
                  }
                ].map(_paletteColor => {
                  if (_paletteColor.paletteColor === previousPaletteColor?.paletteColor) {
                    return {
                      ..._paletteColor,
                      usedIn: _paletteColor.usedIn.filter(_usedInIdx => _usedInIdx !== focusIdx),
                    };
                  } else return _paletteColor;
                })
                  .filter(_paletteColor => (_paletteColor.usedIn.length ?? 0) > 0)
              }
            };
          }
        });

        themeSettingBackgroundColorPaletteColor.current = paletteColorsBeingUsed;
      }
    }
  }, [
    themeSettingBackgroundColorPaletteColor.current,
    dataColorPaletteName,
    dataColorPaletteColorName,
    focusIdx,
  ]);

  // Palettes Text Background Color:
  useEffect(() => {
    if (dataBackgroundColorPaletteName.input.value === '') {
      const _previousthemeSettingTextColorPaletteColor = themeSettingTextColorPaletteColor.current;
      if (_previousthemeSettingTextColorPaletteColor === null) {
        // Since nothing was set before, nothing needs to be changed for usedTemplate.
        themeSettingTextColorPaletteColor.current = null;
      } else {
        // A palette color was indeed set before, so we remove the focusIdx from usedIn, and remove if usedIn.length === 0
        setUsedTemplateTheme(_usedTemplateTheme => {
          const _paletteColors = _usedTemplateTheme.paletteColors;
          const paletteColor = _paletteColors.backgroundColor.find(_paletteColor => _paletteColor.paletteColor === _previousthemeSettingTextColorPaletteColor.paletteColor);

          if (paletteColor) {
            // Image has already been used somewhere in the template.
            const usedIn = paletteColor.usedIn;

            if (usedIn.length === 1) {
              // Implying paletteColor is only being used once across the template, so we can delete this entry.
              return {
                ..._usedTemplateTheme,
                paletteColors: {
                  ..._usedTemplateTheme.paletteColors,
                  backgroundColor: _paletteColors.backgroundColor.filter(_paletteColor => _paletteColor.paletteColor !== paletteColor.paletteColor)
                }
              };
            } else if (usedIn.length > 1) {
              // Impling paletteColor is being used elsewhere, so we just remove the focusIdx from usedIn.
              return {
                ..._usedTemplateTheme,
                paletteColors: {
                  ..._usedTemplateTheme.paletteColors,
                  backgroundColor: _paletteColors.backgroundColor.map(_paletteColor => {
                    if (_paletteColor !== paletteColor) return _paletteColor;
                    else return {
                      ..._paletteColor,
                      usedIn: _paletteColor.usedIn.filter(_usedInIdx => _usedInIdx !== focusIdx),
                    };
                  })
                }
              };
            } else return _usedTemplateTheme;
          } else return _usedTemplateTheme;
        });

        themeSettingTextColorPaletteColor.current = null;
      }
    } else {
      const normalizedPaletteName = (dataBackgroundColorPaletteName.input.value as string).toLocaleLowerCase().split(' ').join('-');
      const normalizedColorName = (dataBackgroundColorPaletteColorName.input.value as string).toLocaleLowerCase().split(' ').join('-');
      const paletteColorInUse = `${normalizedPaletteName}.${normalizedColorName}`;
      const _previousthemeSettingTextColorPaletteColor = themeSettingTextColorPaletteColor.current;
      const paletteColorsBeingUsed = getUsedTemplateTheme().paletteColors.backgroundColor.find(_paletteColor => _paletteColor.paletteColor === paletteColorInUse) ?? null;

      if (_previousthemeSettingTextColorPaletteColor === null) {
        // No paletteColor was set before, so no other paletteColor where we need to remove the focusIdx from usedIn.
        setUsedTemplateTheme(_usedTemplateTheme => {
          const _paletteColors = _usedTemplateTheme.paletteColors;
          const paletteColor = _paletteColors.backgroundColor.find(_paletteColor => _paletteColor.paletteColor === paletteColorInUse);

          if (paletteColor) {
            // The paletteColor exists before in usedTemplateTheme, so add focusIdx to usedIn.
            const usedIn = paletteColor.usedIn;

            return {
              ..._usedTemplateTheme,
              paletteColors: {
                ..._usedTemplateTheme.paletteColors,
                backgroundColor: _paletteColors.backgroundColor.map(_paletteColor => {
                  if (_paletteColor.paletteColor !== paletteColor.paletteColor) return _paletteColor;
                  else return {
                    ..._paletteColor,
                    usedIn: [...new Set([...usedIn, focusIdx])],
                  };
                })
              }
            };
          } else {
            // The paletteColor does not exist, create it.
            const doesPaletteColorExist = !!getTemplateTheme().palettes
              .find(palette => palette.name === dataBackgroundColorPaletteName.input.value)?.colors
              .find(color => color.name === dataBackgroundColorPaletteColorName.input.value);

            if (!doesPaletteColorExist) return _usedTemplateTheme;
            else return {
              ..._usedTemplateTheme,
              paletteColors: {
                ..._usedTemplateTheme.paletteColors,
                backgroundColor: [
                  ..._usedTemplateTheme.paletteColors.backgroundColor,
                  {
                    paletteColor: paletteColorInUse,
                    usedIn: [focusIdx],
                  }
                ]
              }
            };
          }
        });

        themeSettingTextColorPaletteColor.current = paletteColorsBeingUsed;
      } else {
        // An paletteColor was set indeed set before, so we remove the focusIdx from its usedIn as well as adding focusIdx to the usedIn of the paletteColor selected.
        setUsedTemplateTheme(_usedTemplateTheme => {
          const _paletteColors = _usedTemplateTheme.paletteColors;
          const paletteColor = _paletteColors.backgroundColor.find(_paletteColor => _paletteColor.paletteColor === paletteColorInUse);
          const previousPaletteColor = _paletteColors.backgroundColor.find(_paletteColor => _paletteColor.paletteColor === _previousthemeSettingTextColorPaletteColor.paletteColor);

          if (paletteColor) {
            // The paletteColor exists before in usedTemplateTheme, so bump it up.
            const usedIn = paletteColor.usedIn;

            return {
              ..._usedTemplateTheme,
              paletteColors: {
                ..._usedTemplateTheme.paletteColors,
                backgroundColor: _usedTemplateTheme.paletteColors.backgroundColor
                  .map(_paletteColor => {
                    if (_paletteColor.paletteColor === paletteColor.paletteColor) {
                      return {
                        ..._paletteColor,
                        usedIn: [...new Set([...usedIn, focusIdx])],
                      };
                    } else if (_paletteColor.paletteColor === previousPaletteColor?.paletteColor) {
                      return {
                        ..._paletteColor,
                        usedIn: _paletteColor.usedIn.filter(_usedInIdx => _usedInIdx !== focusIdx),
                      };
                    } else return _paletteColor;
                  })
                  .filter(_paletteColor => (_paletteColor.usedIn.length ?? 0) > 0)
              }
            };
          } else {
            // The paletteColor does not exist, create it.
            const doesPaletteColorExist = !!getTemplateTheme().palettes
              .find(palette => palette.name === dataBackgroundColorPaletteName.input.value)?.colors
              .find(color => color.name === dataBackgroundColorPaletteColorName.input.value);

            if (!doesPaletteColorExist) return _usedTemplateTheme;
            else return {
              ..._usedTemplateTheme,
              paletteColors: {
                ..._usedTemplateTheme.paletteColors,
                backgroundColor: [
                  ..._usedTemplateTheme.paletteColors.backgroundColor,
                  {
                    paletteColor: paletteColorInUse,
                    usedIn: [focusIdx],
                  }
                ].map(_paletteColor => {
                  if (_paletteColor.paletteColor === previousPaletteColor?.paletteColor) {
                    return {
                      ..._paletteColor,
                      usedIn: _paletteColor.usedIn.filter(_usedInIdx => _usedInIdx !== focusIdx),
                    };
                  } else return _paletteColor;
                })
                  .filter(_paletteColor => (_paletteColor.usedIn.length ?? 0) > 0)
              }
            };
          }
        });

        themeSettingTextColorPaletteColor.current = paletteColorsBeingUsed;
      }
    }
  }, [
    themeSettingTextColorPaletteColor.current,
    dataBackgroundColorPaletteName,
    dataBackgroundColorPaletteColorName,
    focusIdx,
  ]);

  // TODO: Custom Fonts:

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
