import React from 'react';
import { IBlock, IBlockData } from '@core/typings';
import { AdvancedType, BasicType } from '@core/constants';
import { createBlock } from '@core/utils/createBlock';
import { merge } from 'lodash';
import { BasicBlock } from '@core/components/BasicBlock';
import { t } from '@core/utils';

export type ISpacer = IBlockData<{
  'data-id'?: string;
  'css-class'?: string;
  'container-background-color'?: string;
  height?: string;
  padding?: string;
}>;

export const Spacer: IBlock<ISpacer> = createBlock({
  get name() {
    return t('Spacer');
  },
  type: BasicType.SPACER,
  create: (payload) => {
    const defaultData: ISpacer = {
      type: BasicType.SPACER,
      data: {
        value: {},
      },
      attributes: {
        height: '20px',
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.COLUMN, BasicType.HERO],
  render(params) {
    if (JSON.parse(sessionStorage.getItem('isExporting') ?? 'false')) {
      const rawAttributes = params.data.attributes;
      const dataAttributes = { 'data-block-type': AdvancedType.WRAPPER } as Record<string, string>;
      for (const attributeEntry of Object.entries(rawAttributes)) {
        if (/^data-.*$/.test(attributeEntry[0])) dataAttributes[attributeEntry[0]] = attributeEntry[1];
      }
      params.data.attributes['css-class'] = (params.data.attributes['css-class'] ?? '') + `contains-condensed-mjml-encoding <condensed-mjml-encoding>${window.btoa(JSON.stringify(dataAttributes))}</condensed-mjml-encoding>`;
    }

    return <BasicBlock params={params} tag="mj-spacer" />;
  },
});
