// Packages:
import React, { useEffect, useState } from 'react';
import { pixelAdapter } from '../../../../utils/adapter';
import { cloneDeep } from 'lodash';
import {
  AttributeModifier,
  generateUpdateCustomAttributeListener,
  generateUpdatePredefinedAttributeListener,
  getCustomAttributes,
  getPredefinedAttributes,
  setCustomAttributes,
} from 'attribute-manager';

// Typescript:
interface PageProps {
  hideSubTitle?: boolean;
  hideSubject?: boolean;
}

// Imports:
import { IconPlus } from '@arco-design/web-react/icon';

// Components:
import { Collapse, Grid, Input, Space, Tag } from '@arco-design/web-react';
import { Stack, useFocusIdx } from 'easy-email-editor';
import {
  AttributesPanelWrapper,
  ColorPickerField,
  FontFamily,
  InputWithUnitField,
  NumberField,
  TextAreaField,
  TextField,
} from 'easy-email-extensions';

// Functions:
const CustomPagePanel = ({ hideSubTitle, hideSubject }: PageProps) => {
  // Constants:
  const { focusIdx } = useFocusIdx();
  const templateType = {
    EMAIL: 'Email',
    IMG: 'Image',
    PDF: 'PDF',
  }[sessionStorage.getItem('template-type') ?? 'EMAIL'];

  // State:
  const [predefinedAttributes, _setPredefinedAttributes] = useState(getPredefinedAttributes());
  const [customAttributes, _setCustomAttributes] = useState(getCustomAttributes());
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Functions:
  const addCustomAttribute = () => {
    const isCustomAttributeAlreadyDefined = Object
      .keys(predefinedAttributes)
      .some(predefinedAttribute => predefinedAttribute === inputValue) || Object
        .keys(customAttributes)
        .some(customAttribute => customAttribute === inputValue);
    if (inputValue && !isCustomAttributeAlreadyDefined) {
      setCustomAttributes(AttributeModifier.React, _customAttributes => {
        const newCustomAttributes = cloneDeep(_customAttributes);
        newCustomAttributes[inputValue] = '';
        _setCustomAttributes(newCustomAttributes);
        return newCustomAttributes;
      });
      setInputValue('');
    }

    setShowInput(false);
  };

  const removeCustomAttribute = (customAttributeToRemove: string) => {
    const newCustomAttributes = cloneDeep(customAttributes);
    const isCustomAttributePresent = Object.keys(customAttributes).some(customAttribute => customAttribute === customAttributeToRemove);
    if (isCustomAttributePresent) {
      delete newCustomAttributes[customAttributeToRemove];
      setCustomAttributes(AttributeModifier.React, _customAttributes => newCustomAttributes);
      _setCustomAttributes(newCustomAttributes);
    }
  };

  const updateCustomAttributes = generateUpdateCustomAttributeListener(AttributeModifier.EasyEmail, _setCustomAttributes);
  const updatePredefinedAttributes = generateUpdatePredefinedAttributeListener(AttributeModifier.EasyEmail, _setPredefinedAttributes);

  // Effects:
  useEffect(() => {
    window.addEventListener('message', updateCustomAttributes);
    window.addEventListener('message', updatePredefinedAttributes);

    return () => {
      window.removeEventListener('message', updateCustomAttributes);
      window.removeEventListener('message', updatePredefinedAttributes);
    };
  }, []);

  // Return:
  if (!focusIdx) return null;

  return (
    // @ts-ignore
    <AttributesPanelWrapper style={{ padding: 0 }}>
      <Stack.Item fill>
        <Collapse defaultActiveKey={['0', '1', '2']}>
          <Collapse.Item
            name='0'
            header={`${templateType} Setting`}
          >
            <Space direction='vertical'>
              <InputWithUnitField
                label={'Width'}
                name={`${focusIdx}.attributes.width`}
                inline
              />
              <InputWithUnitField
                label={'Breakpoint'}
                helpText='Allows you to control on which breakpoint the layout should go desktop/mobile.'
                name={`${focusIdx}.data.value.breakpoint`}
                inline
              />
            </Space>
          </Collapse.Item>
          <Collapse.Item
            name='1'
            header={'Theme Setting'}
          >
            {/** @ts-ignore */}
            <Stack
              vertical
              spacing='tight'
            >
              <Grid.Row>
                <Grid.Col span={11}>
                  <FontFamily name={`${focusIdx}.data.value.font-family`} />
                </Grid.Col>
                <Grid.Col
                  offset={1}
                  span={11}
                >
                  <NumberField
                    label='Font size (px)'
                    name={`${focusIdx}.data.value.font-size`}
                    config={pixelAdapter}
                    autoComplete='off'
                  />
                </Grid.Col>
              </Grid.Row>

              <Grid.Row>
                <Grid.Col span={11}>
                  <InputWithUnitField
                    label={'Line height'}
                    unitOptions='percent'
                    name={`${focusIdx}.data.value.line-height`}
                  />
                </Grid.Col>
                <Grid.Col
                  offset={1}
                  span={11}
                >
                  <InputWithUnitField
                    label={'Font weight'}
                    unitOptions='percent'
                    name={`${focusIdx}.data.value.font-weight`}
                  />
                </Grid.Col>
              </Grid.Row>

              <Grid.Row>
                <Grid.Col span={11}>
                  <ColorPickerField
                    label={'Text color'}
                    name={`${focusIdx}.data.value.text-color`}
                  />
                </Grid.Col>
                <Grid.Col
                  offset={1}
                  span={11}
                >
                  <ColorPickerField
                    label={'Background'}
                    name={`${focusIdx}.attributes.background-color`}
                  />
                </Grid.Col>
              </Grid.Row>

              <Grid.Row>
                <ColorPickerField
                  label={'Content background'}
                  name={`${focusIdx}.data.value.content-background-color`}
                />
              </Grid.Row>

              <TextAreaField
                autoSize
                label={'User style'}
                name={`${focusIdx}.data.value.user-style.content`}
              />
              <Stack.Item />
              <Stack.Item />

              <Stack.Item />
              <Stack.Item />
            </Stack>
          </Collapse.Item>
          <Collapse.Item
            name='2'
            header={'Attributes'}
          >
            {/** @ts-ignore */}
            <Stack
              vertical
              spacing='tight'
            >
              <Stack.Item>
                <Space size={10} wrap>
                  {Object.keys(predefinedAttributes).map(tag => (<Tag key={tag}>{tag}</Tag>))}
                  {Object.keys(customAttributes).map(customAttribute => (
                    <Tag
                      key={customAttribute}
                      closable
                      onClose={() => removeCustomAttribute(customAttribute)}
                    >
                      {customAttribute}
                    </Tag>
                  ))}
                  {showInput ? (
                    <Input
                      autoFocus
                      size='mini'
                      value={inputValue}
                      style={{ width: 84 }}
                      onPressEnter={addCustomAttribute}
                      onBlur={addCustomAttribute}
                      onChange={setInputValue}
                    />
                  ) : (
                    <Tag
                      icon={<IconPlus />}
                      style={{
                        width: 'auto',
                        backgroundColor: 'var(--color-fill-2)',
                        border: '1px dashed var(--color-fill-3)',
                        cursor: 'pointer',
                      }}
                      className='add-tag'
                      tabIndex={0}
                      onClick={() => setShowInput(true)}
                      onKeyDown={event => {
                        if (event.key === 'Enter') {
                          setShowInput(true);
                        }
                      }}
                    >
                      Add Attribute
                    </Tag>
                  )}
                </Space>
              </Stack.Item>
            </Stack>
          </Collapse.Item>
        </Collapse>
      </Stack.Item>
    </AttributesPanelWrapper>
  );
};

// Exports:
export default CustomPagePanel;
