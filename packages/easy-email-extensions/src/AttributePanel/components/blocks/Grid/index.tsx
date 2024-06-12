import React, { useEffect, useState } from 'react';

import { Collapse, Grid as _Grid, Space, Dropdown, Tag, Input } from '@arco-design/web-react';
import { AttributesPanelWrapper } from '@extensions/AttributePanel/components/attributes/AttributesPanelWrapper';
import { Padding } from '@extensions/AttributePanel/components/attributes/Padding';
import { Width } from '@extensions/AttributePanel/components/attributes/Width';
import { VerticalAlign } from '@extensions/AttributePanel/components/attributes/VerticalAlign';
import { Background } from '@extensions/AttributePanel/components/attributes/Background';
import { Border } from '@extensions/AttributePanel/components/attributes/Border';
import { ClassName } from '../../attributes/ClassName';
import { CollapseWrapper } from '../../attributes/CollapseWrapper';
import { Stack, useFocusIdx } from 'easy-email-editor';
import { SelectField, TextField } from '@extensions/components/Form';
import { isIDValid } from '@extensions/utils/blockIDManager';
import { isNumber } from '@extensions/AttributePanel/utils/InputNumberAdapter';
import {
  AttributeModifier,
  generateUpdateCustomAttributeListener,
  getCustomAttributes,
  setCustomAttributes
} from 'attribute-manager';
import { cloneDeep, zipObject } from 'lodash';
import { useField } from 'react-final-form';
import { IconPlus } from '@arco-design/web-react/icon';
import { useExtensionProps } from '@extensions/components/Providers/ExtensionProvider';

