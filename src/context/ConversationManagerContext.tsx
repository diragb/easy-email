// Packages:
import { Message as ArcoMessage } from '@arco-design/web-react';
import {
  generateUpdateImageUploadListener,
  ImageUpload,
  setImageUpload
} from 'image-upload-manager';
import React, { createContext, useEffect, useState } from 'react';
import sleep from 'sleep-promise';
import { v4 as uuidv4 } from 'uuid';

// Typescript:
export enum ConversationType {
  READY,
  SAVE,
  GET_TEMPLATE,
  ENABLE_PUBLISH,
  ENABLE_SAVE,
  UPLOAD_IMAGE,
  CONDITIONAL_MAPPING_STATUS,
  LOAD_TEMPLATE,
  EXIT_CONDITIONAL_MAPPING,
}

export enum CallType {
  REQUEST,
  RESPONSE,
  ACKNOWLEDGEMENT,
  ERROR,
}

export enum Sender {
  FLUTTER,
  REACT,
}

export interface Message {
  conversationID: string;
  conversationType: ConversationType;
  callType: CallType;
  payload: string;
  sender: Sender;
  sentAt: number;
}

export interface ConversationState {
  createdAt: number;
  messages: Message[];
  resendMessageTimeoutID?: number;
  killConversationTimeoutID?: number;
  handlerFunction?: ((message: Message) => void);
}

export interface ConversationManagerValues {
  acknowledgeAndEndConversation: (conversationID: string, message?: string) => void;
  doesFlutterKnowThatReactIsReady: boolean;
  getTemplate: (callback: (message: Message) => void) => void;
  requestTemplateSave: (payload: any, callback: (message: Message) => void) => void;
  registerEventHandlers: {
    onRequestSave: (callback: (message: Message) => void) => void;
    onConditionalMappingStatus: (callback: (newStatus: boolean) => void) => void;
    onLoadTemplate: (callback: (message: Message) => void) => void;
  };
  sendMessageToFlutter: ({ conversationID, conversationType, callType, payload, sentAt, }: {
    conversationID: string;
    conversationType: ConversationType;
    callType: CallType;
    payload: any;
    sentAt?: number | undefined;
  }) => void;
  enablePublish: (payload: boolean) => void;
  enableSave: (payload: boolean) => void;
  exitConditionalMapping: () => void;
}

export interface Typography {
  name: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
}

export interface PaletteColor {
  name: string;
  color: string;
}

export interface Palette {
  name: string;
  colors: PaletteColor[];
}

// Constants:
const defaultProvider: ConversationManagerValues = {
  acknowledgeAndEndConversation: () => { },
  doesFlutterKnowThatReactIsReady: false,
  getTemplate: () => { },
  requestTemplateSave: () => { },
  registerEventHandlers: {
    onRequestSave: () => { },
    onConditionalMappingStatus: () => { },
    onLoadTemplate: () => { },
  },
  sendMessageToFlutter: () => { },
  enablePublish: () => { },
  enableSave: () => { },
  exitConditionalMapping: () => { },
};

// Context:
const ConversationManagerContext = createContext(defaultProvider);

