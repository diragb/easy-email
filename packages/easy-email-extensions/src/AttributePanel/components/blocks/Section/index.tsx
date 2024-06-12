import React, { useCallback } from 'react';
import { Padding } from '@extensions/AttributePanel/components/attributes/Padding';
import { Background } from '@extensions/AttributePanel/components/attributes/Background';
import { Border } from '@extensions/AttributePanel/components/attributes/Border';
import { AttributesPanelWrapper } from '@extensions/AttributePanel/components/attributes/AttributesPanelWrapper';
import { Collapse, Grid, Space, Switch } from '@arco-design/web-react';
import { Stack, useBlock, useFocusIdx } from 'easy-email-editor';
import { BasicType, BlockManager } from 'easy-email-core';
import { ClassName } from '../../attributes/ClassName';
import { CollapseWrapper } from '../../attributes/CollapseWrapper';
import { TextField } from '@extensions/components/Form';
import { isIDValid } from '@extensions/utils/blockIDManager';
import { useExtensionProps } from '@extensions/components/Providers/ExtensionProvider';

export function Section() {
  const { focusBlock, setFocusBlock } = useBlock();
  const { focusIdx } = useFocusIdx();
  const { isConditionalMapping = false } = useExtensionProps();

  const noWrap = focusBlock?.data.value.noWrap;

  const onChange = useCallback((checked: any) => {
    if (!focusBlock) return;
    focusBlock.data.value.noWrap = checked;
    if (checked) {
      const children = [...focusBlock.children];
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!child) continue;
        if (child.type === BasicType.GROUP) {
          children.splice(i, 1, ...child.children);
        }
      }
      focusBlock.children = [
        BlockManager.getBlockByType(BasicType.GROUP)!.create({
          children: children,
        }),
      ];
    } else {
      if (
        focusBlock.children.length === 1 &&
        focusBlock.children[0].type === BasicType.GROUP
      ) {
        focusBlock.children = focusBlock.children[0]?.children || [];
      }
    }
    setFocusBlock({ ...focusBlock });
  }, [focusBlock, setFocusBlock]);

  return (
    <AttributesPanelWrapper style={{ padding: 0 }}>
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
              disabled={isConditionalMapping}
            />
          </Stack>
        </Collapse.Item>
        <Collapse.Item name='0' header={String('Dimension')}>
          <Space direction='vertical'>
            <Grid.Row>
              <Grid.Col span={12}>
                <label style={{ width: '100%', display: 'flex' }}>
                  <div style={{ flex: 1 }}>{String('Group')}</div>
                </label>
                <Switch
                  checked={noWrap}
                  checkedText={String('True')}
                  uncheckedText={String('False')}
                  onChange={onChange}
                />
              </Grid.Col>
              <Grid.Col span={12} />
            </Grid.Row>

            <Padding />
          </Space>
        </Collapse.Item>
        <Collapse.Item name='1' header={String('Background')}>
          {/* @ts-ignore */}
          <Stack vertical spacing='tight'>
            <Background />
          </Stack>
        </Collapse.Item>
        <Collapse.Item name='2' header={String('Border')}>
          <Border />
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
