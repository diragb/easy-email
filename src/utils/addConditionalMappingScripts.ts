// Packages:
import { fieldConditions, getConditionalMappingConditions, operators } from 'conditional-mapping-manager';

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
    let conditionScript = `const element = document.querySelector('[data-id="${condition.id}"]');`;
    let conditionToEvaluate = '';

    for (const field of condition.fields) {
      if (field.operator === '') continue;
      let fieldStatement = `data['${field.attribute}']`;
      const symbol = getSymbolFromOperator(field.operator);
      if (['is null', 'is not null'].includes(field.operator)) {
        fieldStatement = `${fieldStatement} ${symbol}`;
      } else {
        // TODO: This can be another attribute. In which case, extend this in the future.
        fieldStatement = `${fieldStatement} ${symbol} '${field.value}'`;
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

    const attributeEntries = Object.entries(condition.attributes);
    let attributeEvaluations = '';
    for (const attributeEntry of attributeEntries) {
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

      // Don't evaluate data tags.
      if (attributeEntry[0].split('-')[0] === 'data') continue;

      const normalizeAttributeKey = attributeEntry[0].split('-').length > 1 ? attributeEntry[0].split('-').reduce((acc, cur, idx) => {
        cur = (idx > 0 ? cur[0].toLocaleUpperCase() : cur[0]) + cur.slice(1);
        acc = acc + cur;
        return acc;
      }, '') : attributeEntry[0];

      attributeEvaluations = `${attributeEvaluations} element.style['${normalizeAttributeKey}'] = '${attributeEntry[1]}';`;
    }

    conditionToEvaluate = conditionToEvaluate.trim();
    attributeEvaluations = attributeEvaluations.trim();
    conditionScript = conditionScript + ` const evaluationResult = new Function('data', \`return (${conditionToEvaluate});\`)(data); if (evaluationResult) { ${attributeEvaluations} }`;

    conditionScripts.push(conditionScript);
  }

  const conditionsScriptArrayString = `[${conditionScripts.map(conditionScript => `'${window.btoa(conditionScript)}'`).join(', ')}]`;

  const script = document.createElement('script');
  script.textContent = `const applyConditionalMapping = (data) => { const evalStrings = ${conditionsScriptArrayString}; for (const evalString of evalStrings) { new Function('data', window.atob(evalString))(data); } }; window.applyConditionalMapping = applyConditionalMapping;`;

  const xbody = container.getElementsByTagName('x-body');
  xbody[0]?.appendChild(script);
  const finalHTML = container.innerHTML;

  document.body.removeChild(container);
  return finalHTML;
};

// Exports:
export default addConditionalMappingScripts;
