import React, { CSSProperties } from 'react';
import { IBlockData } from '@core/typings';
import { AdvancedType, BasicType } from '@core/constants';
import { createBlock } from '@core/utils/createBlock';
import { merge } from 'lodash';
import { t } from '@core/utils';
import { BasicBlock } from '@core/components/BasicBlock';

export type IGrid = IBlockData<
  {
    'data-id'?: string;
    'data-direction'?: 'row' | 'column';
    'data-threshold'?: string;
    'data-type': string;
    'data-source'?: string;
    'css-class'?: string;
    'background-color'?: string;
    border?: string;
    'border-radius'?: string;
    'full-width'?: string;
    direction?: 'ltr' | 'rtl';
    padding?: string;
    'text-align'?: CSSProperties['textAlign'];
  },
  {}
>;

export const Grid = createBlock<IGrid>({
  get name() {
    return t('Grid');
  },
  type: BasicType.GRID,
  create: payload => {
    const defaultData: IGrid = {
      type: BasicType.GRID,
      data: {
        value: {
          noWrap: false
        },
      },
      attributes: {
        padding: '20px 0px 20px 0px',
        border: 'none',
        direction: 'ltr',
        'text-align': 'center',
        'data-direction': 'row',
        'data-threshold': '5',
        'data-type': 'grid',
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [
    BasicType.PAGE,
    BasicType.WRAPPER,
    BasicType.COLUMN,
  ],

  render(params) {
    if (JSON.parse(sessionStorage.getItem('isExporting') ?? 'false')) {
      const rawAttributes = params.data.attributes;
      const dataAttributes = { 'data-block-type': AdvancedType.GROUP } as Record<string, string>;
      for (const attributeEntry of Object.entries(rawAttributes)) {
        if (/^data-.*$/.test(attributeEntry[0])) dataAttributes[attributeEntry[0]] = attributeEntry[1];
      }
      params.data.attributes['css-class'] = (params.data.attributes['css-class'] ?? '') + `contains-condensed-mjml-encoding <condensed-mjml-encoding>${window.btoa(JSON.stringify(dataAttributes))}</condensed-mjml-encoding>`;
    }

    return (
      <BasicBlock
        params={params}
        tag='mj-wrapper'
      />
    );
  },
});
