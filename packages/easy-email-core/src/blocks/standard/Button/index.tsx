import React from 'react';
import { IBlockData } from '@core/typings';
import { AdvancedType, BasicType } from '@core/constants';
import { createBlock } from '@core/utils/createBlock';
import { merge } from 'lodash';
import { BasicBlock } from '@core/components/BasicBlock';
import { t } from '@core/utils';

export type IButton = IBlockData<
  {
    'data-id'?: string;
    'css-class'?: string;
    align?: string;
    color?: string;
    'background-color'?: string;
    'container-background-color'?: string;
    border?: string;
    'border-radius'?: string;
    href?: string;
    rel?: string;
    target?: string;
    title?: string;
    padding?: string;
    'inner-padding'?: string;
    'text-align'?: string;
    'vertical-align'?: 'middle' | 'top' | 'bottom';
    width?: string;
    'font-family'?: string;
    'font-size'?: string;
    'font-style'?: string;
    'font-weight'?: string;
    'line-height'?: string;
    'letter-spacing'?: string;
    height?: string;
    'text-decoration'?: string;
    'text-transform'?: string;
  },
  { content: string; }
>;

export const Button = createBlock<IButton>({
  get name() {
    return t('Button');
  },
  type: BasicType.BUTTON,
  create: payload => {
    const defaultData: IButton = {
      type: BasicType.BUTTON,
      data: {
        value: {
          content: 'Button',
        },
      },
      attributes: {
        align: 'center',
        'background-color': '#414141',
        color: '#ffffff',
        'font-weight': 'normal',
        'border-radius': '3px',
        padding: '10px 25px 10px 25px',
        'inner-padding': '10px 25px 10px 25px',
        'line-height': '120%',
        target: '_blank',
        'vertical-align': 'middle',
        border: 'none',
        'text-align': 'center',
        href: '#',
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
      const dataAttributes = { 'data-block-type': AdvancedType.BUTTON } as Record<string, string>;
      for (const attributeEntry of Object.entries(rawAttributes)) {
        if (/^data-.*$/.test(attributeEntry[0])) dataAttributes[attributeEntry[0]] = attributeEntry[1];
      }
      params.data.attributes['css-class'] = (params.data.attributes['css-class'] ?? '') + `contains-condensed-mjml-encoding <condensed-mjml-encoding>${window.btoa(JSON.stringify(dataAttributes))}</condensed-mjml-encoding>`;
    }

    return (
      <BasicBlock
        params={params}
        tag='mj-button'
      >
        {data.data.value.content}
      </BasicBlock>
    );
  },
});
