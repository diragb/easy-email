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
  typographyName: string;
}

export interface CustomFont {
  name: string;
  src: string;
};

export interface TemplateTheme {
  typography: Typography[];
  palettes: Palette[];
  images: LibraryImage[];
  staticText: StaticText[];
  customFonts: CustomFont[];
}

// Constants:
export const DEFAULT_TEMPLATE_THEME = {
  typography: [],
  palettes: [],
  images: [],
  staticText: [],
  customFonts: [],
} as TemplateTheme;

export const DEFAULT_USED_TEMPLATE_THEME = {
  typography: [],
  palettes: [],
  paletteColors: {
    textColor: [],
    backgroundColor: [],
  },
  images: [],
  staticText: [],
  customFonts: [],
} as UsedTemplateTheme;

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

// For usedStyleConfig:
export type Used<T> = T & { usedIn: string[]; };

// Stores palette and color in `palette.color` format.
export interface UsedPaletteColor {
  paletteColor: string;
}

export interface UsedTemplateTheme {
  typography: Used<Typography>[];
  paletteColors: {
    textColor: Used<UsedPaletteColor>[];
    backgroundColor: Used<UsedPaletteColor>[];
  };
  palettes: Palette[];
  images: Used<LibraryImage>[];
  staticText: Used<StaticText>[];
  customFonts: Used<CustomFont>[];
}

export const getSafeUsedTemplateTheme = () => {
  const savedUsedTemplateTheme = sessionStorage.getItem('used-template-theme');

  if (savedUsedTemplateTheme === null) return JSON.stringify(DEFAULT_USED_TEMPLATE_THEME);
  if (savedUsedTemplateTheme === 'undefined') return JSON.stringify(DEFAULT_USED_TEMPLATE_THEME);
  return savedUsedTemplateTheme;
};

export const getUsedTemplateTheme = () => JSON.parse(getSafeUsedTemplateTheme()) as UsedTemplateTheme;

export const setUsedTemplateTheme = (callback: (_usedTemplateTheme: UsedTemplateTheme) => UsedTemplateTheme) => {
  const _usedTemplateTheme = cloneDeep(getUsedTemplateTheme());
  const newUsedTemplateTheme = callback(_usedTemplateTheme);
  sessionStorage.setItem('used-template-theme', JSON.stringify(newUsedTemplateTheme));
  window.postMessage(JSON.stringify({ usedTemplateTheme: newUsedTemplateTheme }), '*');
};
