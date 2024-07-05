// Packages:
import React, { useEffect, useState } from 'react';
import { useField, useForm } from 'react-final-form';
import { validateBlockID } from '@extensions/utils/blockIDManager';
import {
  AttributeModifier,
  generateUpdateCustomAttributeListener,
  generateUpdatePredefinedAttributeListener,
  getCustomAttributes,
  getPredefinedAttributes
} from 'attribute-manager';
import { useExtensionProps } from '@extensions/components/Providers/ExtensionProvider';
import useBlockID from '@extensions/AttributePanel/hooks/useBlockID';
import { getConditionalMappingConditions } from 'conditional-mapping-manager';
import { CustomSection, getCustomBlocks } from 'custom-block-manager';
import { customAlphabet } from 'nanoid';

// Components:
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
import { SelectField, TextField } from '../../../../components/Form';
import { IconFont, useFocusIdx, Stack } from 'easy-email-editor';
import { AttributesPanelWrapper } from '../../attributes/AttributesPanelWrapper';
import { MergeTags } from '../../attributes';
import { ClassName } from '../../attributes/ClassName';
import { CollapseWrapper } from '../../attributes/CollapseWrapper';

// Functions:
const generateVariableName = (prefix: string = 'var'): string => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nanoid = customAlphabet(alphabet, 10);
  return `${prefix}_${nanoid()}`;
};

const InputFieldWithMergeTags = ({
  mergeTags,
  label,
  name,
}: {
  mergeTags: {
    [x: string]: string;
  };
  label: string;
  name: string;
}) => {
  // Constants:
  const { change } = useForm();
  const field = useField(name);

  // Return:
  return (
    <div className='arco-form-label-item' style={{ display: 'flex', flexDirection: 'column', gap: '0', width: '100%', marginBottom: '1rem', marginTop: '0.5rem' }}>
      <label style={{ textAlign: 'left' }}>{label}</label>
      <Grid.Row style={{ display: 'flex', width: '100%' }}>
        {mergeTags && (
          <Popover
            trigger='click'
            content={<MergeTags value={field.input.value} onChange={value => {
              console.log(name, value);
              change(name, value);
            }} />}
          >
            <ArcoButton icon={<IconFont iconName='icon-merge-tags' />} />
          </Popover>
        )}
        <TextField
          name={name}
          style={{
            width: 'calc(100% - 32px)'
          }}
        />
      </Grid.Row>
    </div>
  );
};

export const Custom = () => {
  // Constants:
  const customBlocks = getCustomBlocks() ?? [];
  const { change } = useForm();
  const { focusIdx } = useFocusIdx();
  const { lastValidDataID, onBlurCapture } = useBlockID();
  const { isConditionalMapping = false } = useExtensionProps();
  const dataCustomComponentID = useField(`${focusIdx}.attributes.data-custom-component-id`);

  // State:
  const [predefinedAttributes, _setPredefinedAttributes] = useState(getPredefinedAttributes());
  const [customAttributes, _setCustomAttributes] = useState(getCustomAttributes());
  const mergeTags = {
    ...predefinedAttributes,
    ...customAttributes,
  };
  const [customComponentsTree, setCustomComponentsTree] = useState<{
    value: string;
    label: React.ReactNode;
  }[]>([]);
  const [customConfiguration, setCustomConfiguration] = useState<{ sections: CustomSection[]; }>({ sections: [] });

  // Functions:
  const updateCustomAttributes = generateUpdateCustomAttributeListener(AttributeModifier.EasyEmail, _setCustomAttributes);
  const updatePredefinedAttributes = generateUpdatePredefinedAttributeListener(AttributeModifier.EasyEmail, _setPredefinedAttributes);

  // Effects:
  useEffect(() => {
    const _customComponentsTree = customBlocks.map(customBlock => ({
      label: customBlock.label,
      value: customBlock.id
    }));
    setCustomComponentsTree(_customComponentsTree);
  }, []);

  useEffect(() => {
    const selectedCustomBlock = customBlocks.find(customBlock => customBlock.id === dataCustomComponentID.input.value);
    if (selectedCustomBlock) {
      // const customComponentName = selectedCustomBlock.label.split(' ').join('');
      const customComponentName = generateVariableName();
      const script = `class ${customComponentName} extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const observer = new MutationObserver((mutationRecords) => {
      mutationRecords.forEach(record => {
        this.render();
      });
    }).observe(this, { attributes: true });
    this.render();
  }

  render () {
    const attributes = Object.entries(this.dataset ?? {}).reduce((array, entry) => ({ ...array, ['data-' + entry[0]]: entry[1]}), {});
    this.shadowRoot.innerHTML = new Function('attributes', window.atob("${selectedCustomBlock.code}"))(attributes);
  }
}

try {
  if (!customElements.get("${selectedCustomBlock.id}")) customElements.define("${selectedCustomBlock.id}", ${customComponentName});
} catch (error) {
  console.error(error);
}
`;
      new Function(script)();

      setCustomConfiguration(JSON.parse(selectedCustomBlock.configuration));
      change(`${focusIdx}.attributes.data-custom-component-label`, selectedCustomBlock.label);
      change(`${focusIdx}.attributes.data-custom-component-code`, selectedCustomBlock.code);
    }
  }, [focusIdx, dataCustomComponentID.input.value]);

  useEffect(() => {
    window.addEventListener('message', updateCustomAttributes);
    window.addEventListener('message', updatePredefinedAttributes);

    return () => {
      window.removeEventListener('message', updateCustomAttributes);
      window.removeEventListener('message', updatePredefinedAttributes);
    };
  }, []);

  // Return:
  return (
    <AttributesPanelWrapper>
      <CollapseWrapper defaultActiveKey={['1']}>
        <Collapse.Item name='1' header={String('Settings')}>
          {/* @ts-ignore */}
          <Stack vertical spacing='tight'>
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
            <SelectField
              label={'Custom Component'}
              name={`${focusIdx}.attributes.data-custom-component-id`}
              options={customComponentsTree}
              style={{ paddingBottom: '1rem' }}
            />
          </Stack>
        </Collapse.Item>
        {
          (
            dataCustomComponentID.input.value &&
            customConfiguration.sections.length > 0
          ) && (
            <>
              {
                customConfiguration.sections.map((section, sectionIndex) => (
                  // @ts-ignore
                  <Collapse.Item key={`section-${sectionIndex}`} name={(sectionIndex + 1).toString()} header={section.header}>
                    {/* @ts-ignore */}
                    <Stack vertical spacing='tight'>
                      {
                        section.fields.map((field, fieldIndex) => {
                          if (field.type === 'text') return (
                            <InputFieldWithMergeTags
                              key={`section-${sectionIndex}-field-${fieldIndex}`}
                              label={field.label}
                              name={`${focusIdx}.attributes.${field.attribute}`}
                              mergeTags={mergeTags}
                            />
                          );
                          else if (field.type === 'select') return (
                            <SelectField
                              key={`section-${sectionIndex}-field-${fieldIndex}`}
                              label={field.label}
                              name={`${focusIdx}.attributes.${field.attribute}`}
                              options={field.options}
                              style={{ width: '72%', paddingRight: '1rem' }}
                            />
                          );
                        })
                      }
                    </Stack>
                  </Collapse.Item>
                ))
              }
            </>
          )
        }
      </CollapseWrapper>
    </AttributesPanelWrapper>
  );
};
