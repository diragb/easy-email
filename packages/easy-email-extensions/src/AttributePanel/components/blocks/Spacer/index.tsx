import React from 'react';
import { Height } from '@extensions/AttributePanel/components/attributes/Height';
import { ContainerBackgroundColor } from '@extensions/AttributePanel/components/attributes/ContainerBackgroundColor';
import { Padding } from '@extensions/AttributePanel/components/attributes/Padding';
import { AttributesPanelWrapper } from '@extensions/AttributePanel/components/attributes/AttributesPanelWrapper';
import { Collapse, Grid, Space } from '@arco-design/web-react';
import { ClassName } from '../../attributes/ClassName';
import { CollapseWrapper } from '../../attributes/CollapseWrapper';
import { TextField } from '@extensions/components/Form';
import { validateBlockID } from '@extensions/utils/blockIDManager';
import { useFocusIdx } from 'easy-email-editor';
import { useExtensionProps } from '@extensions/components/Providers/ExtensionProvider';
import { getConditionalMappingConditions } from 'conditional-mapping-manager';
import useBlockID from '@extensions/AttributePanel/hooks/useBlockID';

export function Spacer() {
  const { focusIdx } = useFocusIdx();
  const { isConditionalMapping = false } = useExtensionProps();
  const { lastValidDataID, onBlurCapture } = useBlockID();

  return (
    <AttributesPanelWrapper>
      <CollapseWrapper defaultActiveKey={['-1', '0', '1', '2', '3']}>
        <Collapse.Item name='1' header={String('Dimension')}>
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
            <Height />
            <Padding />
          </Space>
        </Collapse.Item>

        <Collapse.Item name='2' header={String('Background')}>
          <ContainerBackgroundColor title={String('Background color')} />
        </Collapse.Item>

        <Collapse.Item name='4' header={String('Extra')}>
          <Grid.Col span={24}>
            <ClassName />
          </Grid.Col>
        </Collapse.Item>
      </CollapseWrapper>
    </AttributesPanelWrapper>
  );
}
