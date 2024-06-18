// Packages:
import { IBlockData } from 'easy-email-core';
import { get, cloneDeep } from 'lodash';

// Typescript:
export enum ActionOrigin {
  React,
  EasyEmail,
}

export interface LastBlockModification {
  idx: string;
  attributes: Record<string, string>;
  lastModified: number;
};

export interface ConditionalMappingState {
  isActive: boolean;
  focusIdx: string;
  focusBlock: any;
  templateContent: string;
  lastBlockModification: LastBlockModification;
  conditions: Condition[];
  javascript?: string;
  css?: string;
  enableAddConditionButton: boolean;
}

export const operators = [
  'equals',
  'not equals',
  'greater than',
  'greater than or equal to',
  'less than',
  'less than or equal to',
  'is null',
  'is not null'
] as const;

export const fieldConditions = ['and', 'or', 'not'] as const;

export interface ConditionField {
  attribute: string;
  operator: typeof operators[number] | '';
  value?: string;
  condition?: typeof fieldConditions[number];
  isValueAnAttribute: boolean;
}

export interface Condition {
  id?: string;
  focusIdx: string;
  attributes: Record<string, string>;
  fields: ConditionField[];
}

// Functions:
// Utils:
export const getBlockByIdx = <T extends IBlockData>(
  values: { content: IBlockData; },
  idx: string
): T | null => {
  return get(values, idx);
};

// Getters:
export const getConditionalMappingState = () => JSON.parse(sessionStorage.getItem('conditional-mapping') ?? '{}') as ConditionalMappingState;

export const getConditionalMappingIsActive = () => {
  const conditionalMappingState = getConditionalMappingState();
  const isActive = conditionalMappingState['isActive'] ?? false;

  return isActive;
};

export const getCurrentFocusIdx = () => {
  const conditionalMappingState = getConditionalMappingState();
  const focusIdx = conditionalMappingState['focusIdx'] ?? null;

  return focusIdx;
};

export const getCurrentFocusBlock = () => {
  const conditionalMappingState = getConditionalMappingState();
  const focusBlock = conditionalMappingState['focusBlock'] ?? null;

  return focusBlock;
};

export const getDefaultTemplateContent = () => {
  const conditionalMappingState = getConditionalMappingState();
  const templateContent = JSON.parse(conditionalMappingState['templateContent']) ?? null;

  return templateContent;
};

export const getLastBlockModification = () => {
  const conditionalMappingState = getConditionalMappingState();
  const lastBlockModification = conditionalMappingState['lastBlockModification'] ?? null;

  return lastBlockModification;
};

export const getConditionalMappingConditions = () => {
  const conditionalMappingState = getConditionalMappingState();
  const conditions = conditionalMappingState['conditions'] ?? [];

  return conditions;
};

export const getEnableAddConditionButton = () => {
  const conditionalMappingState = getConditionalMappingState();
  const enableAddConditionButton = !!conditionalMappingState['enableAddConditionButton'];

  return enableAddConditionButton;
};

export const getConditionalMappingJavascript = () => {
  const conditionalMappingState = getConditionalMappingState();
  const javascript = conditionalMappingState['javascript'] ?? '';

  return javascript;
};

export const getConditionalMappingCSS = () => {
  const conditionalMappingState = getConditionalMappingState();
  const css = conditionalMappingState['css'] ?? '';

  return css;
};

// Setters:
export const setConditionalMappingState = (origin: ActionOrigin, callback: (_conditionalMappingState: ConditionalMappingState) => ConditionalMappingState) => {
  const _conditionalMappingState = cloneDeep(getConditionalMappingState());
  const _newConditionalMappingState = callback(_conditionalMappingState);
  sessionStorage.setItem('conditional-mapping', JSON.stringify(_newConditionalMappingState));
  window.postMessage(JSON.stringify({ origin, type: 'conditional-mapping', subtype: '*', conditionalMappingState: _newConditionalMappingState }), '*');
};

export const setConditionalMappingIsActive = (origin: ActionOrigin, _isActive: boolean) => {
  const _conditionalMappingState = cloneDeep(getConditionalMappingState());
  const _newConditionalMappingState = {
    ..._conditionalMappingState,
    isActive: _isActive,
  };
  sessionStorage.setItem('conditional-mapping', JSON.stringify(_newConditionalMappingState));
  window.postMessage(JSON.stringify({ origin, type: 'conditional-mapping', subtype: 'is-active', conditionalMappingState: _newConditionalMappingState }), '*');
};

