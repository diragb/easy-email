import { IconFont, useBlock, useEditorProps, useFocusIdx } from 'easy-email-editor';
import { useAddToCollection } from '@extensions/hooks/useAddToCollection';
import { getParentIdx } from 'easy-email-core';
import React from 'react';
import { ToolItem } from './ToolItem';
import { useExtensionProps } from '@extensions/components/Providers/ExtensionProvider';

export function BasicTools() {
  const { copyBlock, removeBlock } = useBlock();
  const { focusIdx, setFocusIdx } = useFocusIdx();
  const { modal, setModalVisible } = useAddToCollection();
  const { onAddCollection } = useEditorProps();
  const { isConditionalMapping = false } = useExtensionProps();

  const handleAddToCollection = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setModalVisible(true);
  };

  const handleCopy: React.MouseEventHandler<any> = (ev) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    copyBlock(focusIdx);
  };

  const handleDelete = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    removeBlock(focusIdx);
  };

  const handleSelectParent = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    // @ts-ignore
    setFocusIdx(getParentIdx(focusIdx)!);
  };

  return (
    <div style={{ marginRight: 40 }}>
      <span style={{ position: 'relative', marginRight: 10, color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, San Francisco, Segoe UI' }}>Text</span>
      {
        !isConditionalMapping && (
          <>
            <ToolItem
              onClick={handleSelectParent}
              title={String('Select parent block')}
              icon={<IconFont iconName='icon-back-parent' />}
            />
            <ToolItem
              onClick={handleCopy}
              title={String('Copy')}
              icon={<IconFont iconName='icon-copy' />}
            />
            {
              onAddCollection && (
                <ToolItem
                  onClick={handleAddToCollection}
                  title={String('Add to collection')}
                  icon={<IconFont iconName='icon-collection' />}
                />
              )
            }
            <ToolItem
              onClick={handleDelete}
              title={String('Delete')}
              icon={<IconFont iconName='icon-delete' />}
            />
          </>
        )
      }
      {modal}
    </div>
  );
}
