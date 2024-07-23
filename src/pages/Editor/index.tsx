// Packages:
import React, {
  useEffect,
  useMemo,
  useState
} from 'react';
import { zipObject, difference } from 'lodash';
import services from '@demo/services';
import useConversationManager from '@demo/hooks/useConversationManager';
const imageCompression = import('browser-image-compression');
import {
  AttributeModifier,
  setCustomAttributes,
  setPredefinedAttributes,
} from 'attribute-manager';
import { isJSONStringValid } from '@demo/utils/isJSONStringValid';
import { CustomFont, LibraryImage, StaticText, setTemplateTheme } from 'template-theme-manager';
import updateThemeInstancesInTemplate from '@demo/utils/updateThemeInstancesInTemplate';
import { setCustomBlocks } from 'custom-block-manager';
import { setConditionalMappingState } from 'conditional-mapping-manager';
import { customAlphabet } from 'nanoid';

// Typescript:
declare global {
  interface Window {
    CurrentJSON: string;
  }
}
import {
  CallType,
  Message,
  Palette,
  Sender,
  Typography,
} from '@demo/context/ConversationManagerContext';
import {
  ActionOrigin,
  Condition,
} from 'conditional-mapping-manager';
import { Node } from '../../utils/gridShiftBackgroundImageFromSectionToColumn';

// Imports:
import 'easy-email-editor/lib/style.css';
import 'easy-email-extensions/lib/style.css';
import blueTheme from '@arco-themes/react-easy-email-theme/css/arco.css?inline';
import purpleTheme from '@arco-themes/react-easy-email-theme-purple/css/arco.css?inline';
import greenTheme from '@arco-themes/react-easy-email-theme-green/css/arco.css?inline';

// Constants:
import localesData from 'easy-email-localization/locales/locales.json';
import enUS from '@arco-design/web-react/es/locale/en-US';

// Components:
import { ConfigProvider } from '@arco-design/web-react';
import InternalEditor from './InternalEditor';

// Redux:
import {
  EmailEditorProvider,
  IEmailTemplate,
} from 'easy-email-editor';
import { BasicType } from 'easy-email-core';

// Functions:
export const generateTimestampID = () => {
  const timestamp = Date.now();
  const id = 'req' + timestamp;
  return id;
};

const generateVariableName = (prefix: string = 'var'): string => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nanoid = customAlphabet(alphabet, 10);
  return `${prefix}_${nanoid()}`;
};

