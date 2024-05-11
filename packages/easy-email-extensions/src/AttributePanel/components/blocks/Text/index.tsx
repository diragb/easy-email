import { useField, useForm } from 'react-final-form';
import React, { useEffect, useState } from 'react';
import { Padding } from '@extensions/AttributePanel/components/attributes/Padding';
import { TextDecoration } from '@extensions/AttributePanel/components/attributes/TextDecoration';
import { FontWeight } from '@extensions/AttributePanel/components/attributes/FontWeight';
import { FontStyle } from '@extensions/AttributePanel/components/attributes/FontStyle';
import { FontFamily } from '@extensions/AttributePanel/components/attributes/FontFamily';
import { Height } from '@extensions/AttributePanel/components/attributes/Height';
import { ContainerBackgroundColor } from '@extensions/AttributePanel/components/attributes/ContainerBackgroundColor';
import { FontSize } from '@extensions/AttributePanel/components/attributes/FontSize';
import { Color } from '@extensions/AttributePanel/components/attributes/Color';
import { Align } from '@extensions/AttributePanel/components/attributes/Align';
import { LineHeight } from '@extensions/AttributePanel/components/attributes/LineHeight';
import { LetterSpacing } from '@extensions/AttributePanel/components/attributes/LetterSpacing';

import { AttributesPanelWrapper } from '@extensions/AttributePanel/components/attributes/AttributesPanelWrapper';
import { Collapse, Grid, Space, Tooltip, Button } from '@arco-design/web-react';
import { IconFont, Stack, useFocusIdx } from 'easy-email-editor';
import { HtmlEditor } from '../../UI/HtmlEditor';
import { ClassName } from '../../attributes/ClassName';
import { CollapseWrapper } from '../../attributes/CollapseWrapper';
import { SelectField, TextField } from '@extensions/components/Form';
import { isIDValid } from '@extensions/utils/blockIDManager';
import { getTemplateTheme, Typography } from 'template-theme-manager';

export function Text() {
  // Constants:
  const { change } = useForm();
  const { focusIdx } = useFocusIdx();
  const fontFamily = useField(`${focusIdx}.attributes.font-family`);
  const fontSize = useField(`${focusIdx}.attributes.font-size`);
  const fontWeight = useField(`${focusIdx}.attributes.font-weight`);
  const dataTypography = useField(`${focusIdx}.attributes.data-typography`);

  // State:
  const [visible, setVisible] = useState(false);
  const [typography, setTypography] = useState<Typography[]>([]);
  const [typographyList, setTypographyList] = useState<{ label: string; value: string; }[]>([]);
  const [selectedTypography, setSelectedTypography] = useState<Typography>();
  const [defaultTypographicStyling, setDefaultTypographicStyling] = useState<Typography>();

  useEffect(() => {
    const _selectedTypography = typography.find(typographyItem => typographyItem.name === dataTypography.input.value);
    setSelectedTypography(_selectedTypography);
    if (_selectedTypography) {
      change(`${focusIdx}.attributes.font-family`, _selectedTypography.fontFamily ?? '');
      change(`${focusIdx}.attributes.font-size`, _selectedTypography.fontSize ?? '');
      change(`${focusIdx}.attributes.font-weight`, _selectedTypography.fontWeight ?? '');
    } else {
      change(`${focusIdx}.attributes.font-family`, defaultTypographicStyling?.fontFamily ?? '');
      change(`${focusIdx}.attributes.font-size`, defaultTypographicStyling?.fontSize ?? '');
      change(`${focusIdx}.attributes.font-weight`, defaultTypographicStyling?.fontWeight ?? '');
    }
  }, [typography, dataTypography.input.value, defaultTypographicStyling]);

  useEffect(() => {
    setDefaultTypographicStyling({
      name: 'Default',
      fontFamily: fontFamily.input.value,
      fontSize: fontSize.input.value,
      fontWeight: fontWeight.input.value,
    });
  }, []);

  // Effects:
  useEffect(() => {
    const _typography = getTemplateTheme()?.typography ?? [];
    setTypography(_typography);
    setTypographyList(_typography.map(typographyItem => ({ label: typographyItem.name, value: typographyItem.name })));
  }, []);

  // Return:
  return (
    <AttributesPanelWrapper
      extra={(
        <Tooltip content={String('Html mode')}>
          <Button
            onClick={() => setVisible(true)}
            icon={<IconFont iconName='icon-html' />}
          />
        </Tooltip>
      )}
    >
      <CollapseWrapper defaultActiveKey={['-1', '0', '1', '2']}>
        <Collapse.Item name='-1' header={String('Settings')}>
          {/* @ts-ignore */}
          <Stack vertical spacing='tight'>
            <TextField
              label={(
                <Space>
                  <span>{String('ID')}</span>
                </Space>
              )}
              name={`${focusIdx}.attributes.data-id`}
              validate={value => isIDValid(focusIdx, value)}
              style={{
                paddingBottom: '1rem',
              }}
            />
          </Stack>
        </Collapse.Item>
        <Collapse.Item
          name='0'
          header={String('Dimension')}
        >
          <Space direction='vertical'>
            <Height />
            <Padding showResetAll />
          </Space>
        </Collapse.Item>
        <Collapse.Item
          name='1'
          header={String('Color')}
        >
          <Grid.Row>
            <Grid.Col span={11}>
              <Color />
            </Grid.Col>
            <Grid.Col
              offset={1}
              span={11}
            >
              <ContainerBackgroundColor title={String('Background color')} />
            </Grid.Col>
          </Grid.Row>
        </Collapse.Item>
        <Collapse.Item
          name='2'
          header={String('Typography')}
        >
          <Space direction='vertical'>
            <SelectField
              label={'Typography Style'}
              name={`${focusIdx}.attributes.data-typography`}
              options={typographyList}
              allowClear
            />
            <Grid.Row>
              <Grid.Col span={11}>
                <FontFamily disabled={!!selectedTypography} />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <FontSize disabled={!!selectedTypography} />
              </Grid.Col>
            </Grid.Row>

            <Grid.Row>
              <Grid.Col span={11}>
                <LineHeight />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <LetterSpacing />
              </Grid.Col>
            </Grid.Row>

            <Grid.Row>
              <Grid.Col span={11}>
                <TextDecoration />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <FontWeight disabled={!!selectedTypography} />
              </Grid.Col>
            </Grid.Row>

            <Align />

            <FontStyle />

            <Grid.Row>
              <Grid.Col span={11} />
              <Grid.Col
                offset={1}
                span={11}
              />
            </Grid.Row>
          </Space>
        </Collapse.Item>
        <Collapse.Item
          name='4'
          header={String('Extra')}
        >
          <Grid.Col span={24}>
            <ClassName />
          </Grid.Col>
        </Collapse.Item>
      </CollapseWrapper>
      <HtmlEditor
        visible={visible}
        setVisible={setVisible}
      />
    </AttributesPanelWrapper>
  );
}
