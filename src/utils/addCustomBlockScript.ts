// Functions:
const addCustomBlockScript = (html: string) => {
  const container = document.createElement('div');
  container.id = 'custom-block';
  container.style.position = 'absolute';
  container.style.left = '-9999px';

  container.innerHTML = html;
  document.body.appendChild(container);

  const script = document.createElement('script');
  script.textContent = `const defineCustomBlock = (id, name, script) => {
  const customElementClassName = new Function(\`return class \${name} extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
      const observer = new MutationObserver((mutationRecords) => {
        mutationRecords.forEach(record => {
          this.render();
        });
      }).observe(this, { attributes: true });
      this.render();
    }

    render () {
      const attributes = Object.entries(this.dataset ?? {}).reduce((array, entry) => ({ ...array, ['data-' + entry[0]]: entry[1]}), {});
      this.shadowRoot.innerHTML = new Function('attributes', window.atob("\${script}"))(attributes);
    }
  }\`)();

  try {
    customElements.define(id, customElementClassName);
  } catch (error) {
    console.error(error);
  }
}
`;

  const xhead = container.getElementsByTagName('x-head');
  xhead[0]?.appendChild(script);

  const finalHTML = container.innerHTML;

  document.body.removeChild(container);
  return finalHTML;
};

// Exports:
export default addCustomBlockScript;
