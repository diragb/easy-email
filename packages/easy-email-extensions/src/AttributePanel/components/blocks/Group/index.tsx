import React from 'react';
import { Width } from '@extensions/AttributePanel/components/attributes/Width';
import { BackgroundColor } from '@extensions/AttributePanel/components/attributes/BackgroundColor';
import { VerticalAlign } from '@extensions/AttributePanel/components/attributes/VerticalAlign';
import { Collapse, Grid, Space } from '@arco-design/web-react';
import { AttributesPanelWrapper } from '@extensions/AttributePanel/components/attributes/AttributesPanelWrapper';
import { ClassName } from '../../attributes/ClassName';
import { CollapseWrapper } from '../../attributes/CollapseWrapper';
import { Stack, useFocusIdx } from 'easy-email-editor';
import { TextField } from '@extensions/components/Form';
import { validateBlockID } from '@extensions/utils/blockIDManager';
import { useExtensionProps } from '@extensions/components/Providers/ExtensionProvider';
import useBlockID from '@extensions/AttributePanel/hooks/useBlockID';
import { getConditionalMappingConditions } from 'conditional-mapping-manager';

export function Group() {
  const { focusIdx } = useFocusIdx();
  const { isConditionalMapping = false } = useExtensionProps();
  const { lastValidDataID, onBlurCapture } = useBlockID();

  return (
    <AttributesPanelWrapper>
      <CollapseWrapper defaultActiveKey={['0', '1', '2']}>
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
              style={{
                paddingBottom: '1rem',
              }}
              disabled={isConditionalMapping}
              onBlurCapture={onBlurCapture}
            />
          </Stack>
        </Collapse.Item>
        <Collapse.Item name='0' header={String('Dimension')}>
          <Grid.Row>
            <Grid.Col span={11}>
              <Width />
            </Grid.Col>
            <Grid.Col offset={1} span={11}>
              <VerticalAlign />
            </Grid.Col>
          </Grid.Row>
        </Collapse.Item>
        <Collapse.Item name='1' header={String('Background')}>
          <Grid.Row>
            <Grid.Col span={11}>
              <BackgroundColor />
            </Grid.Col>
            <Grid.Col offset={1} span={11} />
          </Grid.Row>
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
