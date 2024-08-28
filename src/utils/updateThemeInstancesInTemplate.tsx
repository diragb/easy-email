// Packages:
import { cloneDeep } from 'lodash';

// Typescript:
import { Node } from './gridShiftBackgroundImageFromSectionToColumn';
import { Palette, Typography } from 'template-theme-manager';

// Functions:
const doesTextContainThemeInstances = (textNode: Node) => {
  return (
    textNode.attributes['data-typography'] ||
    textNode.attributes['data-color-palette-tree'] ||
    textNode.attributes['data-background-color-palette-tree']
  );
};

const updateThemeInstances = (textNode: Node, { typography, palettes }: { typography: Typography[], palettes: Palette[]; }) => {
  if (textNode.attributes['data-typography']) {
    const styling = typography.find(typographyItem => typographyItem.name === textNode.attributes['data-typography']);
    textNode.attributes['font-family'] = styling?.fontFamily ?? textNode.attributes['font-family'];
    textNode.attributes['font-size'] = styling?.fontSize ?? textNode.attributes['font-size'];
    textNode.attributes['font-weight'] = styling?.fontWeight ?? textNode.attributes['font-weight'];
  }

  if (textNode.attributes['data-color-palette-name']) {
    const paletteIndex = palettes.findIndex(palette => palette.name === textNode.attributes['data-color-palette-name']);

    if (paletteIndex !== -1 && textNode.attributes['data-color-palette-color-name']) {
      const colorIndex = palettes[paletteIndex].colors.findIndex(color => color.name === textNode.attributes['data-color-palette-color-name']);

      textNode.attributes['data-color-palette-tree'] = `-${paletteIndex}-${colorIndex}`;
      textNode.attributes['data-color-palette-color-code'] = palettes?.[paletteIndex]?.colors?.[colorIndex]?.color ?? textNode.attributes['data-color-palette-color-code'];
      textNode.attributes['color'] = palettes?.[paletteIndex]?.colors?.[colorIndex]?.color ?? textNode.attributes['color'];
    }
  }

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
}) => {
  const typography = template.themeSettings.typography ?? [] as Typography[];
  const palettes = template.themeSettings.palettes ?? [] as Palette[];
  const content = JSON.parse(template.content);

  const findTextInNode = (node: Node) => {
    if (['advanced_text', 'text'].includes(node.type)) {
      if (doesTextContainThemeInstances(node)) {
        const transformedTextNode = updateThemeInstances(cloneDeep(node), { typography, palettes });
        return transformedTextNode;
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
    content: JSON.stringify(findTextInNode(content)),
    themeSettings: template.themeSettings,
  };
};

// Exports:
export default updateThemeInstancesInTemplate;