export const setCurrentFocusIdx = (origin: ActionOrigin, newFocusIdx: string) => {
  const _conditionalMappingState = cloneDeep(getConditionalMappingState());
  const _newConditionalMappingState = {
    ..._conditionalMappingState,
    focusIdx: newFocusIdx,
  };
  sessionStorage.setItem('conditional-mapping', JSON.stringify(_newConditionalMappingState));
  window.postMessage(JSON.stringify({ origin, type: 'conditional-mapping', subtype: 'focus-idx', conditionalMappingState: _newConditionalMappingState }), '*');
};

export const setCurrentFocusBlock = (origin: ActionOrigin, newFocusBlock: any) => {
  const _conditionalMappingState = cloneDeep(getConditionalMappingState());
  const _newConditionalMappingState = {
    ..._conditionalMappingState,
    focusBlock: newFocusBlock,
  };
  sessionStorage.setItem('conditional-mapping', JSON.stringify(_newConditionalMappingState));
  window.postMessage(JSON.stringify({ origin, type: 'conditional-mapping', subtype: 'focus-block', conditionalMappingState: _newConditionalMappingState }), '*');
};

export const setDefaultTemplateContent = (origin: ActionOrigin, templateContent: string) => {
  const _conditionalMappingState = cloneDeep(getConditionalMappingState());
  const _newConditionalMappingState = {
    ..._conditionalMappingState,
    templateContent,
  };
  sessionStorage.setItem('conditional-mapping', JSON.stringify(_newConditionalMappingState));
  window.postMessage(JSON.stringify({ origin, type: 'conditional-mapping', subtype: 'template-content', conditionalMappingState: _newConditionalMappingState }), '*');
};

export const setLastBlockModification = (origin: ActionOrigin, lastBlockModification: Pick<LastBlockModification, 'idx' | 'attributes'> & { isReset?: boolean; }) => {
  const _conditionalMappingState = cloneDeep(getConditionalMappingState());
  const _newConditionalMappingState = {
    ..._conditionalMappingState,
    lastBlockModification: {
      ...lastBlockModification,
      lastModified: Date.now(),
    } as LastBlockModification,
  };
  sessionStorage.setItem('conditional-mapping', JSON.stringify(_newConditionalMappingState));
  window.postMessage(JSON.stringify({
    origin,
    type: 'conditional-mapping',
    subtype: 'last-block-modification',
    conditionalMappingState: _newConditionalMappingState
  }), '*');
};

export const setConditionalMappingConditions = (origin: ActionOrigin, callback: (_conditionalMappingConditions: Condition[]) => Condition[]) => {
  const _conditionalMappingState = cloneDeep(getConditionalMappingState());
  const _newConditionalMappingState = {
    ..._conditionalMappingState,
    conditions: callback(_conditionalMappingState.conditions),
  } as ConditionalMappingState;
  sessionStorage.setItem('conditional-mapping', JSON.stringify(_newConditionalMappingState));
  window.postMessage(JSON.stringify({
    origin,
    type: 'conditional-mapping',
    subtype: 'conditions',
    conditionalMappingState: _newConditionalMappingState
  }), '*');
};

export const setEnableAddConditionButton = (origin: ActionOrigin, _enableAddConditionButton: boolean) => {
  const _conditionalMappingState = cloneDeep(getConditionalMappingState());
  const _newConditionalMappingState = {
    ..._conditionalMappingState,
    enableAddConditionButton: _enableAddConditionButton,
  };
  sessionStorage.setItem('conditional-mapping', JSON.stringify(_newConditionalMappingState));
  window.postMessage(JSON.stringify({ origin, type: 'conditional-mapping', subtype: 'enable-add-condition-button', conditionalMappingState: _newConditionalMappingState }), '*');
};

export const setConditionalMappingJavascript = (origin: ActionOrigin, callback: (_conditionalMappingJavascript: string) => string) => {
  const _conditionalMappingState = cloneDeep(getConditionalMappingState());
  const _newConditionalMappingState = {
    ..._conditionalMappingState,
    javascript: callback(_conditionalMappingState.javascript ?? ''),
  } as ConditionalMappingState;
  sessionStorage.setItem('conditional-mapping', JSON.stringify(_newConditionalMappingState));
  window.postMessage(JSON.stringify({
    origin,
    type: 'conditional-mapping',
    subtype: 'javascript',
    conditionalMappingState: _newConditionalMappingState
  }), '*');
};

