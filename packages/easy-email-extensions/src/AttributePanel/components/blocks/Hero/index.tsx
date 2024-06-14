import React from 'react';
import { BackgroundColor } from '@extensions/AttributePanel/components/attributes/BackgroundColor';
import { ImageUploaderField, InputWithUnitField, RadioGroupField, TextField } from '@extensions/components/Form';
import { Width } from '@extensions/AttributePanel/components/attributes/Width';
import { Height } from '@extensions/AttributePanel/components/attributes/Height';
import { VerticalAlign } from '@extensions/AttributePanel/components/attributes/VerticalAlign';
import { Padding } from '@extensions/AttributePanel/components/attributes/Padding';
import { Collapse, Grid, Space } from '@arco-design/web-react';
import { useEditorProps, useFocusIdx } from 'easy-email-editor';
import { AttributesPanelWrapper } from '@extensions/AttributePanel/components/attributes/AttributesPanelWrapper';
import { ClassName } from '../../attributes/ClassName';
import { CollapseWrapper } from '../../attributes/CollapseWrapper';
import { validateBlockID } from '@extensions/utils/blockIDManager';
import { useExtensionProps } from '@extensions/components/Providers/ExtensionProvider';
import { getConditionalMappingConditions } from 'conditional-mapping-manager';
import useBlockID from '@extensions/AttributePanel/hooks/useBlockID';

const options = [
  {
    value: 'fluid-height',
    get label() {
      return String('Fluid height');
    },
  },
  {
    value: 'fixed-height',
    get label() {
      return String('Fixed height');
    },
  },
];

export function Hero() {
  const { focusIdx } = useFocusIdx();
  const { onUploadImage } = useEditorProps();
  const { isConditionalMapping = false } = useExtensionProps();
  const { lastValidDataID, onBlurCapture } = useBlockID();

  return (
    <AttributesPanelWrapper>
      <CollapseWrapper defaultActiveKey={['0', '1', '2']}>
        <Collapse.Item
          name='0'
          header={String('Dimension')}
        >
          <Space direction='vertical'>
            <TextField
              label={(
                <Space>
                  <span>{String('ID')}</span>
                </Space>
              )}
              name={`${focusIdx}.attributes.data-id`}
              validate={value => {
                const validationMessage = validateBlockID(focusIdx, value);
                if (
                  !validationMessage &&
                  (!value || (value ?? '').length === 0)
                ) {
                  const conditions = getConditionalMappingConditions();
                  const isDataIDUsedInAnyCondition = conditions.findIndex(condition => condition.id === lastValidDataID) !== -1;
                  if (isDataIDUsedInAnyCondition) return 'If ID is left empty, all conditions related to this block will be removed!';
                } else return validationMessage;
              }}
              disabled={isConditionalMapping}
              onBlurCapture={onBlurCapture}
            />
            <RadioGroupField
              label={String('Mode')}
              name={`${focusIdx}.attributes.mode`}
              options={options}
            />
            <Grid.Row>
              <Grid.Col span={11}>
                <Width />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <Height />
              </Grid.Col>
            </Grid.Row>

            <Padding />
            <VerticalAlign />
          </Space>
        </Collapse.Item>
        <Collapse.Item
          name='1'
          header={String('Background')}
        >
          <Space direction='vertical'>
            <ImageUploaderField
              label={String('src')}
              name={`${focusIdx}.attributes.background-url`}
              helpText={String(
                'The image suffix should be .jpg, jpeg, png, gif, etc. Otherwise, the picture may not be displayed normally.',
              )}
              uploadHandler={onUploadImage}
            />

            <Grid.Row>
              <Grid.Col span={11}>
                <InputWithUnitField
                  label={String('Background width')}
                  name={`${focusIdx}.attributes.background-width`}
                />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <InputWithUnitField
                  label={String('Background height')}
                  name={`${focusIdx}.attributes.background-height`}
                />
              </Grid.Col>
            </Grid.Row>

            <Grid.Row>
              <Grid.Col span={11}>
                <TextField
                  label={String('Background position')}
                  name={`${focusIdx}.attributes.background-position`}
                />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <InputWithUnitField
                  label={String('Border radius')}
                  name={`${focusIdx}.attributes.border-radius`}
                  unitOptions='percent'
                />
              </Grid.Col>
              <Grid.Col span={11}>
                <BackgroundColor />
              </Grid.Col>
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
    </AttributesPanelWrapper>
  );
}
