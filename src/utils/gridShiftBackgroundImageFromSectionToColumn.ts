// Packages:
import { cloneDeep, omit } from 'lodash';

// Typescript:
import { IEmailTemplate } from 'easy-email-editor';

interface Node {
  attributes: Record<string, string>;
  children: Node[];
  data: {
    value: Record<string, string>;
  };
  type: string;
}

// Functions:
const doesGridContainSectionContainsColumn = (gridNode: Node) => {
  if (['advanced_section', 'section'].includes(gridNode.children?.[0]?.type)) {
    if (['advanced_column', 'column'].includes(gridNode.children?.[0]?.children?.[0]?.type)) {
      return true;
    } else return false;
  } else return false;
};

const transferSectionBackgroundStylingToColumn = (gridNode: Node) => {
  const sectionNode = gridNode.children?.[0];
  const columnNode = gridNode.children?.[0]?.children?.[0];
  if (!columnNode) return gridNode;

  const backgroundImageDataAttributes = {
    'data-background-position': sectionNode.attributes?.['background-position'] ?? 'top center',
    'data-background-repeat': sectionNode.attributes?.['background-repeat'] ?? 'no-repeat',
    'data-background-size': sectionNode.attributes?.['background-size'] ?? 'contain',
    'data-background-url': sectionNode.attributes?.['background-url'] ?? '',
    'data-type': 'grid-column',
  };

  sectionNode.attributes = {
    ...omit(sectionNode.attributes, [
      'background-position',
      'background-repeat',
      'background-size',
      'background-url',
      'css-class',
    ]),
    'css-class': (sectionNode.attributes['css-class'] ?? '') + `contains-condensed-mjml-encoding <condensed-mjml-encoding>${window.btoa(JSON.stringify({ 'data-type': 'grid-section' }))}</condensed-mjml-encoding>`,
  };

  columnNode.attributes = {
    ...omit(columnNode.attributes, ['css-class']),
    ...backgroundImageDataAttributes,
    'css-class': (columnNode.attributes['css-class'] ?? '') + `contains-condensed-mjml-encoding <condensed-mjml-encoding>${window.btoa(JSON.stringify(backgroundImageDataAttributes))}</condensed-mjml-encoding>`,
  };

  return gridNode;
};

const gridShiftBackgroundImageFromSectionToColumn = (templateData: IEmailTemplate) => {
  const content = cloneDeep(templateData.content);

  // Functions:
  const findGridInNode = (node: Node) => {
    if (['advanced_grid', 'grid'].includes(node.type)) {
      if (doesGridContainSectionContainsColumn(node)) {
        const transformedGridNode = transferSectionBackgroundStylingToColumn(cloneDeep(node));
        return transformedGridNode;
      }

      return node;
    } else {
      node = {
        ...node,
        children: ((node.children ?? []) as Node[]).map(node => findGridInNode(node))
      };
      return node;
    }
  };

  return findGridInNode(content as Node);
};

// Exports:
export default gridShiftBackgroundImageFromSectionToColumn;
