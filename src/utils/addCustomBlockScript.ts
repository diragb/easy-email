// Functions:
const addCustomBlockScript = (html: string) => {
  const container = document.createElement('div');
  container.id = 'custom-block';
  container.style.position = 'absolute';
  container.style.left = '-9999px';

  container.innerHTML = html;
  document.body.appendChild(container);

  const script = document.createElement('script');
  script.textContent = `const generateRandomClassName = () => {
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const allChars = lowercaseChars + uppercaseChars + numbers;

  const minLength = 5;
  const maxLength = 10;

  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

  let className = (lowercaseChars + uppercaseChars)[Math.floor(Math.random() * (lowercaseChars.length + uppercaseChars.length))];

  for (let i = 1; i < length; i++) {
    className += allChars[Math.floor(Math.random() * allChars.length)];
  }

  const timestamp = Date.now();
  className += '_' + timestamp;

  return className;
}

const defineCustomBlock = (id, code) => {
  const name = generateRandomClassName();
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
      const attributes = Object.entries(this.dataset ?? {}).reduce((array, entry) => ({
        ...array,
        ['data-' + entry[0].split(/(?=[A-Z])/).join('-').toLowerCase()]: entry[1]
      }), {});
      this.shadowRoot.innerHTML = new Function('attributes', window.atob("\${code}"))(attributes);
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