const Editor = () => {
  // Constants:
  const id = generateTimestampID();
  const DEFAULT_FONTS = [
    'Arial',
    'Tahoma',
    'Verdana',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Lato',
    'Montserrat',
    // '黑体',
    // '仿宋',
    // '楷体',
    // '标楷体',
    // '华文仿宋',
    // '华文楷体',
    // '宋体',
    // '微软雅黑',
  ].map(item => ({ value: item, label: item }));
  const {
    acknowledgeAndEndConversation,
    doesFlutterKnowThatReactIsReady,
    getTemplate,
    registerEventHandlers,
  } = useConversationManager();

  // State:
  const [isLoading, setIsLoading] = useState(true);
  const [templateData, setTemplateData] = useState<IEmailTemplate>();
  const [isDarkMode] = useState(false);
  const [theme] = useState<'blue' | 'green' | 'purple'>('blue');
  const [locale] = useState('en');
  const [fontList, setFontList] = useState(DEFAULT_FONTS);

  // Memo:
  const themeStyleText = useMemo(() => {
    if (theme === 'green') return greenTheme;
    if (theme === 'purple') return purpleTheme;
    return blueTheme;
  }, [theme]);

  // Functions:
  // const transformAttributesInTemplateContent = (text: string, attributes: string[]) => {
  //   const regex = /\{\{([a-zA-Z0-9._\-]+)\}\}/g;
  //   return text.replace(regex, (match, attributeName) => {
  //     if (attributes.includes(attributeName)) {
  //       const input = document.createElement('input');
  //       input.value = attributeName;
  //       input.type = 'button';
  //       input.className = 'easy-email-merge-tag-badge';
  //       input.id = ((new Date()).getTime()).toString();
  //       return input.outerHTML.replace(/"/g, '\\"');
  //     } else return match;
  //   });
  // };

  const recursiveAttributeTransformation = (content: Node, attributes: string[]) => {
    const findTextInNode = (node: Node) => {
      if (['advanced_text', 'text'].includes(node.type)) {
        const regex = /\{\{([a-zA-Z0-9._\-]+)\}\}/g;
        const content = (node.data.value['content'] ?? '').replace(regex, (match, attributeName) => {
          if (attributes.includes(attributeName)) {
            const input = document.createElement('input');
            input.value = attributeName;
            input.type = 'button';
            input.className = 'easy-email-merge-tag-badge';
            input.id = ((new Date()).getTime()).toString();
            return input.outerHTML;
          } else return match;
        });
        return {
          ...node,
          data: {
            ...node.data,
            value: {
              ...node.data.value,
              content
            }
          }
        };
      } else {
        node = {
          ...node,
          children: ((node.children ?? []) as Node[]).map(node => findTextInNode(node))
        };
        return node;
      }
    };

    return findTextInNode(content);
  };

  const onUploadImage = async (blob: Blob) => {
    const compressionFile = await (
      await imageCompression
    ).default(blob as File, {
      maxWidthOrHeight: 1440,
    });
    return services.common.uploadByQiniu(compressionFile);
  };

  const modifyTemplateAccordingToThemeSettings = (template: {
    content: string;
    themeSettings: {
      width?: string;
      breakpoint?: string;
      fontFamily?: string;
      fontSize?: string;
      lineHeight?: string;
      fontWeight?: string;
      textColor?: string;
      background?: string;
      contentBackground?: string;
      userStyle?: string;
    };
  }) => {
    let content = JSON.parse(template.content);
    // Modify the template according to theme settings
    content.attributes = {
      ...content.attributes,
      'background-color': template.themeSettings.background ?? content.attributes['background-color'],
      'width': template.themeSettings.width ?? content.attributes['width'],
    };
    content.data.value = {
      ...content.data.value,
      'breakpoint': template.themeSettings.breakpoint ?? content.data.value['breakpoint'],
      'font-family': template.themeSettings.fontFamily ?? content.data.value['font-family'],
      'font-size': template.themeSettings.fontSize ?? content.data.value['font-size'],
      'font-weight': template.themeSettings.fontWeight ?? content.data.value['font-weight'],
      'line-height': template.themeSettings.lineHeight ?? content.data.value['line-height'],
      'text-color': template.themeSettings.textColor ?? content.data.value['text-color'],
      'content-background-color': template.themeSettings.contentBackground ?? content.data.value?.['content-background-color'],
      'user-style': {
        ...content.data.value?.['user-style'],
        'content': template.themeSettings.contentBackground ?? content.data.value?.['user-style']?.['content'],
      }
    };
    return content;
  };

  const loadTemplate = (message: Message) => {
    const payload = JSON.parse(message.payload) as {
      template: {
        type: string;
        content: string;
        themeSettings: {
          width?: string;
          breakpoint?: string;
          fontFamily?: string;
          fontSize?: string;
          lineHeight?: string;
          fontWeight?: string;
          textColor?: string;
          background?: string;
          contentBackground?: string;
          userStyle?: string;
          typography?: Typography[];
          palettes?: Palette[];
          images?: LibraryImage[];
          staticText?: StaticText[];
          customFonts?: CustomFont[];
          customBlocks: {
            id: string;
            label: string;
            code: string;
            configuration: string;
          }[];
          usedCustomBlocks?: string[];
        };
      };
      attributes: {
        predefined: string[];
        custom: string[];
      };
      blockIDs: {
        map: string;
      };
      conditionalMapping: {
        boolean?: Condition[];
        javascript?: string;
        css?: string;
      };
    };
    console.log(payload);

    sessionStorage.setItem('template-type', payload.template.type ?? 'EMAIL');
    sessionStorage.setItem('block-ids', isJSONStringValid(payload.blockIDs?.map) ? payload.blockIDs?.map : '{}');

    const typography = payload.template.themeSettings.typography ?? [];
    const palettes = payload.template.themeSettings.palettes ?? [];
    const images = payload.template.themeSettings.images ?? [];
    const staticText = payload.template.themeSettings.staticText ?? [];
    setTemplateTheme(_templateTheme => ({ typography, palettes, images, staticText }));
    const template = updateThemeInstancesInTemplate(payload.template);
    // const modifiedTemplateContent = JSON.parse(
    //   transformAttributesInTemplateContent(
    //     JSON.stringify(
    //       modifyTemplateAccordingToThemeSettings(template)
    //     ),
    //     [
    //       ...payload.attributes.predefined,
    //       ...payload.attributes.custom,
    //     ]
    //   )
    // );
    const modifiedTemplateContent = recursiveAttributeTransformation(
      modifyTemplateAccordingToThemeSettings(template),
      [
        ...payload.attributes.predefined,
        ...payload.attributes.custom,
      ]
    );
    const customFonts = payload.template.themeSettings.customFonts ?? [];
    if (customFonts.length > 0) {
      if (modifiedTemplateContent.type === BasicType.PAGE) {

        const customFontsForLinkIndexes = [] as number[];
        const customFontsForLink = customFonts.filter((customFont, index) => {
          if (customFont.src.includes('googleapis')) {
            customFontsForLinkIndexes.push(index);
            return true;
          } else return false;
        });
        const customFontURLs = customFontsForLink.map(customFont => `<link href="${customFont.src}" rel="stylesheet">`).join();
        sessionStorage.setItem('custom-font-urls', customFontURLs);
        modifiedTemplateContent.data.value['extraHeadContent'] = (modifiedTemplateContent.data.value['extraHeadContent'] ?? '') + customFontURLs;
        (window as Window).document.head.innerHTML = ((window as Window).document.head.innerHTML ?? '') + customFontURLs;

        const style = document.createElement('style');
        const fontFaces = customFonts.map((customFont, index) => customFontsForLinkIndexes.includes(index) ? '' : `
          @font-face {
            font-family: '${customFont.name}';
            src: url('${customFont.src}') format('truetype');
            font-weight: normal;
            font-style: normal;
          }
        `).join('\n');
        style.textContent = fontFaces;
        sessionStorage.setItem('custom-font-font-faces', fontFaces);
        document.head.appendChild(style);
        modifiedTemplateContent.data.value['extraHeadContent'] = (modifiedTemplateContent.data.value['extraHeadContent'] ?? '') + style.outerHTML;
      }
      setFontList(_fontList => [..._fontList, ...customFonts.map(customFont => ({ value: customFont.name, label: customFont.name }))]);
    }

    setTemplateData({
      content: modifiedTemplateContent,
      subject: '',
      subTitle: '',
    });

    const trueCustomAttributes = difference(payload.attributes.custom, payload.attributes.predefined);
    setCustomAttributes(AttributeModifier.React, _customAttributes => ({
      ...zipObject(trueCustomAttributes, Array(trueCustomAttributes.length).fill('')),
    }));
    setPredefinedAttributes(AttributeModifier.React, _predefinedAttributes => ({
      ...zipObject(payload.attributes.predefined, Array(payload.attributes.predefined.length).fill('')),
    }));
    setConditionalMappingState(ActionOrigin.React, _conditionalMappingState => ({
      ..._conditionalMappingState,
      isActive: false,
      focusIdx: 'content',
      focusBlock: {},
      templateContent: payload.template.content,
      conditions: payload.conditionalMapping.boolean ?? [],
      javascript: payload.conditionalMapping.javascript,
      css: payload.conditionalMapping.css,
    }));
    if (
      payload.template.themeSettings.customBlocks &&
      payload.template.themeSettings.customBlocks?.length > 0
    ) {
      const customBlocks = payload.template.themeSettings.customBlocks;
      setCustomBlocks(_customBlocks => customBlocks);

      // Activate custom blocks:
      const usedCustomBlocks = payload.template.themeSettings.usedCustomBlocks ?? [];
      if (usedCustomBlocks.length > 0) {
        for (const usedCustomBlockID of usedCustomBlocks) {
          const customBlock = customBlocks.find(customBlock => customBlock.id === usedCustomBlockID);
          if (!customBlock) continue;
          const customComponentName = generateVariableName();
          const script = `class ${customComponentName} extends HTMLElement {
            constructor() {
              super();
              this.attachShadow({ mode: 'open' });
            }

            connectedCallback() {
              const observer = new MutationObserver((mutationRecords) => {
                mutationRecords.forEach(record => {
                  this.render();
                });
              }).observe(this, { attributes: true });
              this.render();
            }

            render () {
              const attributes = Object.entries(this.dataset ?? {}).reduce((array, entry) => ({
                ...array,
                ['data-' + entry[0].split(/(?=[A-Z])/).join('-').toLowerCase()]: entry[1]
              }), {});
              this.shadowRoot.innerHTML = new Function('attributes', window.atob("${customBlock.code}"))(attributes);
            }
          }

          try {
            if (!customElements.get("${customBlock.id}")) customElements.define("${customBlock.id}", ${customComponentName});
          } catch (error) {
            console.error(error);
          }
          `;
          new Function(script)();
        }
      }
    }
    setIsLoading(false);
    acknowledgeAndEndConversation(message.conversationID, 'Template has been received from Flutter.');
  };

  // Effects:
  useEffect(() => {
    if (doesFlutterKnowThatReactIsReady && !templateData) {
      getTemplate(message => {
        if (
          message.callType === CallType.RESPONSE &&
          message.payload &&
          message.sender === Sender.FLUTTER
        ) loadTemplate(message);
      });
    }
  }, [doesFlutterKnowThatReactIsReady, templateData]);

  useEffect(() => {
    registerEventHandlers.onLoadTemplate(loadTemplate);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.setAttribute('arco-theme', 'dark');
    } else {
      document.body.removeAttribute('arco-theme');
    }
  }, [isDarkMode]);

  // Return:
  // if (!templateData && isLoading) {
  //   return (
  //     <Loading loading={isLoading}>
  //       <div style={{ height: '100vh' }} />
  //     </Loading>
  //   );
  // }

  if (!templateData) return null;

  return (
    <ConfigProvider locale={enUS}>
      <div>
        <style>{themeStyleText}</style>
        <EmailEditorProvider
          key={id}
          height={'calc(100vh - 1px)'}
          data={templateData}
          onUploadImage={onUploadImage}
          fontList={fontList}
          // onChangeMergeTag={onChangeMergeTag}
          autoComplete
          enabledLogic={false}
          dashed={false}
          mergeTagGenerate={tag => `{{${tag}}}`}
          // onBeforePreview={onBeforePreview}
          socialIcons={[]}
          enabledMergeTagsBadge
          locale={localesData[locale]}
        >
          {({ values }, { submit, restart }) => (
            <InternalEditor
              values={values}
              submit={submit}
              restart={restart}
            />
          )}
        </EmailEditorProvider>
        <style>{`#bmc-wbtn {display:none !important}`}</style>
      </div>
    </ConfigProvider>
  );
};

// Exports:
export default Editor;
