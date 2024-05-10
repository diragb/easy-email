// Functions:
const stylizeGridColumn = (html: string) => {
  if (!html.includes('data-type="grid-column"')) return html;

  const container = document.createElement('div');
  container.id = 'stylize-column-html';
  container.style.position = 'absolute';
  container.style.left = '-9999px';

  container.innerHTML = html;
  document.body.appendChild(container);

  const columnElements = document.querySelectorAll('[data-type="grid-column"]');

  columnElements.forEach(columnElement => {
    if (!columnElement) return html;

    const backgroundImageStyles = {
      'background-position': columnElement.attributes['data-background-position'].value,
      'background-repeat': columnElement.attributes['data-background-repeat'].value,
      'background-size': columnElement.attributes['data-background-size'].value,
      'background-image': columnElement.attributes['data-background-url'].value ? `url(${columnElement.attributes['data-background-url'].value})` : '',
    };

    (columnElement as HTMLElement).style.setProperty('background', `${backgroundImageStyles['background-image']} ${backgroundImageStyles['background-position']} / ${backgroundImageStyles['background-size']} ${backgroundImageStyles['background-repeat']}`);
    (columnElement as HTMLElement).style.setProperty('background-position', backgroundImageStyles['background-position']);
    (columnElement as HTMLElement).style.setProperty('background-repeat', backgroundImageStyles['background-repeat']);
    (columnElement as HTMLElement).style.setProperty('background-size', backgroundImageStyles['background-size']);
    (columnElement as HTMLElement).style.setProperty('background-image', backgroundImageStyles['background-image']);
  });

  const finalHTML = container.innerHTML;

  document.body.removeChild(container);
  return finalHTML;
};

// Exports:
export default stylizeGridColumn;