export function Grid() {
  // Constants:
  const { focusIdx } = useFocusIdx();
  const { isConditionalMapping = false } = useExtensionProps();
  const dataSource = useField(`${focusIdx}.attributes.data-source`);

  // State:
  const [customAttributes, _setCustomAttributes] = useState(getCustomAttributes());
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [dataSourceValue, setDataSourceValue] = useState(dataSource.input.value);
  const [localDataSourceProperties, setLocalDataSourceProperties] = useState<string[]>(
    Object
      .keys(getCustomAttributes())
      .map(attribute => {
        if (attribute.includes('.')) {
          const attributeSegments = attribute.split('.');
          const attributeDataSource = attributeSegments[0];
          if (attributeDataSource === dataSource.input.value) {
            attributeSegments.shift();
            return attributeSegments.join('.');
          } else return undefined;
        } else return undefined;
      })
      .filter(attribute => !!attribute) as string[]
  );

  // Functions:
  const addCustomAttribute = () => {
    const _inputValue = inputValue.replace(/\s/g, '_').trim();
    if (_inputValue.length === 0) return;

    setLocalDataSourceProperties(_localDataSourceProperties => [...localDataSourceProperties, _inputValue]);
    const sanitizedDataSource = dataSource.input.value.replace(/\./g, '-').replace(/\s/g, '_');
    const sanitizedInputValue = `${sanitizedDataSource}.${_inputValue}`;
    const isCustomAttributeAlreadyDefined = Object
      .keys(customAttributes)
      .some(customAttribute => customAttribute === sanitizedInputValue);
    if (sanitizedInputValue && !isCustomAttributeAlreadyDefined) {
      setCustomAttributes(AttributeModifier.React, _customAttributes => {
        const newCustomAttributes = cloneDeep(_customAttributes);
        newCustomAttributes[sanitizedInputValue] = '';
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
    setLocalDataSourceProperties(_localDataSourceProperties => {
      const propertySegments = customAttributeToRemove.split('.');
      propertySegments.shift();
      const propertyName = propertySegments.join('.');

      return _localDataSourceProperties.filter(property => property !== propertyName);
    });
    if (isCustomAttributePresent) {
      delete newCustomAttributes[customAttributeToRemove];
      setCustomAttributes(AttributeModifier.React, _customAttributes => newCustomAttributes);
      _setCustomAttributes(newCustomAttributes);
    }
  };

  const updateCustomAttributes = generateUpdateCustomAttributeListener(AttributeModifier.EasyEmail, _setCustomAttributes);

  // Effects:
  useEffect(() => {
    const sanitizedDataSource = dataSource.input.value.replace(/\./g, '-').replace(/\s/g, '_');
    const sanitizedDataSourceValue = dataSourceValue.replace(/\./g, '-').replace(/\s/g, '_');

    if (sanitizedDataSource.trim().length > 0 && sanitizedDataSource !== sanitizedDataSourceValue) {
      setCustomAttributes(AttributeModifier.React, _customAttributes => {
        const newCustomAttributes = cloneDeep(_customAttributes);
        const transformedCustomAttributes = Object.keys(newCustomAttributes).map(_customAttribute => {
          if (_customAttribute.includes('.')) {
            const segments = _customAttribute.split('.');
            segments.shift();
            const propertyName = segments.join('.');
            if (localDataSourceProperties.includes(propertyName)) {
              return [sanitizedDataSource, propertyName].join('.');
            } else return _customAttribute;
          } else return _customAttribute;
        });
        const finalCustomAttributesArray = [...transformedCustomAttributes.filter(attribute => attribute !== sanitizedDataSourceValue), sanitizedDataSource];
        const finalCustomAttributes = {
          ...zipObject(finalCustomAttributesArray, Array(finalCustomAttributesArray.length).fill('')),
        };
        setDataSourceValue(sanitizedDataSource);

        _setCustomAttributes(finalCustomAttributes);
        return finalCustomAttributes;
      });
    }
  }, [dataSource.input.value, dataSourceValue, setCustomAttributes, localDataSourceProperties]);

  useEffect(() => {
    window.addEventListener('message', updateCustomAttributes);

    return () => {
      window.removeEventListener('message', updateCustomAttributes);
    };
  }, []);

  // Return:
  return (
    <AttributesPanelWrapper>
      <CollapseWrapper defaultActiveKey={['0', '1', '2', '3', '4', '5']}>
        <Collapse.Item name='0' header={'Settings'}>
          {/* @ts-ignore */}
          <Stack vertical>
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
              disabled={isConditionalMapping}
            />
          </Stack>
          {/* @ts-ignore */}
          <Stack vertical>
            <SelectField
              label={(
                <Space>
                  <span>{String('Direction')}</span>
                </Space>
              )}
              name={`${focusIdx}.attributes.data-direction`}
              options={[
                { value: 'row', label: 'Row' },
                { value: 'column', label: 'Column' },
              ]}
              style={{
                width: '100%',
                paddingBottom: '1rem',
              }}
            />
          </Stack>
          {/* @ts-ignore */}
          <Stack vertical>
            <TextField
              label={(
                <Space>
                  <span>{String('Threshold')}</span>
                </Space>
              )}
              name={`${focusIdx}.attributes.data-threshold`}
              validate={value => (value?.trim()?.length ?? 0) > 0 && isNaN(parseInt(value)) ? 'Please enter a number!' : undefined}
              style={{
                paddingBottom: '1rem',
              }}
            />
          </Stack>
          {/* @ts-ignore */}
          <Stack vertical>
            <TextField
              label={(
                <Space>
                  <span>{String('Data Source')}<span style={{ color: 'red' }}>*</span></span>
                </Space>
              )}
              name={`${focusIdx}.attributes.data-source`}
              validate={value => (value?.trim()?.length ?? 0) > 0 ? undefined : 'Please enter the name of the data source!'}
              style={{
                paddingBottom: '1rem',
              }}
            />
          </Stack>
        </Collapse.Item>
        <Collapse.Item name='1' header={'Data Source Properties'} >
          {/** @ts-ignore */}
          <Stack vertical spacing='tight'>
            {/** @ts-ignore */}
            <Stack.Item>
              <Space size={10} wrap>
                {dataSource.input.value && Object
                  .keys(customAttributes)
                  .filter(customAttribute => customAttribute.includes('.') && customAttribute.split('.')[0] === dataSource.input.value)
                  .map(customAttribute => (
                    <Tag
                      key={customAttribute}
                      closable
                      onClose={() => removeCustomAttribute(customAttribute)}
                    >
                      {customAttribute}
                    </Tag>
                  )
                  )}
                {dataSource.input.value ? (showInput ? (
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
                    Add Property
                  </Tag>
                )) : (
                  <div style={{ fontSize: '12px', marginLeft: '-10px' }}>Please add a data source to add properties.</div>
                )}
              </Space>
              {/** @ts-ignore */}
            </Stack.Item>
          </Stack>
        </Collapse.Item>
        <Collapse.Item name='2' header={'Dimension'} >
          <Space direction='vertical'>
            <_Grid.Row>
              <_Grid.Col span={11}>
                <Width />
              </_Grid.Col>
              <_Grid.Col
                offset={1}
                span={11}
              >
                <VerticalAlign />
              </_Grid.Col>
            </_Grid.Row>

            <Padding />
          </Space>
        </Collapse.Item>
        <Collapse.Item name='3' header={'Background'} >
          <Background />
        </Collapse.Item>
        <Collapse.Item name='4' header={'Border'} >
          <Border />
        </Collapse.Item>
        <Collapse.Item name='5' header={'Extra'} >
          <_Grid.Col span={24}>
            <ClassName />
          </_Grid.Col>
        </Collapse.Item>
      </CollapseWrapper>
    </AttributesPanelWrapper>
  );
}
