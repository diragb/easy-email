import React from 'react';
import { IBlockData } from '@core/typings';
import { AdvancedType, BasicType } from '@core/constants';
import { createBlock } from '@core/utils/createBlock';
import { merge } from 'lodash';
import { BasicBlock } from '@core/components/BasicBlock';
import { t } from '@core/utils';

export type IDivider = IBlockData<
  {
    'data-id'?: string;
    'css-class'?: string;
    'border-color'?: string;
    'border-style'?: string;
    'border-width'?: string;
    'container-background-color'?: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    padding?: string;
  },
  {}
>;

export const Divider = createBlock<IDivider>({
  get name() {
    return t('Divider');
  },
  type: BasicType.DIVIDER,
  create: (payload) => {
    const defaultData: IDivider = {
      type: BasicType.DIVIDER,
      data: {
        value: {},
      },
      attributes: {
        align: 'center',
        'border-width': '1px',
        'border-style': 'solid',
        'border-color': '#C9CCCF',
        padding: '10px 0px 10px 0px',
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.COLUMN, BasicType.HERO],
  render(params) {
    if (JSON.parse(sessionStorage.getItem('isExporting') ?? 'false')) {
      const rawAttributes = params.data.attributes;
      const dataAttributes = { 'data-block-type': AdvancedType.DIVIDER } as Record<string, string>;
      for (const attributeEntry of Object.entries(rawAttributes)) {
        if (/^data-.*$/.test(attributeEntry[0])) dataAttributes[attributeEntry[0]] = attributeEntry[1];
      }
      params.data.attributes['css-class'] = (params.data.attributes['css-class'] ?? '') + `contains-condensed-mjml-encoding <condensed-mjml-encoding>${window.btoa(JSON.stringify(dataAttributes))}</condensed-mjml-encoding>`;
    }

    return <BasicBlock params={params} tag="mj-divider" />;
  },
});
