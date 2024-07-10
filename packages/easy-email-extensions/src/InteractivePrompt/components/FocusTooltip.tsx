import React, { useEffect, useState } from 'react';
import { AdvancedType, BasicType } from 'easy-email-core';
import { createPortal } from 'react-dom';
import {
  IconFont,
  useBlock,
  useFocusIdx,
  BlockAvatarWrapper,
  useFocusBlockLayout,
  getShadowRoot,
} from 'easy-email-editor';
import { Toolbar } from './Toolbar';
import { useExtensionProps } from '@extensions/components/Providers/ExtensionProvider';
import {
  ActionOrigin,
  generateUpdateCurrentFocusIdxListener,
  generateUpdateLastBlockModificationListener,
  getCurrentFocusBlock,
  getCurrentFocusIdx,
  setCurrentFocusBlock,
  setCurrentFocusIdx,
  setEnableAddConditionButton,
  setLastBlockModification
} from 'conditional-mapping-manager';
import { useForm } from 'react-final-form';
import { isEqual } from 'lodash';

export const FocusTooltip = () => {
  // Constants:
  const { change } = useForm();
  const { focusBlock } = useBlock();
  const { focusIdx, setFocusIdx } = useFocusIdx();
  const { focusBlockNode } = useFocusBlockLayout();
  const isPage = focusBlock?.type === BasicType.PAGE;
  const { isConditionalMapping = false } = useExtensionProps();

  // State:
  const [isUpdatingAttributesForBlock, setIsUpdatingAttributesForBlock] = useState(false);

  // Functions:
  const updateBlock = (idx: string, attributes: Record<string, string>, isReset = false) => {
    if (isReset) {
      change(`${idx}.attributes`, attributes);
    } else {
      const attributeEntries = Object.entries(attributes);
      for (const attributeEntry of attributeEntries) {
        change(`${idx}.attributes.${attributeEntry[0]}`, attributeEntry[1]);
      }
    }
  };

  // const updateBlockConditions = (_conditionalMappingConditions: Condition[]) => {
  //   const specificConditions = _conditionalMappingConditions.filter(condition => {
  //     const blockDataID = focusBlock?.attributes?.['data-id'];
  //     if (blockDataID) return blockDataID === condition.id;
  //     else return focusIdx === condition.focusIdx;
  //   });
  //   const encodedConditionString = window.btoa(JSON.stringify(specificConditions));
  //   change(`${focusIdx}.attributes.data-conditional-mapping`, encodedConditionString);
  // };

  const updateFocusIdx = generateUpdateCurrentFocusIdxListener(ActionOrigin.React, setFocusIdx);
  const updateLastBlockModification = generateUpdateLastBlockModificationListener(
    ActionOrigin.React,
    ({ idx, attributes, isReset }) => updateBlock(idx, attributes, isReset)
  );
  // const updateConditions = generateUpdateConditionalMappingConditionsListener(
  //   ActionOrigin.React,
  //   updateBlockConditions
  // );

  // Effects:
  // Makes text block uneditable during CM.
  useEffect(() => {
    if (!isConditionalMapping) return;
    if ([AdvancedType.TEXT, BasicType.TEXT].includes(focusBlock?.type as any)) {
      const shadowRoot = getShadowRoot();
      const textNodes = shadowRoot?.querySelectorAll(`[data-content_editable-idx="${focusIdx}.data.value.content"]`) ?? [];
      for (const textNode of textNodes) {
        if (textNode) {
          (textNode as HTMLDivElement).contentEditable = 'false';
        }
      }
    }
  }, [isConditionalMapping, focusIdx, focusBlock]);

  useEffect(() => {
    const currentFocusIdx = getCurrentFocusIdx();
    if (currentFocusIdx !== focusIdx) setCurrentFocusIdx(ActionOrigin.EasyEmail, focusIdx);
  }, [focusIdx]);

  useEffect(() => {
    const currentFocusBlock = getCurrentFocusBlock();
    if (!isEqual(currentFocusBlock, focusBlock) && !isUpdatingAttributesForBlock) setCurrentFocusBlock(ActionOrigin.EasyEmail, focusBlock);
  }, [focusBlock, isUpdatingAttributesForBlock]);

  useEffect(() => {
    setIsUpdatingAttributesForBlock(true);
    setLastBlockModification(ActionOrigin.EasyEmail, {
      idx: focusIdx,
      attributes: focusBlock?.attributes ?? {},
    });
    setIsUpdatingAttributesForBlock(false);
  }, [focusIdx, focusBlock]);

  useEffect(() => {
    const blockDataID = focusBlock?.attributes?.['data-id'];
    setEnableAddConditionButton(ActionOrigin.EasyEmail, !!blockDataID);
  }, [focusBlock]);

  useEffect(() => {
    window.addEventListener('message', updateFocusIdx);
    window.addEventListener('message', updateLastBlockModification);

    return () => {
      window.removeEventListener('message', updateFocusIdx);
      window.removeEventListener('message', updateLastBlockModification);
    };
  }, []);

  // useEffect(() => {
  //   window.addEventListener('message', updateConditions);

  //   return () => {
  //     window.removeEventListener('message', updateConditions);
  //   };
  // }, [focusIdx, focusBlock]);

  // Return:
  if (!focusBlockNode || !focusBlock) return null;
  return (
    <>
      {createPortal(
        <div
          id='easy-email-extensions-InteractivePrompt-FocusTooltip'
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            left: 0,
            top: 0,
            zIndex: 1,
          }}
        >
          <style>
            {`
                .email-block {
                  position: relative;
                }

            `}
          </style>
          {/* drag */}
          {!isConditionalMapping && (
            <div
              style={{
                position: 'absolute',
                zIndex: 9999,
                right: 0,
                top: '50%',
                display: isPage ? 'none' : undefined,
              }}
            >
              {/* @ts-ignore */}
              <BlockAvatarWrapper
                idx={focusIdx}
                type={focusBlock.type}
                action='move'
              >
                <div
                  style={
                    {
                      position: 'absolute',
                      backgroundColor: 'var(--selected-color)',
                      color: '#ffffff',
                      height: '28px',
                      width: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: 'translate(-50%, -50%)',
                      borderRadius: '50%',
                      cursor: 'grab',
                      pointerEvents: 'auto',
                      WebkitUserDrag: 'element',
                    } as any
                  }
                >
                  {/* @ts-ignore */}
                  <IconFont
                    iconName='icon-move'
                    style={{ color: '#fff', cursor: 'grab' }}
                  />
                </div>
              </BlockAvatarWrapper>
            </div>
          )}

          {/* outline */}
          <div
            style={{
              position: 'absolute',
              fontSize: 14,
              zIndex: 2,
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              outlineOffset: '-2px',
              outline: '2px solid var(--selected-color)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              fontSize: 14,
              zIndex: 3,
              left: 0,
              top: 0,
              width: '0%',
              height: '100%',
            }}
          >
            {/* @ts-ignore */}
            <Toolbar />
          </div>
        </div>,

        focusBlockNode
      )}
    </>
  );
};
