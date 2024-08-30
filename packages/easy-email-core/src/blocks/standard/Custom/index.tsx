// Packages:
import React from 'react';
import { createBlock } from '@core/utils/createBlock';
import { cloneDeep, merge } from 'lodash';
import { t } from '@core/utils';
import { customAlphabet } from 'nanoid';

// Typescript:
import { IBlockData } from '@core/typings';
import { AdvancedType, BasicType } from '@core/constants';

// Components:
import { BasicBlock } from '@core/components/BasicBlock';

// Functions:
const generateVariableName = (prefix: string = 'var'): string => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nanoid = customAlphabet(alphabet, 10);
  return `${prefix}_${nanoid()}`;
};

// Exports:
export type ICustom = IBlockData<
  {
    'data-id'?: string;
    'data-custom-component-id'?: string;
    'data-custom-component-label'?: string;
    'data-custom-component-code'?: string;
  },
  {}
>;

export const Custom = createBlock<ICustom>({
  get name() {
    return t('Custom');
  },
  type: BasicType.CUSTOM,
  create: payload => {
    const defaultData: ICustom = {
      type: BasicType.CUSTOM,
      data: {
        value: {}
      },
      attributes: {},
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [
    BasicType.PAGE,
    BasicType.WRAPPER,
    BasicType.SECTION,
    BasicType.GROUP,
    BasicType.COLUMN,
    BasicType.GRID,

    AdvancedType.WRAPPER,
    AdvancedType.SECTION,
    AdvancedType.GROUP,
    AdvancedType.COLUMN,
    AdvancedType.GRID,
  ],
  render(params) {
    // let processedContent = new Function('attributes', window.atob(params.data.attributes['data-custom-component-code'] ?? ''))(params.data.attributes);
    let processedContent = '';
    const customComponentID = params.data.attributes['data-custom-component-id'];
    const customComponentCode = params.data.attributes['data-custom-component-code'];
    const customComponentLabel = params.data.attributes['data-custom-component-label'];
    const isExporting = (JSON.parse(sessionStorage.getItem('isExporting') ?? 'false'));

    if (
      !!customComponentID &&
      !!customComponentCode &&
      !!customComponentLabel
    ) {
      if (isExporting) {
        if (!(window as any).customElementsBeingUsed) {
          (window as any).customElementsBeingUsed = new Set<string>();
        }

        ((window as any).customElementsBeingUsed as Set<string>).add(customComponentID);
      }

      const attributesMap = cloneDeep(params.data.attributes);
      delete attributesMap['data-custom-component-id'];
      delete attributesMap['data-custom-component-label'];
      delete attributesMap['data-custom-component-code'];
      delete attributesMap['css-class'];

      const attributesString = Object.entries(attributesMap).map(attribute => `${attribute[0]}="${attribute[1]}"`).join(' ');
      processedContent = processedContent + `<${customComponentID}${attributesString ? ` ${attributesString}` : ''}></${customComponentID}>`;
    }

    return (
      <BasicBlock
        params={params}
        tag='mj-wrapper'
      >
        <BasicBlock
          params={params}
          tag='mj-raw'
        >
          {processedContent}
        </BasicBlock>
      </BasicBlock>
    );
  },
});