export const setConditionalMappingCSS = (origin: ActionOrigin, callback: (_conditionalMappingCSS: string) => string) => {
  const _conditionalMappingState = cloneDeep(getConditionalMappingState());
  const _newConditionalMappingState = {
    ..._conditionalMappingState,
    css: callback(_conditionalMappingState.css ?? ''),
  } as ConditionalMappingState;
  sessionStorage.setItem('conditional-mapping', JSON.stringify(_newConditionalMappingState));
  window.postMessage(JSON.stringify({
    origin,
    type: 'conditional-mapping',
    subtype: 'css',
    conditionalMappingState: _newConditionalMappingState
  }), '*');
};

// Listeners:
export const generateUpdateConditionalMappingListener = (listenFor: ActionOrigin, callback: (_conditionalMappingState: ConditionalMappingState) => void) => (event: MessageEvent<any>) => {
  try {
    if (typeof event.data !== 'string') return;
    if (event.data.trim().length === 0) return;
    const message = JSON.parse(event.data) as any;
    if (
      message.origin === listenFor &&
      message.type === 'conditional-mapping' &&
      message.subtype === '*'
    ) callback(message.conditionalMappingState);
  } catch (error) {
  }
};

export const generateUpdateConditionalMappingIsActiveListener = (listenFor: ActionOrigin, callback: (_isActive: boolean) => void) => (event: MessageEvent<any>) => {
  try {
    if (typeof event.data !== 'string') return;
    if (event.data.trim().length === 0) return;
    const message = JSON.parse(event.data) as any;
    if (
      message.origin === listenFor &&
      message.type === 'conditional-mapping' &&
      message.subtype === 'is-active'
    ) callback(message.conditionalMappingState.isActive);
  } catch (error) {
  }
};

export const generateUpdateFocusIdxListener = (listenFor: ActionOrigin, callback: (newFocusIdx: string) => void) => (event: MessageEvent<any>) => {
  try {
    if (typeof event.data !== 'string') return;
    if (event.data.trim().length === 0) return;
    const message = JSON.parse(event.data) as any;
    if (
      message.origin === listenFor &&
      message.type === 'conditional-mapping' &&
      message.subtype === 'focus-idx'
    ) callback(message.conditionalMappingState.focusIdx);
  } catch (error) {
  }
};

export const generateUpdateFocusBlockListener = (listenFor: ActionOrigin, callback: (newFocusBlock: any) => void) => (event: MessageEvent<any>) => {
  try {
    if (typeof event.data !== 'string') return;
    if (event.data.trim().length === 0) return;
    const message = JSON.parse(event.data) as any;
    if (
      message.origin === listenFor &&
      message.type === 'conditional-mapping' &&
      message.subtype === 'focus-block'
    ) callback(message.conditionalMappingState.focusBlock);
  } catch (error) {
  }
};

export const generateUpdateLastBlockModificationListener = (listenFor: ActionOrigin, callback: (lastBlockModification: LastBlockModification & { isReset?: boolean; }) => void) => (event: MessageEvent<any>) => {
  try {
    if (typeof event.data !== 'string') return;
    if (event.data.trim().length === 0) return;
    const message = JSON.parse(event.data) as any;
    if (
      message.origin === listenFor &&
      message.type === 'conditional-mapping' &&
      message.subtype === 'last-block-modification'
    ) callback(message.conditionalMappingState.lastBlockModification);
  } catch (error) {
  }
};

export const generateUpdateConditionalMappingConditionsListener = (listenFor: ActionOrigin, callback: (_conditionalMappingConditions: Condition[]) => void) => (event: MessageEvent<any>) => {
  try {
    if (typeof event.data !== 'string') return;
    if (event.data.trim().length === 0) return;
    const message = JSON.parse(event.data) as any;
    if (
      message.origin === listenFor &&
      message.type === 'conditional-mapping' &&
      message.subtype === 'conditions'
    ) callback(message.conditionalMappingState.conditions);
  } catch (error) {
  }
};

export const generateUpdateEnableAddConditionButtonListener = (listenFor: ActionOrigin, callback: (__enableAddConditionButton: boolean) => void) => (event: MessageEvent<any>) => {
  try {
    if (typeof event.data !== 'string') return;
    if (event.data.trim().length === 0) return;
    const message = JSON.parse(event.data) as any;
    if (
      message.origin === listenFor &&
      message.type === 'conditional-mapping' &&
      message.subtype === 'enable-add-condition-button'
    ) callback(message.conditionalMappingState.enableAddConditionButton);
  } catch (error) {
  }
};
