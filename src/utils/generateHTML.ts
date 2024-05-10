// Packages:
import { JsonToMjml } from 'easy-email-core';
import mjml2html from 'mjml-browser';

// Typescript:
import { IEmailTemplate } from 'easy-email-editor';
import { Message } from '@arco-design/web-react';
import gridShiftBackgroundImageFromSectionToColumn from './gridShiftBackgroundImageFromSectionToColumn';

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

const generateHTML = (templateData: IEmailTemplate, attributes: Record<string, string>) => {
  sessionStorage.setItem('isExporting', JSON.stringify(true));
  const templateContent = gridShiftBackgroundImageFromSectionToColumn(templateData);

  const mjmlString = JsonToMjml({
    data: templateContent,
    mode: 'production',
    context: templateContent,
    dataSource: attributes,
  });
  sessionStorage.setItem('isExporting', JSON.stringify(false));

  const rawHTML = mjml2html(mjmlString, {}).html;
  const html = unwrapMJMLEncodedData(sanitizeRawHTMLTags(rawHTML));

  return html;
};

// Exports:
export default generateHTML;
