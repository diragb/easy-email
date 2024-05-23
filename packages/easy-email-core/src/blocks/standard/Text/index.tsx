import React from 'react';
import { IBlockData } from '@core/typings';
import { BasicType } from '@core/constants';
import { createBlock } from '@core/utils/createBlock';
import { merge } from 'lodash';
import { BasicBlock } from '@core/components/BasicBlock';
import { t } from '@core/utils';

export type IText = IBlockData<
  {
    'data-typography'?: string;

    'data-color-palette-tree'?: string;
    'data-color-palette-name'?: string;
    'data-color-palette-color-name'?: string;
    'data-color-palette-color-code'?: string;

    'data-background-color-palette-tree'?: string;
    'data-background-color-palette'?: string;
    'data-background-color-palette-color-name'?: string;
    'data-background-color-palette-color-code'?: string;

    'data-static-text'?: string;

    'data-id'?: string;
    'css-class'?: string;
    color?: string;
    'font-family'?: string;
    'font-size'?: string;
    'font-style'?: string;
    'font-weight'?: string;
    'line-height'?: string;
    'letter-spacing'?: string;
    height?: string;
    'text-decoration'?: string;
    'text-transform'?: string;
    align?: string;
    'container-background-color'?: string;
    width?: string;
    padding?: string;
  },
  {
    content: string;
  }
>;

export const Text = createBlock<IText>({
  get name() {
    return t('Text');
  },
  type: BasicType.TEXT,
  create: payload => {
    const defaultData: IText = {
      type: BasicType.TEXT,
      data: {
        value: {
          content: t('Make it easy for everyone to compose emails!'),
        },
      },
      attributes: {
        padding: '10px 25px 10px 25px',
        align: 'left',
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.COLUMN, BasicType.HERO],
  render(params) {
    const { data } = params;
    if (JSON.parse(sessionStorage.getItem('isExporting') ?? 'false')) {
      const rawAttributes = params.data.attributes;
      const dataAttributes = {} as Record<string, string>;
      for (const attributeEntry of Object.entries(rawAttributes)) {
        if (/^data-.*$/.test(attributeEntry[0])) dataAttributes[attributeEntry[0]] = attributeEntry[1];
      }
      params.data.attributes['css-class'] = (params.data.attributes['css-class'] ?? '') + `contains-condensed-mjml-encoding <condensed-mjml-encoding>${window.btoa(JSON.stringify(dataAttributes))}</condensed-mjml-encoding>`;
    }

    return (
      <BasicBlock
        params={params}
        tag='mj-text'
      >
        {data.data.value.content}
      </BasicBlock>
    );
  },
});
