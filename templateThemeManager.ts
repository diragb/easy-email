// Packages:
import { cloneDeep } from 'lodash';

// Typescript:
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

export interface LibraryImage {
  name: string;
  url: string;
}

export interface StaticText {
  name: string;
  text: string;
}

export interface CustomFont {
  name: string;
  src: string;
}[];

export interface TemplateTheme {
  typography: Typography[];
  palettes: Palette[];
  images: LibraryImage[];
  staticText: StaticText[];
}

// Constants:
export const DEFAULT_TEMPLATE_THEME = {
  typography: [],
  palettes: [],
  images: [],
  staticText: [],
} as TemplateTheme;

// Functions:
const getSafeTemplateTheme = () => {
  const savedTemplateTheme = sessionStorage.getItem('template-theme');

  if (savedTemplateTheme === null) return JSON.stringify(DEFAULT_TEMPLATE_THEME);
  if (savedTemplateTheme === 'undefined') return JSON.stringify(DEFAULT_TEMPLATE_THEME);
  return savedTemplateTheme;
};

export const getTemplateTheme = () => JSON.parse(getSafeTemplateTheme()) as TemplateTheme;

export const setTemplateTheme = (callback: (_templateTheme: TemplateTheme) => TemplateTheme) => {
  const _templateTheme = cloneDeep(getTemplateTheme());
  const newTemplateTheme = callback(_templateTheme);
  sessionStorage.setItem('template-theme', JSON.stringify(newTemplateTheme));
  window.postMessage(JSON.stringify({ templateTheme: newTemplateTheme }), '*');
};

// export const generateUpdateThemeListener = (callback: (newTemplateTheme: TemplateTheme) => void) => (event: MessageEvent<any>) => {
//   try {
//     if (typeof event.data !== 'string') return;
//     if (event.data.trim().length === 0) return;
//     const message = JSON.parse(event.data) as any;
//     callback(message.templateTheme);
//   } catch (error) {
//   }
// };
