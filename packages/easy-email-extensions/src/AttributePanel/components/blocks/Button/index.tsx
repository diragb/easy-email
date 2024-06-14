import React, { useEffect, useState } from 'react';
import { Padding } from '../../attributes/Padding';
import { Border } from '../../attributes/Border';
import { BackgroundColor } from '../../attributes/BackgroundColor';
import { Color } from '../../attributes/Color';
import { Link } from '../../attributes/Link';
import { Width } from '../../attributes/Width';
import { ContainerBackgroundColor } from '../../attributes/ContainerBackgroundColor';
import { Align } from '../../attributes/Align';
import { FontSize } from '../../attributes/FontSize';
import { FontStyle } from '../../attributes/FontStyle';
import { FontWeight } from '../../attributes/FontWeight';
import { FontFamily } from '../../attributes/FontFamily';
import { TextDecoration } from '../../attributes/TextDecoration';
import { LineHeight } from '../../attributes/LineHeight';
import { LetterSpacing } from '../../attributes/LetterSpacing';
import { Collapse, Grid, Popover, Space, Button as ArcoButton } from '@arco-design/web-react';
import { TextField } from '../../../../components/Form';
import { IconFont, useFocusIdx } from 'easy-email-editor';
import { AttributesPanelWrapper } from '../../attributes/AttributesPanelWrapper';
import { MergeTags } from '../../attributes';
import { useField } from 'react-final-form';
import { ClassName } from '../../attributes/ClassName';
import { CollapseWrapper } from '../../attributes/CollapseWrapper';
import { validateBlockID } from '@extensions/utils/blockIDManager';
import { AttributeModifier, generateUpdateCustomAttributeListener, generateUpdatePredefinedAttributeListener, getCustomAttributes, getPredefinedAttributes } from 'attribute-manager';
import { useExtensionProps } from '@extensions/components/Providers/ExtensionProvider';
import useBlockID from '@extensions/AttributePanel/hooks/useBlockID';
import { getConditionalMappingConditions } from 'conditional-mapping-manager';

export function Button() {
  const { focusIdx } = useFocusIdx();
  const { input } = useField(`${focusIdx}.data.value.content`, {
    parse: v => v,
  });
  const { isConditionalMapping = false } = useExtensionProps();
  const { lastValidDataID, onBlurCapture } = useBlockID();

  const [predefinedAttributes, _setPredefinedAttributes] = useState(getPredefinedAttributes());
  const [customAttributes, _setCustomAttributes] = useState(getCustomAttributes());

  const updateCustomAttributes = generateUpdateCustomAttributeListener(AttributeModifier.EasyEmail, _setCustomAttributes);
  const updatePredefinedAttributes = generateUpdatePredefinedAttributeListener(AttributeModifier.EasyEmail, _setPredefinedAttributes);

  const mergeTags = {
    ...predefinedAttributes,
    ...customAttributes,
  };

  useEffect(() => {
    window.addEventListener('message', updateCustomAttributes);
    window.addEventListener('message', updatePredefinedAttributes);

    return () => {
      window.removeEventListener('message', updateCustomAttributes);
      window.removeEventListener('message', updatePredefinedAttributes);
    };
  }, []);

  return (
    <AttributesPanelWrapper>
      <CollapseWrapper defaultActiveKey={['-1', '0', '1', '2', '3']}>
        <Collapse.Item
          name='-1'
          header={String('Setting')}
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
            <TextField
              label={(
                <Space>
                  <span>{String('Content')}</span>
                  {mergeTags && (
                    <Popover
                      trigger='click'
                      content={(
                        <MergeTags
                          value={input.value}
                          onChange={input.onChange}
                        />
                      )}
                    >
                      <ArcoButton
                        type='text'
                        icon={<IconFont iconName='icon-merge-tags' />}
                      />
                    </Popover>
                  )}
                </Space>
              )}
              name={`${focusIdx}.data.value.content`}
            />
            <Link />
          </Space>
        </Collapse.Item>

        <Collapse.Item
          name='0'
          header={String('Dimension')}
        >
          <Space direction='vertical'>
            <Grid.Row>
              <Grid.Col span={11}>
                <Width />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <FontWeight />
              </Grid.Col>
            </Grid.Row>

            <Padding
              title={String('Padding')}
              attributeName='padding'
              showResetAll
            />
            <Padding
              title={String('Inner padding')}
              attributeName='inner-padding'
            />
          </Space>
        </Collapse.Item>

        <Collapse.Item
          name='1'
          header={String('Color')}
        >
          <Space direction='vertical'>
            <Grid.Row>
              <Grid.Col span={11}>
                <Color title={String('Text color')} />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <BackgroundColor title={String('Button color')} />
              </Grid.Col>
              <Grid.Col span={11}>
                <ContainerBackgroundColor title={String('Background color')} />
              </Grid.Col>
            </Grid.Row>
          </Space>
        </Collapse.Item>

        <Collapse.Item
          name='2'
          header={String('Typography')}
        >
          <Space direction='vertical'>
            <Grid.Row>
              <Grid.Col span={11}>
                <FontFamily />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <FontSize />
              </Grid.Col>
            </Grid.Row>

            <Grid.Row>
              <Grid.Col span={11}>
                <FontWeight />
              </Grid.Col>
              <Grid.Col
                offset={1}
                span={11}
              >
                <LineHeight />
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
                <LetterSpacing />
              </Grid.Col>
            </Grid.Row>
            <Align />

            <FontStyle />
          </Space>
        </Collapse.Item>

        <Collapse.Item
          name='3'
          header={String('Border')}
        >
          <Border />
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
