// Packages:
import React, { useEffect, useRef, useState } from 'react';
import { useWindowSize } from 'react-use';
import useConversationManager from '@demo/hooks/useConversationManager';
import extractAttributes from '@demo/utils/extractAttributes';
import { getCustomAttributes, getPredefinedAttributes } from 'attribute-manager';
import { useScreenshot } from 'use-react-screenshot';
import { difference, zipObject } from 'lodash';
import { isJSONStringValid } from '@demo/utils/isJSONStringValid';
import generateHTML, { unsanitizeHTMLTags } from '@demo/utils/generateHTML';
import mustachifyHTML from '@demo/utils/mustachifyHTML';
import appendGridOrganizerScript from '@demo/utils/appendGridOrganizerScript';
import getGridBlocksInJSON from '@demo/utils/getGridBlocksInJSON';
import stylizeGridColumn from '@demo/utils/stylizeGridColumn';

// Typescript:
import { AdvancedType, BasicType, IPage } from 'easy-email-core';
import { BlockAttributeConfigurationManager, ExtensionProps } from 'easy-email-extensions';
import { IEmailTemplate, useEditorProps } from 'easy-email-editor';

// Components:
import { EmailEditor } from 'easy-email-editor';
import { StandardLayout } from 'easy-email-extensions';
import CustomPagePanel from './components/CustomPanels/CustomPagePanel';
import { Message } from '@arco-design/web-react';

// Context:
import { CallType } from '@demo/context/ConversationManagerContext';
import { getTemplateTheme } from 'template-theme-manager';

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

  // Ref:
  const screenshotRef = useRef<HTMLDivElement>(null);

  // State:
  const [enableFlutterPublish, setEnableFlutterPublish] = useState(false);
  const [enableFlutterSave, setEnableFlutterSave] = useState(false);
  const [templateWidth, setTemplateWidth] = useState('600px');

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
    return template.content.children.length === 1 && template.content.children?.[0]?.type === 'advanced_wrapper' && (template.content.children?.[0]?.children?.length ?? 0) === 0;
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

  const onlyGetUsedCustomAttributes = (content: any) => {
    // It's dirty, because it contains both predefined and custom attributes.
    // Essentially, any attribute being used in the template is returned here.
    const gridBlocks = getGridBlocksInJSON(content);

    let extractedDirtyAttributesArray = extractAttributes(JSON.stringify(content ?? {}));
    for (const gridBlock of gridBlocks) {
      const dataSource: string[] = [gridBlock?.['attributes']?.['data-source']] ?? [];
      extractedDirtyAttributesArray = [
        ...extractedDirtyAttributesArray,
        ...extractAttributes(JSON.stringify(gridBlock ?? {})),
        ...dataSource,
      ];
    }

    const predefinedAttributesArray = Object.keys(getPredefinedAttributes());
    const filteredCustomAttributes = difference(extractedDirtyAttributesArray, predefinedAttributesArray);

    // Now, we filter the extracted and filtered custom attributes again,
    // based on whether they had been declared in the Page Attributes panel or not.
    const declaredCustomAttributesArray = [...new Set(Object.keys(getCustomAttributes()))];
    const usedCustomAttributes = filteredCustomAttributes.filter(attribute => declaredCustomAttributesArray.includes(attribute));

    return zipObject(usedCustomAttributes, Array(usedCustomAttributes.length).fill(''));
  };

  // Effects:
  useEffect(() => {
    (window as any).templateJSON = values;
  }, [values]);

  useEffect(() => {
    registerEventHandlers.onRequestSave(async message => {
      try {
        Message.loading('Loading...');
        setTemplateWidth(values.content.attributes.width ?? '600px');
        const transformedContent = JSON.stringify(values.content, (_key, value) => {
          if (typeof value === 'string') {
            return revertMergeTags(value);
          }
          return value;
        });
        const customAttributes = onlyGetUsedCustomAttributes(values.content);
        const customAttributesArray = [...new Set(Object.keys(customAttributes))];
        const predefinedAttributesArray = [...new Set(Object.keys(getPredefinedAttributes()))];

        const combinedAttributeMap = {
          ...customAttributes,
          ...getPredefinedAttributes(),
        };

        const templateType = sessionStorage.getItem('template-type') ?? 'EMAIL';
        const rawHTML = generateHTML(values, combinedAttributeMap);
        const rawHTMLForPreview = generateHTML(values, combinedAttributeMap, true);
        const finalHTML = unsanitizeHTMLTags(
          mustachifyHTML(
            stylizeGridColumn(
              appendGridOrganizerScript(rawHTML)
            )
          )
        );

        const previewHTML = unsanitizeHTMLTags(stylizeGridColumn(rawHTMLForPreview));
        if (screenshotRef.current) screenshotRef.current.innerHTML = previewHTML;

        const preview = await takeScreenshot(screenshotRef.current, {
          allowTaint: false,
          useCORS: true,
        });
        if (screenshotRef.current) screenshotRef.current.innerHTML = '';

        const blockIDMap = isJSONStringValid(sessionStorage.getItem('block-ids') ?? '{}') ? (sessionStorage.getItem('block-ids') ?? '{}') : '{}';
        const blockIDs = Object.values(JSON.parse(blockIDMap) as Record<string, string>);
        const themeSettings = extractThemeSettingsFromTemplate(values.content);
        const templateTheme = getTemplateTheme();

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
                typography: templateTheme.typography,
                palettes: templateTheme.palettes,
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
            html: finalHTML
          },
        });
        Message.clear();
        Message.success('Template saved successfully!');
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
      }
    });
  }, [values, takeScreenshot]);

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
      <div
        ref={screenshotRef}
        style={{
          position: 'absolute',
          width: templateWidth ?? '600px',
          left: '-9999px',
        }}
      />
      {/** @ts-ignore */}
      <StandardLayout
        compact={!(width < 1400)}
        categories={defaultCategories}
      >
        <EmailEditor />
      </StandardLayout>
    </>
  );
};

// Exports:
export default InternalEditor;
