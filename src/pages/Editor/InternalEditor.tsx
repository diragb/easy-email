// Packages:
import React, { useEffect, useState } from 'react';
import { useWindowSize } from 'react-use';
import useConversationManager from '@demo/hooks/useConversationManager';
import extractAttributes from '@demo/utils/extractAttributes';
import { getCustomAttributes, getPredefinedAttributes } from 'attribute-manager';
import { useScreenshot } from 'use-react-screenshot';
import { zipObject, get } from 'lodash';
import { isJSONStringValid } from '@demo/utils/isJSONStringValid';
import generateHTML, { unsanitizeHTMLTags } from '@demo/utils/generateHTML';
import mustachifyHTML from '@demo/utils/mustachifyHTML';
import appendGridOrganizerScript from '@demo/utils/appendGridOrganizerScript';
import getGridBlocksInJSON from '@demo/utils/getGridBlocksInJSON';
import stylizeGridColumn from '@demo/utils/stylizeGridColumn';
import { getSafeUsedTemplateTheme, getTemplateTheme, getUsedTemplateTheme, TemplateTheme, UsedTemplateTheme } from 'template-theme-manager';
import {
  ActionOrigin,
  getConditionalMappingState,
  setConditionalMappingIsActive,
} from 'conditional-mapping-manager';
import addConditionalMappingScripts from '@demo/utils/addConditionalMappingScripts';
import addCustomBlockScript from '@demo/utils/addCustomBlockScript';
import { getFocusIdx, setFocusIdx } from 'focus-idx-manager';
import sleep from 'sleep-promise';

// Typescript:
import { AdvancedType, BasicType, IPage } from 'easy-email-core';
import { BlockAttributeConfigurationManager, ExtensionProps } from 'easy-email-extensions';
import { IEmailTemplate } from 'easy-email-editor';

// Components:
import { EmailEditor } from 'easy-email-editor';
import { StandardLayout } from 'easy-email-extensions';
import CustomPagePanel from './components/CustomPanels/CustomPagePanel';
import { Message } from '@arco-design/web-react';
import ConditionalMappingSection from './components/ConditionalMapping';

// Context:
import { CallType } from '@demo/context/ConversationManagerContext';

// Functions:
BlockAttributeConfigurationManager.add({
  [BasicType.PAGE]: CustomPagePanel
});

