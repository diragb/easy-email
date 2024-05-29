// Packages:
import { JsonToMjml } from 'easy-email-core';
import mjml2html from 'mjml-browser';
import gridShiftBackgroundImageFromSectionToColumn, { Node } from './gridShiftBackgroundImageFromSectionToColumn';
import { cloneDeep } from 'lodash';

// Typescript:
import { IEmailTemplate } from 'easy-email-editor';
import { Message } from '@arco-design/web-react';

// Functions:
const MJMLEncodedDataToHTMLAttributesObject = (MJMLEncodedData: string): Record<string, string> => {
  let HTMLAttributesObject = {};
  const data = JSON.parse(MJMLEncodedData);

  for (const datum of Object.entries(data)) {
    HTMLAttributesObject[datum[0]] = datum[1];
  }

  return HTMLAttributesObject;
};

const unwrapMJMLEncodedData = (encodedHTML: string) => {
  const REGEX = /<condensed-mjml-encoding>(.*?)<\/condensed-mjml-encoding>/g;
  let match: RegExpExecArray | null;

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.innerHTML = encodedHTML;
  document.body.appendChild(container);

  const elements = container.getElementsByClassName('contains-condensed-mjml-encoding');

  for (const element of elements) {
    let attributesObject: Record<string, string> | null = null;
    for (const classString of element.classList) {
      match = REGEX.exec(classString);
      if (match === null) continue;
      const MJMLEncodedData = window.atob(match[1]);
      attributesObject = MJMLEncodedDataToHTMLAttributesObject(MJMLEncodedData);
    }

    if (attributesObject) {
      for (const attributeEntry of Object.entries(attributesObject)) {
        element.setAttribute(attributeEntry[0], attributeEntry[1]);
      }
    }
  }

  const gridElements = document.querySelectorAll('[data-type="grid"]');
  gridElements.forEach(gridElement => {
    const dataSource = gridElement.attributes['data-source']?.value;

    if (typeof dataSource !== 'string') {
      document.body.removeChild(container);
      Message.error('Grid blocks must have a valid data source!');
      throw new Error('Grid blocks must have a valid data source!');
    }
  });

  const finalHTML = container.innerHTML;

  document.body.removeChild(container);
  return finalHTML;
};

const sanitizeRawHTMLTags = (rawHTML: string) => {
  rawHTML = rawHTML
    .replace(/<html/g, '<x-html')
    .replace('</html>', '</x-html>')
    .replace(/<head/g, '<x-head')
    .replace('</head>', '</x-head>')
    .replace(/<body/g, '<x-body')
    .replace('</body>', '</x-body>');
  return rawHTML;
};

export const unsanitizeHTMLTags = (sanitizedHTML: string) => {
  sanitizedHTML = sanitizedHTML
    .replace(/<x-html/g, '<html')
    .replace('</x-html>', '</html>')
    .replace(/<x-head/g, '<head')
    .replace('</x-head>', '</head>')
    .replace(/<x-body/g, '<body')
    .replace('</x-body>', '</body>');

  return '<!doctype html>' + sanitizedHTML;
};

