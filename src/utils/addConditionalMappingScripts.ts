// Packages:
import {
  fieldConditions,
  getConditionalMappingCSS,
  getConditionalMappingConditions,
  getConditionalMappingJavascript,
  operators
} from 'conditional-mapping-manager';
import { AdvancedType } from 'easy-email-core';

// Functions:
const getSymbolFromOperator = (operator: typeof operators[number]) => {
  switch (operator) {
    case 'equals': return '===';
    case 'not equals': return '!==';
    case 'greater than': return '>';
    case 'greater than or equal to': return '>=';
    case 'less than': return '<';
    case 'less than or equal to': return '<=';
    case 'is not null': return '!== null';
    case 'is null': return '=== null';
    default: return '===';
  }
};

const getSymbolFromFieldCondition = (fieldCondition: typeof fieldConditions[number]) => {
  switch (fieldCondition) {
    case 'and': return '&&';
    case 'not': return '!';
    case 'or': return '||';
    default: return '';
  }
};

const addConditionalMappingJavascript = (container: HTMLDivElement) => {
  const xbody = container.getElementsByTagName('x-body');
  const javascriptString = getConditionalMappingJavascript();

  const script = document.createElement('script');
  script.textContent = javascriptString;

  xbody[0]?.appendChild(script);
};

const addConditionalMappingCSS = (container: HTMLDivElement) => {
  const xhead = container.getElementsByTagName('x-head');
  const CSSString = getConditionalMappingCSS();

  const style = document.createElement('style');
  style.textContent = CSSString;
  xhead[0]?.appendChild(style);
};

const recursiveStyleApplication = `const recursiveStyleApplication = (element, styles) => { Object.entries(styles).forEach(([property, value]) => { element.style.setProperty(property, value); }); for (let child of element.children) { recursiveStyleApplication(child, styles); } };`;

const filterNonEmptyValues = `const filterNonEmptyValues = (targetObject) => Object.fromEntries(Object.entries(targetObject).filter(([_, value]) => value !== ''));`;

const addIndexToGridDataSourceReference = (dataSourceReference: string) => {
  const referenceBits = dataSourceReference.split('.');
  const dataSource = referenceBits[0];
  referenceBits.shift();
  let finalReference = `data['${dataSource}'][index]` + referenceBits.reduce((acc, cur) => {
    acc = acc + `['${cur}']`;
    return acc;
  }, '');
  return finalReference;
};

const addConditionalMappingScripts = (html: string) => {
  const conditions = getConditionalMappingConditions();
  if (conditions.length === 0) return html;

  const container = document.createElement('div');
  container.id = 'conditional-mapping';
  container.style.position = 'absolute';
  container.style.left = '-9999px';

  container.innerHTML = html;
  document.body.appendChild(container);

  // Operations
  let conditionScripts: string[] = [];
  for (const condition of conditions) {
    let conditionScript = `const elements = document.querySelectorAll('[data-id="${condition.id}"]');`;
    conditionScript = `${conditionScript} elements.forEach((element, index) => {`;
    let conditionToEvaluate = '';

    // NOTE: Building the condition fields string here.
    for (const field of condition.fields) {
      if (field.operator === '') continue;
      const doesFieldAttributeReferenceGridDataSource = field.attribute.includes('.');
      const doesFieldValueReferenceGridDataSource = field.isValueAnAttribute && field.value?.includes('.');

      let fieldStatement = doesFieldAttributeReferenceGridDataSource ? addIndexToGridDataSourceReference(field.attribute) : `data['${field.attribute}']`;
      const symbol = getSymbolFromOperator(field.operator);
      if (['is null', 'is not null'].includes(field.operator)) {
        fieldStatement = `${fieldStatement} ${symbol}`;
      } else {
        if (typeof field.value === 'string') {
          if (field.isValueAnAttribute) {
            const wrappedFieldValue = doesFieldValueReferenceGridDataSource ? addIndexToGridDataSourceReference(field.value) : `data['${field.value}']`;
            fieldStatement = `${fieldStatement} ${symbol} ${wrappedFieldValue}`;
          } else fieldStatement = `${fieldStatement} ${symbol} '${field.value}'`;
        }
      }

      if (field.condition) {
        const fieldCondition = getSymbolFromFieldCondition(field.condition);

        if (field.condition !== 'not' && condition.fields.length > 1) {
          fieldStatement = `${fieldCondition} (${fieldStatement})`;
        } else if (field.condition === 'not') {
          fieldStatement = `&& ${fieldCondition}(${fieldStatement})`;
        }
      }

      conditionToEvaluate = conditionToEvaluate + ' ' + fieldStatement;
    }

    // NOTE: Building the attribute evaluations string here.
    const attributeEntries = Object.entries(condition.attributes);
    let attributeEvaluations = '';
    for (const attributeEntry of attributeEntries) {
      // Don't evaluate data tags.
      if (attributeEntry[0].split('-')[0] === 'data') continue;

      // Don't evaluate entries with no value.
      if (attributeEntry[1].trim().length === 0) continue;

      if (attributeEntry[0] === 'container-background-color') {
        attributeEvaluations = `${attributeEvaluations} element.style['backgroundColor'] = '${attributeEntry[1]}';`;
        continue;
      }

      if (attributeEntry[0] === 'align') {
        attributeEvaluations = `${attributeEvaluations} element.style['textAlign'] = '${attributeEntry[1]}';`;
        continue;
      }

      const normalizeAttributeKey = attributeEntry[0].split('-').length > 1 ? attributeEntry[0].split('-').reduce((acc, cur, idx) => {
        cur = (idx > 0 ? cur[0].toLocaleUpperCase() : cur[0]) + cur.slice(1);
        acc = acc + cur;
        return acc;
      }, '') : attributeEntry[0];

      attributeEvaluations = `${attributeEvaluations} element.style['${normalizeAttributeKey}'] = '${attributeEntry[1]}';`;
    }

    // NOTE: Building the depth attribute.
    let depthAttributeEvaluator = `if (['${AdvancedType.TEXT}'].includes(element.dataset['blockType'])) { const parentStyle = filterNonEmptyValues(element.style); for (let child of element.children) { recursiveStyleApplication(child, parentStyle); } }`;
    attributeEvaluations = `${attributeEvaluations} ${depthAttributeEvaluator}`;

    conditionToEvaluate = conditionToEvaluate.trim();
    attributeEvaluations = attributeEvaluations.trim();
    conditionScript = conditionScript + ` const evaluationResult = new Function('data', 'index', \`return (${conditionToEvaluate});\`)(data, index); if (evaluationResult) { ${attributeEvaluations} } });`;

    conditionScripts.push(conditionScript);
  }

  const conditionsScriptArrayString = `[${conditionScripts.map(conditionScript => `'${window.btoa(conditionScript)}'`).join(', ')}]`;

  const script = document.createElement('script');
  script.textContent = `${recursiveStyleApplication} ${filterNonEmptyValues} const applyConditionalMapping = (data) => { const evalStrings = ${conditionsScriptArrayString}; for (const evalString of evalStrings) { new Function('data', window.atob(evalString))(data); } }; window.applyConditionalMapping = applyConditionalMapping;`;

  const xbody = container.getElementsByTagName('x-body');
  xbody[0]?.appendChild(script);

  addConditionalMappingJavascript(container);
  addConditionalMappingCSS(container);

  const finalHTML = container.innerHTML;

  document.body.removeChild(container);
  return finalHTML;
};

// Exports:
export default addConditionalMappingScripts;
