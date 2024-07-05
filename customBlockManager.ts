// Packages:
import { cloneDeep } from 'lodash';

// Typescript:
export interface CustomFieldText {
  label: string;
  type: 'text';
  attribute: string;
  validate?: string;
}

export interface CustomFieldSelect {
  label: string;
  type: 'select';
  attribute: string;
  validate?: string;
  options: { value: string, label: string; }[];
}

export interface CustomSection {
  header: string;
  fields: (CustomFieldText | CustomFieldSelect)[];
}

export interface CustomBlock {
  id: string;
  label: string;
  code: string;
  configuration: string;
}

interface CustomBlocksStorage {
  customBlocks: CustomBlock[];
}

// Functions:
export const getCustomBlocks = () => (JSON.parse(sessionStorage.getItem('custom-blocks') ?? '{ "customBlocks": [] }') as CustomBlocksStorage).customBlocks;

export const setCustomBlocks = (callback: (_customBlocks: CustomBlock[]) => CustomBlock[]) => {
  const _customBlocks = cloneDeep(getCustomBlocks());
  const newCustomBlocks = callback(_customBlocks);
  sessionStorage.setItem('custom-blocks', JSON.stringify({ customBlocks: newCustomBlocks } as CustomBlocksStorage));
  window.postMessage(JSON.stringify({ customBlocks: newCustomBlocks }), '*');
};