const replaceThemeInstancesWithEncoding = (_templateContent: Node) => {
  const content = cloneDeep(_templateContent);

  // Functions:
  const findThemeInstancesInNode = (node: Node) => {
    if (node.attributes?.['data-background-image-name']) {
      const transformedNode = cloneDeep(node);

      const backgroundImageName = transformedNode.attributes?.['data-background-image-name'];
      if (backgroundImageName) {
        const encodedBackgroundImageName = backgroundImageName.toLocaleLowerCase().split(' ').join('_');
        transformedNode.attributes['background-url'] = `@@image-library.${encodedBackgroundImageName}@@`;
      }

      return transformedNode;
    } if (['advanced_image', 'image'].includes(node.type)) {
      const transformedNode = cloneDeep(node);

      const imageName = transformedNode.attributes?.['data-image-name'];
      if (imageName) {
        const encodedImageName = imageName.toLocaleLowerCase().split(' ').join('_');
        transformedNode.attributes['src'] = `@@image-library.${encodedImageName}@@`;
      }

      return transformedNode;
    } if (['advanced_text', 'text'].includes(node.type)) {
      const transformedNode = cloneDeep(node);

      // Text Color:
      const paletteName = transformedNode.attributes?.['data-color-palette-name'];
      const colorName = transformedNode.attributes?.['data-color-palette-color-name'];
      if (paletteName && colorName) {
        const encodedPaletteName = paletteName.toLocaleLowerCase().split(' ').join('_');
        const encodedColorName = colorName.toLocaleLowerCase().split(' ').join('_');
        transformedNode.attributes['color'] = `@@${encodedPaletteName}.${encodedColorName}@@`;
      }

      // Background Color:
      const backgroundPaletteName = transformedNode.attributes?.['data-background-color-palette-name'];
      const backgroundPolorName = transformedNode.attributes?.['data-background-color-palette-color-name'];
      if (paletteName && colorName) {
        const encodedBackgroundPaletteName = backgroundPaletteName.toLocaleLowerCase().split(' ').join('_');
        const encodedBackgroundColorName = backgroundPolorName.toLocaleLowerCase().split(' ').join('_');
        transformedNode.attributes['container-background-color'] = `@@${encodedBackgroundPaletteName}.${encodedBackgroundColorName}@@`;
      }

      // Typography:
      const typography = transformedNode.attributes?.['data-typography'];
      if (typography) {
        const encodedTypography = typography.toLocaleLowerCase().split(' ').join('_');
        transformedNode.attributes['font-family'] = `@@${encodedTypography}.font-family@@`;
        transformedNode.attributes['font-size'] = `@@${encodedTypography}.font-size@@`;
        transformedNode.attributes['font-weight'] = `@@${encodedTypography}.font-weight@@`;
      }

      // Static Text:
      const staticTextName = transformedNode.attributes?.['data-static-text'];
      if (staticTextName) {
        const encodedStaticTextName = staticTextName.toLocaleLowerCase().split(' ').join('_');
        transformedNode.data.value.content = `@@static_text.${encodedStaticTextName}@@`;
      }

      return transformedNode;
    } else {
      node = {
        ...node,
        children: ((node.children ?? []) as Node[]).map(node => findThemeInstancesInNode(node))
      };
      return node;
    }
  };

  return findThemeInstancesInNode(content);
};

const normalizeGridDataSourceProperties = (templateContent: Node) => {
  const normalizedTemplateContent = cloneDeep(templateContent);

  const findAndModifyGridInNode = (node: Node) => {
    if (['advanced_grid', 'grid'].includes(node.type)) {
      let children = JSON.stringify(node.children);
      const HTMLCaptureRegex = /<input\s+(?:(?:\w+\s*=\s*(?:\\"[^\\"]*\\"|'[^']*'))\s*)*>/gi;
      const valueCaptureRegex = /value=\\"([^\\"]*)\\"/;

      children = children.replace(HTMLCaptureRegex, substring => {
        substring = substring.replace(valueCaptureRegex, valueAttribute => {
          const matchForValue = valueAttribute.match(valueCaptureRegex);
          if (matchForValue?.[1]) {
            let attribute = matchForValue[1];
            if (attribute.includes('.')) {
              const segments = attribute.split('.');
              segments.shift();
              attribute = segments.join('.');
            }
            return `value=\\"${attribute}\\"`;
          } else return valueAttribute;
        });
        return substring;
      });
      node.children = JSON.parse(children);

      return node;
    } else {
      node = {
        ...node,
        children: ((node.children ?? []) as Node[]).map(node => findAndModifyGridInNode(node))
      };
      return node;
    }
  };

  return findAndModifyGridInNode(normalizedTemplateContent);
};

const generateHTML = (templateData: IEmailTemplate, isPreview?: boolean) => {
  sessionStorage.setItem('isExporting', JSON.stringify(true));
  let templateContent = gridShiftBackgroundImageFromSectionToColumn(templateData);
  if (!isPreview) {
    templateContent = replaceThemeInstancesWithEncoding(templateContent);
  }
  const normalizedGridDataPropertiesTemplateData = normalizeGridDataSourceProperties(templateContent);

  const mjmlString = JsonToMjml({
    data: normalizedGridDataPropertiesTemplateData,
    mode: 'production',
  });
  sessionStorage.setItem('isExporting', JSON.stringify(false));

  const rawHTML = mjml2html(mjmlString, {}).html;
  const html = unwrapMJMLEncodedData(sanitizeRawHTMLTags(rawHTML));

  return html;
};

// Exports:
export default generateHTML;