// Functions:
const ConversationManagerProvider = ({ children }: { children: React.ReactNode; }) => {
  // Constants:
  const RESEND_MESSAGE_TIMEOUT = 2000;
  const RESEND_MESSAGE_LIMIT = 5;
  const KILL_CONVERSATION_TIMEOUT = RESEND_MESSAGE_LIMIT * 1000;
  const DEFAULT_TEMPLATE = {
    template: {
      type: 'IMG',
      content: "{\"type\":\"page\",\"data\":{\"value\":{\"breakpoint\":\"480px\",\"headAttributes\":\"\",\"font-size\":\"20px\",\"font-weight\":\"600\",\"line-height\":\"2\",\"headStyles\":[],\"fonts\":[],\"responsive\":true,\"font-family\":\"'Inter'\",\"user-style\":{},\"text-color\":\"black\",\"extraHeadContent\":\"<link href=\\\"http://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100..900;1,100..900&amp;display=swap\\\" rel=\\\"stylesheet\\\"><style>\\n          @font-face {\\n            font-family: 'Bottle Coffee';\\n            src: url('https://amplispot-dev2.blr1.digitaloceanspaces.com/test/Bottle%20Coffee.ttf') format('truetype');\\n            font-weight: normal;\\n            font-style: normal;\\n          }\\n        \\n</style>\"}},\"attributes\":{\"width\":\"600px\",\"background-color\":\"#F3F3F3\"},\"children\":[{\"type\":\"advanced_wrapper\",\"data\":{\"value\":{}},\"attributes\":{\"padding\":\"20px 20px 20px 20px\",\"border\":\"none\",\"direction\":\"ltr\",\"text-align\":\"center\",\"background-url\":\"https://i.imgur.com/szQzwot.png\",\"background-repeat\":\"no-repeat\",\"background-size\":\"cover\"},\"children\":[{\"type\":\"advanced_grid\",\"data\":{\"value\":{\"noWrap\":false}},\"attributes\":{\"padding\":\"100px 0px 220px 0px\",\"border\":\"none\",\"direction\":\"ltr\",\"text-align\":\"center\",\"data-direction\":\"row\",\"data-threshold\":\"5\",\"data-type\":\"grid\",\"background-url\":\"https://i.imgur.com/DAnvNp1.png\",\"background-repeat\":\"no-repeat\",\"background-size\":\"contain\",\"data-source\":\"rewards\"},\"children\":[{\"type\":\"advanced_section\",\"data\":{\"value\":{\"noWrap\":false}},\"attributes\":{\"padding\":\"20px 0px 20px 0px\",\"background-repeat\":\"no-repeat\",\"background-size\":\"contain\",\"background-position\":\"top center\",\"border\":\"none\",\"direction\":\"ltr\",\"text-align\":\"center\",\"background-url\":\"https://i.imgur.com/HpsWFqH.png\"},\"children\":[{\"type\":\"advanced_column\",\"data\":{\"value\":{}},\"attributes\":{\"padding\":\"35px 0px 35px 0px\",\"border\":\"none\",\"vertical-align\":\"top\"},\"children\":[{\"type\":\"advanced_text\",\"data\":{\"value\":{\"content\":\"<div style=\\\"text-align: center;\\\"><span style=\\\"background-color: initial; word-spacing: normal;\\\">{{rewards.slab}}</span></div>\"}},\"attributes\":{\"padding\":\"0px 0px 0px 0px\",\"align\":\"left\",\"font-size\":\"10px\",\"color\":\"white\",\"data-id\":\"slab-text\"},\"children\":[]},{\"type\":\"advanced_text\",\"data\":{\"value\":{\"content\":\"<div style=\\\"text-align: center;\\\"><span style=\\\"background-color: initial; word-spacing: normal;\\\">{{reward}}</span></div>\"}},\"attributes\":{\"padding\":\"25px 0px 0px 0px\",\"align\":\"left\",\"font-size\":\"8px\"},\"children\":[]}]}]}]}]},{\"type\":\"custom\",\"data\":{\"value\":{}},\"attributes\":{\"data-custom-component-id\":\"pie-chart\",\"data-custom-component-label\":\"Pie Chart\",\"data-custom-component-code\":\"Y29uc3QgcGllID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7IGNvbnN0IHBlcmNlbnRhZ2VGaWxsID0gKGlzTmFOKGF0dHJpYnV0ZXNbJ2RhdGEtcGVyY2VudCddKSA/IDI1IDogYXR0cmlidXRlc1snZGF0YS1wZXJjZW50J10pICogMy42OyBwaWUuc3R5bGVbJ3dpZHRoJ10gPSAnMjAwcHgnOyBwaWUuc3R5bGVbJ2hlaWdodCddID0gJzIwMHB4JzsgcGllLnN0eWxlWydib3JkZXJSYWRpdXMnXSA9ICc1MCUnOyBwaWUuc3R5bGVbJ2JhY2tncm91bmQnXSA9ICdjb25pYy1ncmFkaWVudCgjZmY2YjZiIDBkZWcgJyArIHBlcmNlbnRhZ2VGaWxsICsgJ2RlZywgIzRlY2RjNCAnICsgcGVyY2VudGFnZUZpbGwgKyAnZGVnIDM2MGRlZyknOyByZXR1cm4gcGllLm91dGVySFRNTDs=\",\"data-percent\":\"42\"},\"children\":[]}]}",
      themeSettings: {
        "width": "600px",
        "breakpoint": "480px",
        "fontFamily": "'Inter'",
        "fontSize": "20px",
        "lineHeight": "2",
        "fontWeight": "600",
        "textColor": "black",
        "background": "#F3F3F3",
        "userStyle": {},
      },
    },
    attributes: {
      predefined: ['alpha', 'beta', 'sierra'],
      custom: ['reward', 'rewards.slab'],
    },
    blockIDs: {
      map: "{\"content.children.[0].children.[0].children.[0].children.[0].children.[0]\": \"slab-text\"}",
    },
    conditionalMapping: {
      boolean: [
        {
          id: 'slab-text',
          focusIdx: 'content.children.[0].children.[0].children.[0].children.[0].children.[0]',
          attributes: {
            height: '',
            padding: '0px 0px 0px 0px',
            align: 'left',
            'font-size': '14px',
            color: '#03E3C1',
            'data-id': 'slab-text',
            'font-family': '',
            'font-weight': '500',
            'data-color-palette-name': 'Utility Palette',
            'data-color-palette-color-name': 'Secondary',
            'data-color-palette-color-code': '#03E3C1',
            'data-background-color-palette-name': 'Lucidity Palette',
            'data-background-color-palette-color-name': 'Superluminary',
            'data-background-color-palette-color-code': '#123456',
            'container-background-color': '#123456',
            'data-color-palette-tree': '-0-1',
            'data-background-color-palette-tree': '-1-1',
            'font-style': 'italic'
          },
          fields: [
            {
              attribute: 'alpha',
              operator: 'equals',
              value: '900'
            }
          ]
        }
      ]
    },
    usedCustomBlocks: ['pie-chart'],
    styleConfig: {
      typography: [
        {
          "name": "New 900 Non Italic 20 custom hermintosh",
          "fontFamily": "Custom Hermintosh",
          "fontSize": "20px",
          "fontWeight": "900"
        },
        {
          "name": "Dino Typography Italic",
          "fontFamily": "Dino Files Ttf ",
          "fontSize": "24px",
          "fontWeight": "normal"
        },
        {
          "name": "Sonic Turbo Typography",
          "fontFamily": "Sonic Turbo",
          "fontSize": "22px",
          "fontWeight": "500"
        },
        {
          "name": "Typography Dilemma",
          "fontFamily": "Dilemma Trial",
          "fontSize": "12px",
          "fontWeight": "400"
        },
        {
          "name": "Gooogle Font Oswald",
          "fontFamily": "Oswald",
          "fontSize": "18px",
          "fontWeight": "normal"
        },
        {
          "name": "I Am A Robot",
          "fontFamily": "Roboto Mono",
          "fontSize": "28px",
          "fontWeight": "900"
        }
      ] as Typography[],
      palettes: [
        {
          name: 'Utility Palette',
          colors: [
            {
              name: 'Primary',
              color: '#FFF',
            },
            {
              name: 'Secondary',
              color: '#03E3C1',
            },
          ],
        },
        {
          name: 'Lucidity Palette',
          colors: [
            {
              name: 'Primary',
              color: '#121212',
            },
            {
              name: 'Superluminary',
              color: '#123456',
            },
          ],
        },
      ] as Palette[],
      images: [
        {
          name: 'Banner',
          url: 'https://images.pexels.com/photos/14981339/pexels-photo-14981339/free-photo-of-a-man-standing-on-gray-rock.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        },
        {
          name: 'Logo',
          url: 'https://static.vecteezy.com/system/resources/thumbnails/008/214/517/small_2x/abstract-geometric-logo-or-infinity-line-logo-for-your-company-free-vector.jpg'
        },
      ],
      staticText: [
        {
          "name": "Nameeeeee",
          "text": "helloooooooooooooooo",
          "typographyName": "Sonic Turbo Typography"
        },
        {
          "name": "Welcome Client",
          "text": "Hello we welcome you to our team",
          "typographyName": null
        },
        {
          "name": "Brand Slogen",
          "text": "The Best Bet You Can Make",
          "typographyName": "Dino Typography Italic"
        },
        {
          "name": "A Special Text Which Is Too Long Just To Test Over",
          "text": "The old clock tower loomed over the sleepy town its weathered face barely visible through the morning mist For generations its steady ticking had marked the rhythm of daily life a constant reminder of times relentless march But on this particular dawn an eerie silence hung in the air The clock had stopped and with it a sense of unease crept through the streets below Townsfolk emerged from their homes exchanging worried glances and hushed whispers Some claimed it was merely a mechanical failure while others saw it as an omen of impending change As the sun climbed higher casting long shadows acr",
          "typographyName": "New 900 Non Italic 20 custom hermintosh"
        },
        {
          "name": "Test With Google Font Typo",
          "text": "hello this is your developer",
          "typographyName": "Gooogle Font Oswald"
        },
      ],
      customFonts: [
        {
          "name": "Dilemma Trial",
          "src": "https://conversifytest.blr1.digitaloceanspaces.com/organisation/d564b4d9-dd45-4a4f-98ea-979b35834a3c/TP_FONT/Dilemma_Trial.ttf"
        },
        {
          "name": "Slick Woff",
          "src": "https://conversifytest.blr1.digitaloceanspaces.com/organisation/d564b4d9-dd45-4a4f-98ea-979b35834a3c/TP_FONT/slick_woff.woff"
        },
        {
          "name": "Sonic Turbo",
          "src": "https://conversifytest.blr1.digitaloceanspaces.com/organisation/d564b4d9-dd45-4a4f-98ea-979b35834a3c/TP_FONT/sonic_turbo.otf"
        },
        {
          "name": "Custom Hermintosh",
          "src": "https://conversifytest.blr1.digitaloceanspaces.com/organisation/d564b4d9-dd45-4a4f-98ea-979b35834a3c/TP_FONT/custom_hermintosh.otf"
        },
        {
          "name": "Dino Files Ttf ",
          "src": "https://conversifytest.blr1.digitaloceanspaces.com/organisation/d564b4d9-dd45-4a4f-98ea-979b35834a3c/TP_FONT/dino_files_ttf_.ttf"
        },
        {
          "name": "Roboto",
          "src": "//fonts.googleapis.com/css2?family=Roboto&display=swap"
        },
        {
          "name": "Open Sans",
          "src": "//fonts.googleapis.com/css2?family=Open+Sans&display=swap"
        },
        {
          "name": "Noto Sans JP",
          "src": "//fonts.googleapis.com/css2?family=Noto+Sans+JP&display=swap"
        },
        {
          "name": "Lato",
          "src": "//fonts.googleapis.com/css2?family=Lato&display=swap"
        },
        {
          "name": "Montserrat",
          "src": "//fonts.googleapis.com/css2?family=Montserrat&display=swap"
        },
        {
          "name": "Roboto Condensed",
          "src": "//fonts.googleapis.com/css2?family=Roboto+Condensed&display=swap"
        },
        {
          "name": "Oswald",
          "src": "//fonts.googleapis.com/css2?family=Oswald&display=swap"
        },
        {
          "name": "Poppins",
          "src": "//fonts.googleapis.com/css2?family=Poppins&display=swap"
        },
        {
          "name": "Raleway",
          "src": "//fonts.googleapis.com/css2?family=Raleway&display=swap"
        },
        {
          "name": "Roboto Mono",
          "src": "//fonts.googleapis.com/css2?family=Roboto+Mono&display=swap"
        },
        {
          "name": "Noto Sans",
          "src": "//fonts.googleapis.com/css2?family=Noto+Sans&display=swap"
        },
        {
          "name": "PT Sans",
          "src": "//fonts.googleapis.com/css2?family=PT+Sans&display=swap"
        },
        {
          "name": "Roboto Slab",
          "src": "//fonts.googleapis.com/css2?family=Roboto+Slab&display=swap"
        },
        {
          "name": "Ubuntu",
          "src": "//fonts.googleapis.com/css2?family=Ubuntu&display=swap"
        },
        {
          "name": "Merriweather",
          "src": "//fonts.googleapis.com/css2?family=Merriweather&display=swap"
        },
        {
          "name": "Playfair Display",
          "src": "//fonts.googleapis.com/css2?family=Playfair+Display&display=swap"
        },
        {
          "name": "Nunito",
          "src": "//fonts.googleapis.com/css2?family=Nunito&display=swap"
        },
        {
          "name": "Open Sans Condensed",
          "src": "//fonts.googleapis.com/css2?family=Open+Sans+Condensed&display=swap"
        },
        {
          "name": "Work Sans",
          "src": "//fonts.googleapis.com/css2?family=Work+Sans&display=swap"
        },
        {
          "name": "Lora",
          "src": "//fonts.googleapis.com/css2?family=Lora&display=swap"
        },
        {
          "name": "Mukta",
          "src": "//fonts.googleapis.com/css2?family=Mukta&display=swap"
        },
        {
          "name": "PT Serif",
          "src": "//fonts.googleapis.com/css2?family=PT+Serif&display=swap"
        },
        {
          "name": "Rubik",
          "src": "//fonts.googleapis.com/css2?family=Rubik&display=swap"
        },
        {
          "name": "Noto Serif",
          "src": "//fonts.googleapis.com/css2?family=Noto+Serif&display=swap"
        }
      ],
      customBlocks: [
        {
          id: 'pie-chart',
          label: 'Pie Chart',
          code: window.btoa(`const pie = document.createElement('div'); const percentageFill = (isNaN(attributes['data-percent']) ? 25 : attributes['data-percent']) * 3.6; pie.style['width'] = '200px'; pie.style['height'] = '200px'; pie.style['borderRadius'] = '50%'; pie.style['background'] = 'conic-gradient(#ff6b6b 0deg ' + percentageFill + 'deg, #4ecdc4 ' + percentageFill + 'deg 360deg)'; return pie.outerHTML;`),
          configuration: '{"sections":[{"header":"Pie Configuration","fields":[{"label":"Percent","type":"text","attribute":"data-percent"}]}]}',
        },
        {
          id: 'pie-chart-html',
          label: 'Pie Chart (HTML)',
          code: window.btoa('return `<div style="width: 200px; height: 200px; border-radius: 50%; background: conic-gradient(#ff6b6b 0deg ${ (isNaN(attributes[\'data-percent\']) ? 25 : attributes[\'data-percent\']) * 3.6 }deg, #4ecdc4 ${ (isNaN(attributes[\'data-percent\']) ? 25 : attributes[\'data-percent\']) * 3.6 }deg 360deg)"></div>`'),
          configuration: '{"sections":[{"header":"Pie Configuration","fields":[{"label":"Percent","type":"text","attribute":"data-percent"}]}]}',
        },
        {
          id: 'funnel-chart',
          label: 'Funnel',
          code: window.btoa(`
            const upperPercent = isNaN(parseInt(attributes['data-upper-percent'])) ? 50 : attributes['data-upper-percent'];
            const lowerPercent = isNaN(parseInt(attributes['data-lower-percent'])) ? 25 : attributes['data-lower-percent'];
            const gap = isNaN(parseInt(attributes['data-gap'])) ? 16 : attributes['data-gap'];

            const upperColor = attributes['data-upper-color'] ?? '#555';
            const lowerColor = attributes['data-lower-color'] ?? '#555';

            const container = document.createElement('div');
            const upperTrapezoid = document.createElement('div');
            const lowerTrapezoid = document.createElement('div');

            container.style['display'] = 'flex';
            container.style['alignItems'] = 'center';
            container.style['flexDirection'] = 'column';
            container.style['gap'] = gap + 'px';
            container.style['width'] = '250px';

            upperTrapezoid.style['borderTop'] = '50px solid ' + upperColor;
            upperTrapezoid.style['borderLeft'] = '25px solid transparent';
            upperTrapezoid.style['borderRight'] = '25px solid transparent';
            upperTrapezoid.style['height'] = '0px';
            upperTrapezoid.style['width'] = 'calc(' + upperPercent + '% - 50px)';

            lowerTrapezoid.style['borderTop'] = '50px solid ' + lowerColor;
            lowerTrapezoid.style['borderLeft'] = '25px solid transparent';
            lowerTrapezoid.style['borderRight'] = '25px solid transparent';
            lowerTrapezoid.style['height'] = '0px';
            lowerTrapezoid.style['width'] = 'calc(' + lowerPercent + '% - 50px)';

            container.append(upperTrapezoid);
            container.append(lowerTrapezoid);

            return container.outerHTML;
          `),
          configuration: `
          {
            "sections": [
              {
                "header": "Funnel Configuration",
                "fields": [
                  {
                    "label": "Upper Percent",
                    "type": "text",
                    "attribute": "data-upper-percent",
                    "validate": "${window.btoa("return value?.trim().length === 0 ? undefined : isNaN(parseInt(value)) ? 'Please enter a number!' : undefined;")}"
                  },
                  {
                    "label": "Upper Funnel Color",
                    "type": "text",
                    "attribute": "data-upper-color"
                  },
                  {
                    "label": "Lower Percent",
                    "type": "text",
                    "attribute": "data-lower-percent",
                    "validate": "${window.btoa("return value?.trim().length === 0 ? undefined : isNaN(parseInt(value)) ? 'Please enter a number!' : undefined;")}"
                  },
                  {
                    "label": "Lower Funnel Color",
                    "type": "text",
                    "attribute": "data-lower-color"
                  },
                  {
                    "label": "Gap",
                    "type": "text",
                    "attribute": "data-gap",
                    "validate": "${window.btoa("return value?.trim().length === 0 ? undefined : isNaN(parseInt(value)) ? 'Please enter a number!' : undefined;")}"
                  }
                ]
              }
            ]
          }`,
        }
      ],
    }
  };

  // State:
  const [conversations, setConversations] = useState<Record<string, ConversationState>>({});
  const [doesFlutterKnowThatReactIsReady, setDoesFlutterKnowThatReactIsReady] = useState(false);
  const [eventHandlers, setEventHandlers] = useState({
    onRequestSave: (_message: Message) => { },
    onConditionalMappingStatus: (_newStatus: boolean) => { },
    onLoadTemplate: (_message: Message) => { },
  });

  // Functions:
  const addConversation = (conversationID: string, state: ConversationState) => {
    if (typeof conversations[conversationID] !== 'undefined') {
      console.error(`[Conversation Manager - React]: Conversation already exists - restarting conversation: ${conversationID}. It relates to ${conversations[conversationID].messages[0].conversationType} first sent by ${conversations[conversationID].messages[0].sender} as a ${conversations[conversationID].messages[0].callType}. This conversation contains ${conversations[conversationID].messages.length} messages.`);

      endConversation(conversationID);
    }

    setConversations(_conversations => {
      _conversations[conversationID] = state;
      return _conversations;
    });
  };

  const sendMessageToFlutter = ({
    conversationID,
    conversationType,
    callType,
    payload,
    sentAt,
  }: {
    conversationID: string;
    conversationType: ConversationType;
    callType: CallType;
    payload: any;
    sentAt?: number;
  }) => {
    if (typeof conversations[conversationID] === 'undefined') {
      console.error('[Conversation Manager - React]: Cannot send message as the conversation is already over.');

      return;
    }

    const message: Message = {
      conversationID,
      conversationType,
      callType,
      payload: JSON.stringify(payload),
      sender: Sender.REACT,
      sentAt: sentAt ?? new Date().getTime(),
    };

    window.parent.postMessage(JSON.stringify(message), '*');

    if (
      [
        CallType.REQUEST,
        CallType.RESPONSE,
      ].includes(callType)
    ) {
      initiateResendMessageTimeout(conversationID);
      initiateKillConversationTimeout(conversationID);
    } else if (callType === CallType.ACKNOWLEDGEMENT) {
      endConversation(conversationID);

      return;
    }

    setConversations(_conversations => {
      _conversations[conversationID].messages.push(message);
      return _conversations;
    });
  };

  const initiateResendMessageTimeout = (conversationID: string) => {
    if (typeof conversations[conversationID] === 'undefined') return;

    if (conversations[conversationID].resendMessageTimeoutID) clearTimeout(conversations[conversationID].resendMessageTimeoutID);
    const resendMessageTimeoutID = window.setTimeout(() => {
      const lastMessage = {
        ...conversations[conversationID].messages.slice(-1)[0],
        sentAt: new Date().getTime(),
      } as Message;
      window.parent.postMessage(JSON.stringify(lastMessage), '*');
      setConversations(_conversations => {
        _conversations[conversationID].messages.push(lastMessage);
        return _conversations;
      });
      initiateResendMessageTimeout(conversationID);
    }, RESEND_MESSAGE_TIMEOUT);

    setConversations(_conversations => {
      _conversations[conversationID].resendMessageTimeoutID = resendMessageTimeoutID;
      return _conversations;
    });
  };

  const initiateKillConversationTimeout = (conversationID: string) => {
    if (typeof conversations[conversationID] === 'undefined') return;

    if (conversations[conversationID].killConversationTimeoutID) clearTimeout(conversations[conversationID].killConversationTimeoutID);
    const killConversationTimeoutID = window.setTimeout(() => endConversation(conversationID), KILL_CONVERSATION_TIMEOUT);

    setConversations(_conversations => {
      _conversations[conversationID].killConversationTimeoutID = killConversationTimeoutID;
      return _conversations;
    });
  };

  const beginConversation = async ({
    conversationType,
    payload,
  }: {
    conversationType: ConversationType;
    payload: any;
  }) => {
    const conversationID = uuidv4();
    const createdAt = new Date().getTime();
    const message: Message = {
      conversationID,
      conversationType,
      callType: CallType.REQUEST,
      payload: JSON.stringify(payload),
      sender: Sender.REACT,
      sentAt: createdAt,
    };

    // console.log(`[Conversation Manager - React]: Beginning a conversation of type ${conversationType}: `, JSON.stringify(message));
    addConversation(conversationID, {
      createdAt,
      messages: [message],
    });
    sendMessageToFlutter({
      conversationID,
      conversationType,
      callType: CallType.REQUEST,
      payload,
      sentAt: createdAt,
    });

    return message;
  };

  const endConversation = (conversationID: string) => {
    if (typeof conversations[conversationID] === 'undefined') return;

    clearTimeout(conversations[conversationID].resendMessageTimeoutID);
    clearTimeout(conversations[conversationID].killConversationTimeoutID);

    setConversations(_conversations => {
      delete _conversations[conversationID];
      return _conversations;
    });
  };

  const onFlutterMessage = async (event: MessageEvent<any>) => {
    try {
      if (typeof event.data !== 'string') return;
      if (event.data.trim().length === 0) return;
      const message = JSON.parse(event.data) as Message | undefined;

      if (!message || !message.conversationID) {
        throw new Error('Message cannot be deciphered.');
      }

      if (message.sender !== Sender.FLUTTER) return;

      if (
        !doesFlutterKnowThatReactIsReady &&
        message.callType === CallType.ACKNOWLEDGEMENT &&
        message.conversationType === ConversationType.READY
      ) {
        setDoesFlutterKnowThatReactIsReady(true);
      }

      if (message.callType === CallType.ACKNOWLEDGEMENT) endConversation(message.conversationID);
      if (message.callType === CallType.ERROR) {
        ArcoMessage.error('Encountered an error, please try again!');
        endConversation(message.conversationID);
      }

      if (message.callType === CallType.RESPONSE) {
        clearTimeout(conversations[message.conversationID]?.resendMessageTimeoutID);
        setConversations(_conversations => {
          delete _conversations[message.conversationID]?.resendMessageTimeoutID;
          return _conversations;
        });

        initiateKillConversationTimeout(message.conversationID);
      }

      if (message.callType === CallType.REQUEST) {
        console.log('[Conversation Manager - React]: Received request from Flutter: ', JSON.stringify(message));
        addConversation(
          message.conversationID,
          {
            createdAt: message.sentAt,
            messages: [message]
          }
        );

        switch (message.conversationType) {
          case ConversationType.SAVE:
            eventHandlers.onRequestSave(message);
            break;
          case ConversationType.CONDITIONAL_MAPPING_STATUS:
            // console.log('[Conversation Manager - React]: Received request for Conditional Mapping Status: ', JSON.stringify(message));
            eventHandlers.onConditionalMappingStatus(JSON.parse(message.payload) ?? false);
            acknowledgeAndEndConversation(message.conversationID);
            break;
          case ConversationType.LOAD_TEMPLATE:
            eventHandlers.onLoadTemplate(message);
            break;
          case ConversationType.UPLOAD_IMAGE:
            console.log('[Conversation Manager - React]: Received uploaded image URL from Flutter: ', message.payload);
            const payload = JSON.parse(message.payload) as ImageUpload;
            setImageUpload(() => ({
              idx: payload.idx,
              url: payload.url,
              status: 'UPLOADED',
            }));
            acknowledgeAndEndConversation(message.conversationID);
            break;
          default:
            break;
        }
      }

      conversations[message.conversationID]?.handlerFunction?.(message);
    } catch (error) {
      // console.error('[Conversation Manager - React]: Encountered an error while reading the message', error);
    }
  };

  const onReactMessage = async (event: MessageEvent<any>) => {
    try {
      if (typeof event.data !== 'string') return;
      if (event.data.trim().length === 0) return;
      const message = JSON.parse(event.data) as Message | undefined;

      if (!message || !message.conversationID) {
        throw new Error('Message cannot be deciphered.');
      }

      if (message.sender !== Sender.REACT) return;
      if (message.callType == CallType.ACKNOWLEDGEMENT) return;

      if (
        message.conversationType === ConversationType.READY
      ) {
        const newMessage: Message = {
          ...message,
          callType: CallType.ACKNOWLEDGEMENT,
          payload: '',
          sender: Sender.FLUTTER,
          sentAt: new Date().getTime(),
        };

        window.parent.postMessage(JSON.stringify(newMessage), '*');

        console.log('[Conversation Manager - Flutter] Readiness acknowledged.');
      }

      if (
        message.conversationType === ConversationType.GET_TEMPLATE
      ) {
        const newMessage: Message = {
          ...message,
          callType: CallType.RESPONSE,
          payload: JSON.stringify(DEFAULT_TEMPLATE),
          sender: Sender.FLUTTER,
          sentAt: new Date().getTime(),
        };

        window.parent.postMessage(JSON.stringify(newMessage), '*');

        console.log('[Conversation Manager - Flutter] Template sent.');
      }

      if (message.conversationType === ConversationType.UPLOAD_IMAGE) {
        console.log('[Conversation Manager - Flutter] Received image upload request.');
        const responseMessage: Message = {
          ...message,
          callType: CallType.ACKNOWLEDGEMENT,
          payload: '',
          sender: Sender.FLUTTER,
          sentAt: new Date().getTime(),
        };

        window.parent.postMessage(JSON.stringify(responseMessage), '*');

        await sleep(3000);
        console.log('[Conversation Manager - Flutter] Mock image uploaded.');

        const newConversationID = uuidv4();
        const newMessage: Message = {
          conversationID: newConversationID,
          conversationType: ConversationType.UPLOAD_IMAGE,
          callType: CallType.REQUEST,
          payload: JSON.stringify({
            idx: JSON.parse(message.payload).idx,
            url: 'https://images.pexels.com/photos/21936231/pexels-photo-21936231/free-photo-of-storks-in-nest.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
          }),
          sender: Sender.FLUTTER,
          sentAt: new Date().getTime(),
        };

        window.parent.postMessage(JSON.stringify(newMessage), '*');

        console.log('[Conversation Manager - Flutter] Uploaded image URL sent.');
      }

      if (
        message.conversationType === ConversationType.SAVE &&
        message.callType === CallType.RESPONSE
      ) {
        const newMessage = {
          ...message,
          callType: CallType.ACKNOWLEDGEMENT,
          payload: '',
          sender: Sender.FLUTTER,
          sentAt: new Date().getTime(),
        };
        window.parent.postMessage(JSON.stringify(newMessage), '*');

        console.log('[Conversation Manager - Flutter] Template received:', message.payload);
        console.log('[Conversation Manager - Flutter] Template saved.');
      }
    } catch (error) {
      // console.error('[Conversation Manager - Flutter]: Encountered an error while reading the message', error);
    }
  };

  const updateImageUpload = generateUpdateImageUploadListener(imageUpload => {
    if (
      imageUpload.status === 'NEED_TO_UPLOAD' &&
      imageUpload.idx
    ) {
      console.log('[Conversation Manager - React] Requesting Flutter to start upload.');
      beginConversation({
        conversationType: ConversationType.UPLOAD_IMAGE,
        payload: JSON.stringify({ idx: imageUpload.idx })
      });
    }
  });

  // Exposed Functions:
  const announceReadiness = () => {
    console.log('[Conversation Manager - React] Requesting acknowledgement of readiness.');
    beginConversation({
      conversationType: ConversationType.READY,
      payload: ''
    });
  };

  const acknowledgeAndEndConversation = (conversationID: string, message?: string) => {
    const lastMessage = conversations[conversationID].messages.slice(-1)[0];
    console.log(`[Conversation Manager - React] Acknowledged: ${message}`);
    sendMessageToFlutter({
      ...lastMessage,
      conversationID,
      conversationType: lastMessage.conversationType,
      callType: CallType.ACKNOWLEDGEMENT,
      payload: '',
      sentAt: new Date().getTime(),
    });
  };

  const getTemplate = async (callback: (message: Message) => void) => {
    console.log('[Conversation Manager - React] Requesting template.');
    const requestMessage = await beginConversation({
      conversationType: ConversationType.GET_TEMPLATE,
      payload: '',
    });

    setConversations(_conversations => {
      _conversations[requestMessage.conversationID].handlerFunction = callback;
      return _conversations;
    });
  };

  const requestTemplateSave = async (payload: any, callback: (message: Message) => void) => {
    const requestMessage = await beginConversation({
      conversationType: ConversationType.SAVE,
      payload,
    });

    setConversations(_conversations => {
      _conversations[requestMessage.conversationID].handlerFunction = callback;
      return _conversations;
    });
  };

  const registerEventHandlers = {
    onRequestSave: (callback: (message: Message) => void) => {
      setEventHandlers(_eventHandlers => {
        _eventHandlers['onRequestSave'] = callback;
        return _eventHandlers;
      });
    },
    onConditionalMappingStatus: (callback: (newStatus: boolean) => void) => {
      setEventHandlers(_eventHandlers => {
        _eventHandlers['onConditionalMappingStatus'] = callback;
        return _eventHandlers;
      });
    },
    onLoadTemplate: (callback: (message: Message) => void) => {
      setEventHandlers(_eventHandlers => {
        _eventHandlers['onLoadTemplate'] = callback;
        return _eventHandlers;
      });
    }
  };

  const enablePublish = async (payload: boolean) => {
    console.log(`[Conversation Manager - React] Flutter should ${payload ? 'show the publish button' : 'show the next button'}.`);

    const requestMessage = await beginConversation({
      conversationType: ConversationType.ENABLE_PUBLISH,
      payload,
    });

    setConversations(_conversations => {
      _conversations[requestMessage.conversationID].handlerFunction = (message: Message) => acknowledgeAndEndConversation(message.conversationID);;
      return _conversations;
    });
  };

  const enableSave = async (payload: boolean) => {
    console.log(`[Conversation Manager - React] Flutter should ${payload ? 'enable' : 'disable'} the save button.`);

    const requestMessage = await beginConversation({
      conversationType: ConversationType.ENABLE_SAVE,
      payload,
    });

    setConversations(_conversations => {
      _conversations[requestMessage.conversationID].handlerFunction = (message: Message) => acknowledgeAndEndConversation(message.conversationID);;
      return _conversations;
    });
  };

  const exitConditionalMapping = async () => {
    console.log('[Conversation Manager - React] Flutter should exit Conditional Mapping.');

    await beginConversation({
      conversationType: ConversationType.EXIT_CONDITIONAL_MAPPING,
      payload: '',
    });
  };

  // Effects:
  useEffect(() => {
    window.addEventListener('message', onFlutterMessage);
    window.addEventListener('message', updateImageUpload);
    // NOTE: Uncomment the following lines to mock Flutter's responses.
    // window.addEventListener('message', onReactMessage);
    // (window as any).mockFlutterSave = () => {
    //   const message: Message = {
    //     conversationID: uuidv4(),
    //     conversationType: ConversationType.SAVE,
    //     callType: CallType.REQUEST,
    //     payload: '',
    //     sender: Sender.FLUTTER,
    //     sentAt: new Date().getTime(),
    //   };

    //   window.parent.postMessage(JSON.stringify(message), '*');
    // };
    // (window as any).setConditionalMappingStatus = (newStatus: boolean) => {
    //   const message: Message = {
    //     conversationID: uuidv4(),
    //     conversationType: ConversationType.CONDITIONAL_MAPPING_STATUS,
    //     callType: CallType.REQUEST,
    //     payload: JSON.stringify(newStatus),
    //     sender: Sender.FLUTTER,
    //     sentAt: new Date().getTime(),
    //   };

    //   window.parent.postMessage(JSON.stringify(message), '*');
    // };
    // (window as any).loadNewTemplate = () => {
    //   const message: Message = {
    //     conversationID: uuidv4(),
    //     conversationType: ConversationType.LOAD_TEMPLATE,
    //     callType: CallType.REQUEST,
    //     payload: JSON.stringify(DEFAULT_TEMPLATE),
    //     sender: Sender.FLUTTER,
    //     sentAt: new Date().getTime(),
    //   };

    //   window.parent.postMessage(JSON.stringify(message), '*');
    // };
    announceReadiness();

    return () => {
      window.removeEventListener('message', onFlutterMessage);
      window.removeEventListener('message', onReactMessage);
      window.removeEventListener('message', updateImageUpload);
    };
  }, []);

  // Return:
  return (
    <ConversationManagerContext.Provider
      value={{
        acknowledgeAndEndConversation,
        doesFlutterKnowThatReactIsReady,
        getTemplate,
        requestTemplateSave,
        registerEventHandlers,
        sendMessageToFlutter,
        enablePublish,
        enableSave,
        exitConditionalMapping,
      }}
    >
      {children}
    </ConversationManagerContext.Provider>
  );
};

// Exports:
export { ConversationManagerContext, ConversationManagerProvider };
