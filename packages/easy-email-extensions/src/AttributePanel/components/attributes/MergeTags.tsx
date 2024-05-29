import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Message, Tree, TreeSelect } from '@arco-design/web-react';
import { get, isObject } from 'lodash';
import { useBlock, useEditorProps, useFocusIdx } from 'easy-email-editor';
import {
  AttributeModifier,
  generateUpdateCustomAttributeListener,
  generateUpdatePredefinedAttributeListener,
  getCustomAttributes,
  getPredefinedAttributes,
} from 'attribute-manager';
import {
  AdvancedType,
  BasicType,
  getAncestryByIdx,
  getParentIdx
} from '@core';

export const MergeTags: React.FC<{
  onChange: (v: string) => void;
  value: string;
  isSelect?: boolean;
}> = React.memo((props) => {
  const { focusIdx } = useFocusIdx();
  const { values } = useBlock();
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const {
    mergeTagGenerate,
    // @ts-ignore
    renderMergeTagContent,
  } = useEditorProps();
  const [predefinedAttributes, _setPredefinedAttributes] = useState(getPredefinedAttributes());
  const [customAttributes, _setCustomAttributes] = useState(getCustomAttributes());

  const updateCustomAttributes = generateUpdateCustomAttributeListener(AttributeModifier.EasyEmail, _setCustomAttributes);
  const updatePredefinedAttributes = generateUpdatePredefinedAttributeListener(AttributeModifier.EasyEmail, _setPredefinedAttributes);

  const treeOptions = useMemo(() => {
    const treeData: Array<{
      key: any;
      value: any;
      title: string;
      children: never[];
    }> = [];
    const deep = (
      key: string,
      title: string,
      parent: { [key: string]: any; children?: any[]; },
      mapData: Array<any> = []
    ) => {
      const currentMapData = {
        key: key,
        value: key,
        title: title,
        children: [],
      };

      mapData.push(currentMapData);
      const current = parent[title];
      if (current && typeof current === 'object') {
        Object.keys(current).map((childKey) =>
          deep(key + '.' + childKey, childKey, current, currentMapData.children)
        );
      }
    };

    const mergeTags = {
      ...predefinedAttributes,
      ...customAttributes,
    };

    Object.keys(mergeTags).map((key) =>
      deep(key, key, mergeTags, treeData)
    );
    return treeData;
  }, [predefinedAttributes, customAttributes]);

  const onSelect = useCallback(
    (key: string) => {
      const isDataSourceProperty = key.includes('.');
      if (isDataSourceProperty) {
        const ancestors = getAncestryByIdx(values, getParentIdx(focusIdx) || '');
        const lastCommonGridAncestor = ancestors.find(ancestor => [AdvancedType.GRID, BasicType.GRID].includes(ancestor.type as any));

        if (!lastCommonGridAncestor) {
          Message.clear();
          Message.error('Cannot use Grid data source properties outside the Grid block!');
          return;
        } else {
          const dataSource = lastCommonGridAncestor.attributes['data-source'];
          const attributeDataSource = key.split('.')[0];
          if (dataSource !== attributeDataSource) {
            Message.clear();
            Message.error('Cannot use different Grid data source properties!');
            return;
          }
        }
      }

      const mergeTags = {
        ...predefinedAttributes,
        ...customAttributes,
      };

      const value = get(mergeTags, key);
      if (isObject(value)) {
        setExpandedKeys((keys) => {
          if (keys.includes(key)) {
            return keys.filter((k) => k !== key);
          } else {
            return [...keys, key];
          }
        });
        return;
      }
      return props.onChange(mergeTagGenerate(key));
    },
    [
      values,
      getParentIdx,
      focusIdx,
      predefinedAttributes,
      customAttributes,
      props,
      mergeTagGenerate
    ]
  );

  const mergeTagContent = useMemo(
    () =>
      renderMergeTagContent ? (
        renderMergeTagContent({
          onChange: props.onChange,
          isSelect: Boolean(props.isSelect),
          value: props.value,
        })
      ) : (
        <></>
      ),
    [renderMergeTagContent, props.onChange, props.isSelect, props.value]
  );

  useEffect(() => {
    window.addEventListener('message', updateCustomAttributes);
    window.addEventListener('message', updatePredefinedAttributes);

    return () => {
      window.removeEventListener('message', updateCustomAttributes);
      window.removeEventListener('message', updatePredefinedAttributes);
    };
  }, []);

  if (renderMergeTagContent) {
    return <>{mergeTagContent}</>;
  }

  return (
    <div
      style={{
        height: '7.55rem',
        paddingRight: '1rem',
        marginRight: '-0.5rem',
        marginLeft: '-1rem',
        overflowY: 'scroll',
        color: '#333',
      }}
    >
      {props.isSelect ? (
        <TreeSelect
          value={props.value}
          size='small'
          dropdownMenuStyle={{ maxHeight: 400, overflow: 'auto' }}
          placeholder={'Please select'}
          treeData={treeOptions}
          onChange={(val) => onSelect(val)}
        />
      ) : (
        <Tree
          expandedKeys={expandedKeys}
          onExpand={setExpandedKeys}
          selectedKeys={[]}
          treeData={treeOptions}
          onSelect={(vals: any[]) => onSelect(vals[0])}
          style={{
            maxHeight: 400,
            overflow: 'auto',
          }}
        />
      )}
    </div>
  );
});