const InternalEditor = ({ values }: {
  values: IEmailTemplate,
  submit: () => Promise<IEmailTemplate | undefined> | undefined;
  restart: (initialValues?: Partial<IEmailTemplate> | undefined) => void;
}) => {
  // Constants:
  const { width } = useWindowSize();
  const defaultCategories: ExtensionProps['categories'] = [
    {
      label: 'Content',
      active: true,
      blocks: [
        {
          type: AdvancedType.TEXT,
        },
        {
          type: AdvancedType.IMAGE,
          payload: { attributes: { padding: '0px 0px 0px 0px' } },
        },
        {
          type: AdvancedType.BUTTON,
        },
        {
          type: AdvancedType.SOCIAL,
        },
        {
          type: AdvancedType.DIVIDER,
        },
        {
          type: AdvancedType.SPACER,
        },
        {
          type: AdvancedType.HERO,
        },
        {
          type: AdvancedType.WRAPPER,
        },
        {
          type: AdvancedType.GRID,
        },
        {
          type: AdvancedType.SECTION,
        },
        {
          type: AdvancedType.COLUMN,
        },
        {
          type: BasicType.CUSTOM,
        },
      ],
    },
    {
      label: 'Layout',
      active: true,
      displayType: 'column',
      blocks: [
        {
          title: '2 columns',
          payload: [
            ['50%', '50%'],
            ['33%', '67%'],
            ['67%', '33%'],
            ['25%', '75%'],
            ['75%', '25%'],
          ],
        },
        {
          title: '3 columns',
          payload: [
            ['33.33%', '33.33%', '33.33%'],
            ['25%', '25%', '50%'],
            ['50%', '25%', '25%'],
          ],
        },
        {
          title: '4 columns',
          payload: [['25%', '25%', '25%', '25%']],
        },
      ],
    },
  ];
  const {
    registerEventHandlers,
    sendMessageToFlutter,
    enablePublish,
    enableSave,
  } = useConversationManager();
  const [_, takeScreenshot] = useScreenshot();

  // State:
  const [enableFlutterPublish, setEnableFlutterPublish] = useState(false);
  const [enableFlutterSave, setEnableFlutterSave] = useState(false);
  const [conditionalMappingStatus, setConditionalMappingStatus] = useState(false);

  // Functions:
  const extractThemeSettingsFromTemplate = (template: IPage) => {
    const themeSettings = {
      width: template?.attributes?.['width'],
      breakpoint: template?.data?.value?.['breakpoint'],
      fontFamily: template?.data?.value?.['font-family'],
      fontSize: template?.data?.value?.['font-size'],
      lineHeight: template?.data?.value?.['line-height'],
      fontWeight: template?.data?.value?.['font-weight'],
      textColor: template?.data?.value?.['text-color'],
      background: template?.attributes?.['background-color'],
      contentBackground: template?.data?.value?.['content-background-color'],
      userStyle: template?.data?.value?.['user-style'] ?? { content: undefined },
    };
    return themeSettings;
  };

  const doesTemplateContainOnlyEmptyWrapper = (template: IEmailTemplate) => {
    return (
      template.content.children.length === 1 &&
      template.content.children?.[0]?.type === 'advanced_wrapper' &&
      (template.content.children?.[0]?.children?.length ?? 0) === 0 &&
      !template.content.children?.[0]?.attributes['background-url']
    );
  };

  const revertMergeTags = (content: string) => {
    const container = document.createElement('div');
    container.innerHTML = content;
    container.querySelectorAll('.easy-email-merge-tag-badge').forEach((item: any) => {
      item.parentNode?.replaceChild(
        document.createTextNode(`{{${item.value ?? item.textContent}}}`),
        item
      );
    });

    return container.innerHTML;
  };

  // const onlyGetUsedCustomAttributes = (content: any) => {
  //   // It's dirty, because it contains both predefined and custom attributes.
  //   // Essentially, any attribute being used in the template is returned here.
  //   const gridBlocks = getGridBlocksInJSON(content);

  //   let extractedDirtyAttributesArray = extractAttributes(JSON.stringify(content ?? {}));
  //   for (const gridBlock of gridBlocks) {
  //     // NOTE: We are no longer adding the datasource itself as an attribute. Rather, the properties of the datasource are added.
  //     // const dataSource: string[] = [gridBlock?.['attributes']?.['data-source']] ?? [];
  //     extractedDirtyAttributesArray = [
  //       ...extractedDirtyAttributesArray,
  //       ...extractAttributes(JSON.stringify(gridBlock ?? {})),
  //       // ...dataSource,
  //     ];
  //   }

  //   const predefinedAttributesArray = Object.keys(getPredefinedAttributes());
  //   const filteredCustomAttributes = difference(extractedDirtyAttributesArray, predefinedAttributesArray);

  //   // Now, we filter the extracted and filtered custom attributes again,
  //   // based on whether they had been declared in the Page Attributes panel or not.
  //   const declaredCustomAttributesArray = [...new Set(Object.keys(getCustomAttributes()))];
  //   const usedCustomAttributes = filteredCustomAttributes.filter(attribute => declaredCustomAttributesArray.includes(attribute));

  //   return zipObject(usedCustomAttributes, Array(usedCustomAttributes.length).fill(''));
  // };

  const onlyGetUsedAttributes = (content: any) => {
    const gridBlocks = getGridBlocksInJSON(content);
    let extractedAttributesArray = extractAttributes(JSON.stringify(content ?? {}));
    for (const gridBlock of gridBlocks) {
      extractedAttributesArray = [
        ...extractedAttributesArray,
        ...extractAttributes(JSON.stringify(gridBlock ?? {})),
      ];
    }

    // Now, we filter the extracted attributes again,
    // based on whether they had been declared in the Page Attributes panel or not.
    const declaredAttributesArray = [
      ...new Set(Object.keys(getCustomAttributes())),
      ...new Set(Object.keys(getPredefinedAttributes()))
    ];
    const usedAttributes = extractedAttributesArray.filter(attribute => declaredAttributesArray.includes(attribute));

    return zipObject(usedAttributes, Array(usedAttributes.length).fill(''));
  };

  // Effects:
  useEffect(() => {
    registerEventHandlers.onRequestSave(async message => {
      try {
        Message.loading('Loading...');
        sessionStorage.setItem('isExporting', JSON.stringify(true));
        const focusIdx = getFocusIdx();
        setFocusIdx(ActionOrigin.React, '', true);
        await sleep(500);
        const transformedContent = JSON.stringify(values.content, (_key, value) => {
          if (typeof value === 'string') {
            return revertMergeTags(value);
          }
          return value;
        });

        const content = JSON.parse(transformedContent);
        const _usedTemplateTheme = getUsedTemplateTheme();
        const newUsedTemplateTheme = {} as UsedTemplateTheme;

        // Images:
        newUsedTemplateTheme.images = _usedTemplateTheme.images.filter(image => {
          const usedInLength = image.usedIn.filter(_usedIn => !!get({ content }, _usedIn)).length;

          return usedInLength > 0;
        });

        // Static Text:
        newUsedTemplateTheme.staticText = _usedTemplateTheme.staticText.filter(staticText => {
          const usedInLength = staticText.usedIn.filter(_usedIn => !!get({ content }, _usedIn)).length;

          return usedInLength > 0;
        });

        // Typography:
        newUsedTemplateTheme.typography = _usedTemplateTheme.typography.filter(typography => {
          const usedInLength = typography.usedIn.filter(_usedIn => !!get({ content }, _usedIn)).length;

          return usedInLength > 0;
        });

        // Palettes:
        const palettes = getTemplateTheme().palettes;
        newUsedTemplateTheme.paletteColors = _usedTemplateTheme.paletteColors;
        newUsedTemplateTheme.palettes = [];

        _usedTemplateTheme.paletteColors.textColor.filter(paletteColor => {
          const usedInLength = paletteColor.usedIn.filter(_usedIn => !!get({ content }, _usedIn)).length;

          return usedInLength > 0;
        }).forEach(paletteColor => {
          const paletteColorNameComponents = paletteColor.paletteColor.split('.');
          if (paletteColorNameComponents.length === 2) {
            const paletteName = paletteColorNameComponents[0].split('-').map(token => token.charAt(0).toUpperCase() + token.slice(1)).join(' ');
            const colorName = paletteColorNameComponents[1].split('-').map(token => token.charAt(0).toUpperCase() + token.slice(1)).join(' ');

            const palette = palettes.find(_palette => _palette.name === paletteName);
            const color = palette?.colors.find(_color => _color.name === colorName);

            if (palette && color) {
              const isPaletteAlreadyIndexed = !!newUsedTemplateTheme.palettes.find(_palette => _palette.name === paletteName);

              if (isPaletteAlreadyIndexed) {
                const isColorAlreadyIndexed = !!newUsedTemplateTheme.palettes.find(_palette => _palette.name === paletteName)?.colors.find(_color => _color.name === colorName);

                if (!isColorAlreadyIndexed) {
                  newUsedTemplateTheme.palettes = newUsedTemplateTheme.palettes.map(_palette => {
                    if (_palette.name === paletteName) {
                      _palette.colors = [
                        ..._palette.colors,
                        color,
                      ];

                      return _palette;
                    } else return _palette;
                  });
                }
              } else {
                newUsedTemplateTheme.palettes = [
                  ...newUsedTemplateTheme.palettes,
                  {
                    name: palette.name,
                    colors: [color]
                  }
                ];
              }
            }
          }
        });

        _usedTemplateTheme.paletteColors.backgroundColor.filter(paletteColor => {
          const usedInLength = paletteColor.usedIn.filter(_usedIn => !!get({ content }, _usedIn)).length;

          return usedInLength > 0;
        }).forEach(paletteColor => {
          const paletteColorNameComponents = paletteColor.paletteColor.split('.');
          if (paletteColorNameComponents.length === 2) {
            const paletteName = paletteColorNameComponents[0].split('-').map(token => token.charAt(0).toUpperCase() + token.slice(1)).join(' ');
            const colorName = paletteColorNameComponents[1].split('-').map(token => token.charAt(0).toUpperCase() + token.slice(1)).join(' ');

            const palette = palettes.find(_palette => _palette.name === paletteName);
            const color = palette?.colors.find(_color => _color.name === colorName);

            if (palette && color) {
              const isPaletteAlreadyIndexed = !!newUsedTemplateTheme.palettes.find(_palette => _palette.name === paletteName);

              if (isPaletteAlreadyIndexed) {
                const isColorAlreadyIndexed = !!newUsedTemplateTheme.palettes.find(_palette => _palette.name === paletteName)?.colors.find(_color => _color.name === colorName);

                if (!isColorAlreadyIndexed) {
                  newUsedTemplateTheme.palettes = newUsedTemplateTheme.palettes.map(_palette => {
                    if (_palette.name === paletteName) {
                      _palette.colors = [
                        ..._palette.colors,
                        color,
                      ];

                      return _palette;
                    } else return _palette;
                  });
                }
              } else {
                newUsedTemplateTheme.palettes = [
                  ...newUsedTemplateTheme.palettes,
                  {
                    name: palette.name,
                    colors: [color]
                  }
                ];
              }
            }
          }
        });

        // Custom Fonts:
        newUsedTemplateTheme.customFonts = [];

        const customAttributes = onlyGetUsedAttributes(values.content);
        const customAttributesArray = [...new Set(Object.keys(customAttributes))];
        const predefinedAttributesArray = [...new Set(Object.keys(getPredefinedAttributes()))];

        const templateType = sessionStorage.getItem('template-type') ?? 'EMAIL';
        const rawHTML = generateHTML({ ...values, content: JSON.parse(transformedContent) });
        const finalHTML = unsanitizeHTMLTags(
          addCustomBlockScript(
            addConditionalMappingScripts(
              mustachifyHTML(
                stylizeGridColumn(
                  appendGridOrganizerScript(rawHTML)
                )
              )
            )
          )
        );

        const body = document.getElementById('VisualEditorEditMode')?.shadowRoot?.querySelectorAll('body')[0] as HTMLBodyElement | undefined;
        const page = document.getElementById('VisualEditorEditMode')?.shadowRoot?.querySelectorAll('.node-type-page')[0] as HTMLDivElement | undefined;
        const wrapper = (page && page.children.length > 0) ? page.children[0] : undefined;

        let target = wrapper ? wrapper : page ? page : body;

        if (!target) throw new Error();

        const preview = await takeScreenshot(target, {
          allowTaint: false,
          useCORS: true,
          windowWidth: 600,
        });

        setFocusIdx(ActionOrigin.React, focusIdx, true);

        const blockIDMap = isJSONStringValid(sessionStorage.getItem('block-ids') ?? '{}') ? (sessionStorage.getItem('block-ids') ?? '{}') : '{}';
        const blockIDs = Object.values(JSON.parse(blockIDMap) as Record<string, string>);
        const themeSettings = extractThemeSettingsFromTemplate(values.content);
        const templateTheme = getTemplateTheme();
        const conditionalMappingState = getConditionalMappingState();
        const usedCustomBlocks = (window as any).customElementsBeingUsed ? [...((window as any).customElementsBeingUsed as Set<string>)] : [];

        sendMessageToFlutter({
          conversationID: message.conversationID,
          conversationType: message.conversationType,
          callType: CallType.RESPONSE,
          payload: {
            template: {
              type: templateType,
              content: transformedContent,
              themeSettings: {
                ...themeSettings,
                ...newUsedTemplateTheme,
              },
            },
            attributes: {
              predefined: predefinedAttributesArray,
              custom: customAttributesArray,
            },
            blockIDs: {
              map: blockIDMap,
              list: blockIDs,
            },
            preview,
            html: finalHTML,
            conditionalMapping: {
              boolean: conditionalMappingState.conditions,
              javascript: conditionalMappingState.javascript,
              css: conditionalMappingState.css,
            },
            usedCustomBlocks,
          },
        });

        if ((window as any).customElementsBeingUsed) (window as any).customElementsBeingUsed = undefined;

        Message.clear();
        // Message.success('Template saved successfully!');
      } catch (error) {
        sendMessageToFlutter({
          conversationID: message.conversationID,
          conversationType: message.conversationType,
          callType: CallType.ERROR,
          payload: '',
        });
        Message.clear();
        console.error('Encountered an error while trying to save the template', error);
        Message.error((error as Error)?.message ?? 'Could not save template!');
      } finally {
        sessionStorage.setItem('isExporting', JSON.stringify(false));
      }
    });
  }, [values, takeScreenshot]);

  useEffect(() => {
    registerEventHandlers.onConditionalMappingStatus(newStatus => {
      setConditionalMappingStatus(newStatus);
      setConditionalMappingIsActive(ActionOrigin.React, newStatus);
    });
  }, []);

  useEffect(() => {
    const extractedDirtyAttributesArray = extractAttributes(JSON.stringify(values?.content ?? {}));
    const extractedDirtyAttributes = zipObject(extractedDirtyAttributesArray, Array(extractedDirtyAttributesArray.length).fill(''));

    const areMergeTagsBeingUsedInTheTemplate = Object.values(extractedDirtyAttributes).length > 0;
    if (areMergeTagsBeingUsedInTheTemplate && enableFlutterPublish) {
      enablePublish(false);
      setEnableFlutterPublish(false);
    } else if (!areMergeTagsBeingUsedInTheTemplate && !enableFlutterPublish) {
      enablePublish(true);
      setEnableFlutterPublish(true);
    }
  }, [values, enableFlutterPublish]);

  useEffect(() => {
    const templateWithEmptyWrapper = doesTemplateContainOnlyEmptyWrapper(values);
    const isTemplateEmpty = ((values?.content?.children?.length ?? 0) === 0) || templateWithEmptyWrapper;
    if (!isTemplateEmpty && !enableFlutterSave) {
      enableSave(true);
      setEnableFlutterSave(true);
    } else if (isTemplateEmpty && enableFlutterSave) {
      enableSave(false);
      setEnableFlutterSave(false);
    }
  }, [values, enableFlutterSave]);

  // Return:
  return (
    <>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'row', width: '100vw', height: '100vh' }}>
        {/* @ts-ignore */}
        <StandardLayout
          compact={!(width < 1400)}
          categories={defaultCategories}
          isConditionalMapping={conditionalMappingStatus}
        >
          <EmailEditor />
        </StandardLayout>
        {
          conditionalMappingStatus && (
            <ConditionalMappingSection />
          )
        }
      </div>
    </>
  );
};

// Exports:
export default InternalEditor;
