import { useEditorContext } from '@/hooks/useEditorContext';
import { useEditorProps } from '@/hooks/useEditorProps';
import { useLazyState } from '@/hooks/useLazyState';
import { HtmlStringToPreviewReactNodes } from '@/utils/HtmlStringToPreviewReactNodes';
import { AttributeModifier, generateUpdateCustomAttributeListener, generateUpdatePredefinedAttributeListener, getCustomAttributes, getPredefinedAttributes } from 'attribute-manager';
import { JsonToMjml } from 'easy-email-core';
import { cloneDeep, isString } from 'lodash';
import mjml from 'mjml-browser';
import React, { useEffect, useMemo, useRef, useState } from 'react';

export const MOBILE_WIDTH = 320;

export const PreviewEmailContext = React.createContext<{
  html: string;
  reactNode: React.ReactNode | null;
  errMsg: React.ReactNode;
  mobileWidth: number;
}>({
  html: '',
  reactNode: null,
  errMsg: '',
  mobileWidth: 320,
});

export const PreviewEmailProvider: React.FC<{ children?: React.ReactNode; }> = props => {
  const { current: iframe } = useRef(document.createElement('iframe'));
  const contentWindowRef = useRef<Window | null>(null);

  const [mobileWidth, setMobileWidth] = useState(MOBILE_WIDTH);

  const { pageData } = useEditorContext();
  const { onBeforePreview, previewInjectData } = useEditorProps();
  const [errMsg, setErrMsg] = useState<React.ReactNode>('');
  const [html, setHtml] = useState('');
  const lazyPageData = useLazyState(pageData, 0);
  const [predefinedAttributes, _setPredefinedAttributes] = useState(getPredefinedAttributes());
  const [customAttributes, _setCustomAttributes] = useState(getCustomAttributes());

  const updateCustomAttributes = generateUpdateCustomAttributeListener(AttributeModifier.React, _setCustomAttributes);
  const updatePredefinedAttributes = generateUpdatePredefinedAttributeListener(AttributeModifier.React, _setPredefinedAttributes);

  const injectData = useMemo(() => {
    const mergeTags = {
      ...predefinedAttributes,
      ...customAttributes,
    };

    if (previewInjectData) {
      return previewInjectData;
    }

    if (mergeTags) return mergeTags;
    return {};
  }, [predefinedAttributes, customAttributes, previewInjectData]);

  const htmlNode = useMemo(() => HtmlStringToPreviewReactNodes(html), [html]);

  useEffect(() => {
    const breakpoint = parseInt(lazyPageData.data.value.breakpoint || '0');
    let adjustBreakPoint = breakpoint;
    if (breakpoint > 360) {
      adjustBreakPoint = Math.max(mobileWidth + 1, breakpoint);
    }

    const cloneData = {
      ...lazyPageData,
      data: {
        ...lazyPageData.data,
        value: {
          ...lazyPageData.data.value,
          breakpoint: adjustBreakPoint + 'px',
        },
      },
    };

    let parseHtml = mjml(
      JsonToMjml({
        data: cloneData,
        mode: 'production',
        context: cloneData,
        dataSource: cloneDeep(injectData),
        keepClassName: true,
      }),
    ).html;

    if (onBeforePreview) {
      try {
        const result = onBeforePreview(parseHtml, injectData);
        if (isString(result)) {
          parseHtml = result;
          setHtml(parseHtml);
        } else {
          result.then(resHtml => {
            parseHtml = resHtml;
            setHtml(parseHtml);
          });
        }

        setErrMsg('');
      } catch (error: any) {
        setErrMsg(error?.message || error);
      }
    } else {
      setHtml(parseHtml);
    }

    return () => {
      setHtml('');
    };
  }, [injectData, onBeforePreview, lazyPageData, mobileWidth]);

  useEffect(() => {
    if (errMsg) return;

    iframe.width = '400px';
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.onload = evt => {
      contentWindowRef.current = (evt.target as any)?.contentWindow;
    };

    document.body.appendChild(iframe);

    return () => {
      document.body.removeChild(iframe);
    };
  }, [errMsg, html, iframe]);

  useEffect(() => {
    if (!contentWindowRef.current) return;
    const innerBody = contentWindowRef.current.document.body;
    innerBody.innerHTML = html;
    const a = innerBody.querySelector('.mjml-body') as HTMLElement;
    if (a) {
      a.style.display = 'inline-block';
      setMobileWidth(Math.max(a.clientWidth, MOBILE_WIDTH));
    }
    return () => {
      innerBody.innerHTML = '';
    };
  }, [html]);

  useEffect(() => {
    window.addEventListener('message', updateCustomAttributes);
    window.addEventListener('message', updatePredefinedAttributes);

    return () => {
      window.removeEventListener('message', updateCustomAttributes);
      window.removeEventListener('message', updatePredefinedAttributes);
    };
  }, []);

  const value = useMemo(() => {
    return {
      reactNode: htmlNode,
      html,
      errMsg,
      mobileWidth,
    };
  }, [errMsg, html, htmlNode, mobileWidth]);

  return (
    // @ts-ignore
    <PreviewEmailContext.Provider value={value}>
      {props.children}
    </PreviewEmailContext.Provider>
  );
};
