// Packages:
import { cloneDeep } from 'lodash';

// Typescript:
import { Node } from './gridShiftBackgroundImageFromSectionToColumn';
import type { LibraryImage, Palette, StaticText, Typography } from 'template-theme-manager';

// Functions:
const doesTextContainThemeInstances = (textNode: Node) => {
  return (
    textNode.attributes['data-typography'] ||
    textNode.attributes['data-color-palette-tree'] ||
    textNode.attributes['data-background-color-palette-tree']
  );
};

const updateThemeInstances = (
  textNode: Node,
  {
    typography,
    palettes,
    staticText,
  }: {
    typography: Typography[];
    palettes: Palette[];
    staticText: StaticText[];
  }) => {
  // Static Text:
  if (textNode.attributes['data-static-text']) {
    const _staticText = staticText.find(_staticText => _staticText.name === textNode.attributes['data-static-text']);
    if (_staticText) {
      textNode.attributes['data-typography'] = _staticText.typographyName;
      textNode.data.value.content = _staticText.text;
    }
  }

  // Typography:
  if (textNode.attributes['data-typography']) {
    const styling = typography.find(typographyItem => typographyItem.name === textNode.attributes['data-typography']);
    textNode.attributes['font-family'] = styling?.fontFamily ?? textNode.attributes['font-family'];
    textNode.attributes['font-size'] = styling?.fontSize ?? textNode.attributes['font-size'];
    textNode.attributes['font-weight'] = styling?.fontWeight ?? textNode.attributes['font-weight'];
  }

  // Text Color:
  console.log(textNode.attributes['data-color-palette-name']);
  if (textNode.attributes['data-color-palette-name']) {
    const paletteIndex = palettes.findIndex(palette => palette.name === textNode.attributes['data-color-palette-name']);

    console.log(paletteIndex);
    if (paletteIndex !== -1 && textNode.attributes['data-color-palette-color-name']) {
      const colorIndex = palettes[paletteIndex].colors.findIndex(color => color.name === textNode.attributes['data-color-palette-color-name']);
      console.log(colorIndex);

      textNode.attributes['data-color-palette-tree'] = `-${paletteIndex}-${colorIndex}`;
      console.log(`-${paletteIndex}-${colorIndex}`, textNode.attributes['data-color-palette-tree']);
      textNode.attributes['data-color-palette-color-code'] = palettes?.[paletteIndex]?.colors?.[colorIndex]?.color ?? textNode.attributes['data-color-palette-color-code'];
      textNode.attributes['color'] = palettes?.[paletteIndex]?.colors?.[colorIndex]?.color ?? textNode.attributes['color'];
    }
  }

  // Background Color:
  if (textNode.attributes['data-background-color-palette-name']) {
    const paletteIndex = palettes.findIndex(palette => palette.name === textNode.attributes['data-background-color-palette-name']);

    if (paletteIndex !== -1 && textNode.attributes['data-background-color-palette-color-name']) {
      const colorIndex = palettes[paletteIndex].colors.findIndex(color => color.name === textNode.attributes['data-background-color-palette-color-name']);

      textNode.attributes['data-background-color-palette-tree'] = `-${paletteIndex}-${colorIndex}`;
      textNode.attributes['data-background-color-palette-color-code'] = palettes?.[paletteIndex]?.colors?.[colorIndex]?.color ?? textNode.attributes['data-background-color-palette-color-code'];
      textNode.attributes['container-background-color'] = palettes?.[paletteIndex]?.colors?.[colorIndex]?.color ?? textNode.attributes['container-background-color'];
    }
  }

  return textNode;
};

const updateThemeInstancesInTemplate = (template: {
  type: string;
  content: string;
  themeSettings: Record<string, any>;
}, styleConfig: {
  typography?: Typography[];
  palettes?: Palette[];
  images?: LibraryImage[];
  staticText?: StaticText[];
}) => {
  const content = JSON.parse(template.content);

  const findTextInNode = (node: Node) => {
    if (['advanced_text', 'text'].includes(node.type)) {
      if (doesTextContainThemeInstances(node)) {
        const transformedTextNode = updateThemeInstances(
          cloneDeep(node), {
          typography: styleConfig.typography ?? [],
          palettes: styleConfig.palettes ?? [],
          staticText: styleConfig.staticText ?? [],
        }
        );
        return transformedTextNode;
      }

      return node;
    } else if (['advanced_image', 'image'].includes(node.type)) {
      if (node.attributes['data-image-name']) {
        const isUploadedImage = node.attributes['data-is-uploaded-image'] ?? false;
        const image = styleConfig.images?.find(image => image.name === node.attributes['data-image-name']);
        if (image && !isUploadedImage) {
          node.attributes['src'] = image.url;
        }
      }

      return node;
    } else if (['advanced_wrapper', 'wrapper', 'advanced_section', 'section'].includes(node.type)) {
      if (node.attributes['data-background-image-name']) {
        const isUploadedImage = node.attributes['data-is-uploaded-image'] ?? false;
        const image = styleConfig.images?.find(image => image.name === node.attributes['data-background-image-name']);
        if (image && !isUploadedImage) {
          node.attributes['background-url'] = image.url;
        }
      }

      return node;
    } else {
      node = {
        ...node,
        children: ((node.children ?? []) as Node[]).map(node => findTextInNode(node))
      };
      return node;
    }
  };

  return {
    type: template.type,
    content: JSON.stringify(findTextInNode(content)),
    themeSettings: template.themeSettings,
  };
};

// Exports:
export default updateThemeInstancesInTemplate;
