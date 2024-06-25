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
import { LibraryImage, StaticText, setTemplateTheme } from 'template-theme-manager';
import updateThemeInstancesInTemplate from '@demo/utils/updateThemeInstancesInTemplate';

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
  setConditionalMappingState,
} from 'conditional-mapping-manager';

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
import { Loading } from '@demo/components/loading';
import InternalEditor from './InternalEditor';

// Redux:
import {
  EmailEditorProvider,
  IEmailTemplate,
} from 'easy-email-editor';

// Functions:
export const generateTimestampID = () => {
  const timestamp = Date.now();
  const id = 'req' + timestamp;
  return id;
};

const Editor = () => {
  // Constants:
  const id = generateTimestampID();
  const fontList = [
    'Arial',
    'Tahoma',
    'Verdana',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Lato',
    'Montserrat',
    '黑体',
    '仿宋',
    '楷体',
    '标楷体',
    '华文仿宋',
    '华文楷体',
    '宋体',
    '微软雅黑',
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

  // Memo:
  const themeStyleText = useMemo(() => {
    if (theme === 'green') return greenTheme;
    if (theme === 'purple') return purpleTheme;
    return blueTheme;
  }, [theme]);

  // Functions:
  const transformAttributesInTemplateContent = (text: string, attributes: string[]) => {
    const regex = /\{\{([a-zA-Z0-9._\-]+)\}\}/g;
    return text.replace(regex, (match, attributeName) => {
      if (attributes.includes(attributeName)) {
        const input = document.createElement('input');
        input.value = attributeName;
        input.type = 'button';
        input.className = 'easy-email-merge-tag-badge';
        input.id = ((new Date()).getTime()).toString();
        return input.outerHTML.replace(/"/g, '\\"');
      } else return match;
    });
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

    sessionStorage.setItem('template-type', payload.template.type ?? 'EMAIL');
    sessionStorage.setItem('block-ids', isJSONStringValid(payload.blockIDs?.map) ? payload.blockIDs?.map : '{}');

    const typography = payload.template.themeSettings.typography ?? [];
    const palettes = payload.template.themeSettings.palettes ?? [];
    const images = payload.template.themeSettings.images ?? [];
    const staticText = payload.template.themeSettings.staticText ?? [];
    setTemplateTheme(_templateTheme => ({ typography, palettes, images, staticText }));
    const template = updateThemeInstancesInTemplate(payload.template);
    const modifiedTemplate = JSON.parse(
      transformAttributesInTemplateContent(
        JSON.stringify(
          modifyTemplateAccordingToThemeSettings(template)
        ),
        [
          ...payload.attributes.predefined,
          ...payload.attributes.custom,
        ]
      )
    );
    setTemplateData({
      content: modifiedTemplate,
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
