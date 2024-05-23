import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  Dropdown,
  Grid,
  Input,
  Menu,
  Message,
  Modal,
  Popover,
  Spin,
  Button as ArcoButton,
} from '@arco-design/web-react';
import { IconPlus, IconEye, IconDelete, IconImage, IconClose } from '@arco-design/web-react/icon';
import styles from './index.module.scss';
import { Uploader, UploaderServer } from '@extensions/AttributePanel/utils/Uploader';
import { classnames } from '@extensions/AttributePanel/utils/classnames';
import { previewLoadImage } from '@extensions/AttributePanel/utils/previewLoadImage';
import { MergeTags } from '@extensions';
import { IconFont, useFocusIdx } from 'easy-email-editor';
import { AttributeModifier, generateUpdateCustomAttributeListener, generateUpdatePredefinedAttributeListener, getCustomAttributes, getPredefinedAttributes } from 'attribute-manager';
import { useField, useForm } from 'react-final-form';

export interface ImageUploaderProps {
  onChange: (val: string) => void;
  value: string;
  label: string;
  uploadHandler?: UploaderServer;
  autoCompleteOptions?: Array<{ value: string; label: React.ReactNode; }>;
  isImage?: boolean;
}

export function ImageUploader(props: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const uploadHandlerRef = useRef<UploaderServer | null | undefined>(
    props.uploadHandler
  );
  const [predefinedAttributes, _setPredefinedAttributes] = useState(getPredefinedAttributes());
  const [customAttributes, _setCustomAttributes] = useState(getCustomAttributes());
  const { change } = useForm();
  const { focusIdx } = useFocusIdx();
  const dataImageName = useField(`${focusIdx}.attributes.data-${props.isImage ? '' : 'background-'}image-name`);

  const updateCustomAttributes = generateUpdateCustomAttributeListener(AttributeModifier.EasyEmail, _setCustomAttributes);
  const updatePredefinedAttributes = generateUpdatePredefinedAttributeListener(AttributeModifier.EasyEmail, _setPredefinedAttributes);

  const mergeTags = {
    ...predefinedAttributes,
    ...customAttributes,
  };
  const onChange = props.onChange;

  const onUpload = useCallback(() => {
    if (isUploading) {
      return Message.warning(String('Uploading...'));
    }
    if (!uploadHandlerRef.current) return;

    const uploader = new Uploader(uploadHandlerRef.current, {
      limit: 1,
      accept: 'image/*',
    });

    uploader.on('start', (photos) => {
      setIsUploading(true);

      uploader.on('end', (data) => {
        const url = data[0]?.url;
        if (url) {
          onChange(url);
        }
        setIsUploading(false);
      });
    });

    uploader.chooseFile();
  }, [isUploading, onChange]);

  const onPaste = useCallback(
    async (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (!uploadHandlerRef.current) return;
      const clipboardData = e.clipboardData;

      for (let i = 0; i < clipboardData.items.length; i++) {
        const item = clipboardData.items[i];
        if (item.kind == 'file') {
          const blob = item.getAsFile();

          if (!blob || blob.size === 0) {
            return;
          }
          try {
            setIsUploading(true);
            const picture = await uploadHandlerRef.current(blob);
            await previewLoadImage(picture);
            props.onChange(picture);
            setIsUploading(false);
          } catch (error: any) {
            Message.error(error?.message || error || String('Upload failed'));
            setIsUploading(false);
          }
        }
      }
    },
    [props]
  );

  const onRemove = useCallback(() => {
    props.onChange('');
  }, [props]);

  const content = useMemo(() => {
    if (isUploading) {
      return (
        <div className={styles['item']}>
          <div className={classnames(styles['info'])}>
            <Spin />
            <div className={styles['btn-wrap']} />
          </div>
        </div>
      );
    }

    if (!props.value) {
      return (
        <div className={styles['upload']} onClick={onUpload}>
          <IconPlus />
          <div>Upload</div>
        </div>
      );
    }

    return (
      <div className={styles['item']}>
        <div className={classnames(styles['info'])}>
          <img src={props.value} />
          <div className={styles['btn-wrap']}>
            <a title={String('Preview')} onClick={() => setPreview(true)}>
              <IconEye />
            </a>
            <a title={String('Remove')} onClick={() => onRemove()}>
              <IconDelete />
            </a>
          </div>
        </div>
      </div>
    );
  }, [isUploading, onRemove, onUpload, props.value]);

  if (!props.uploadHandler) {
    return <Input value={props.value} onChange={onChange} />;
  }

  useEffect(() => {
    window.addEventListener('message', updateCustomAttributes);
    window.addEventListener('message', updatePredefinedAttributes);

    return () => {
      window.removeEventListener('message', updateCustomAttributes);
      window.removeEventListener('message', updatePredefinedAttributes);
    };
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles['container']}>
        {content}
        <Grid.Row style={{ width: '100%' }}>
          {mergeTags && (
            <Popover
              trigger='click'
              content={<MergeTags value={props.value} onChange={onChange} />}
            >
              <ArcoButton icon={<IconFont iconName='icon-merge-tags' />} />
            </Popover>
          )}
          <Input
            style={{ flex: 1 }}
            onPaste={onPaste}
            value={props.value}
            onChange={onChange}
            disabled={isUploading || !!dataImageName.input.value}
            allowClear
          />
          {props.autoCompleteOptions && (
            <Dropdown
              position="tr"
              droplist={(
                <Menu
                  style={{ width: '300px' }}
                  onClickMenuItem={(indexStr) => {
                    if (!props.autoCompleteOptions) return;
                    onChange(props.autoCompleteOptions[+indexStr]?.value);
                    change(`${focusIdx}.attributes.data-${props.isImage ? '' : 'background-'}image-name`, props.autoCompleteOptions[+indexStr]?.label);
                  }}
                >
                  {
                    props.autoCompleteOptions.map((item, index) => {
                      return (
                        <Menu.Item
                          style={{ display: 'flex', alignItems: 'center', margin: '10px 0px' }}
                          key={index.toString()}
                        >
                          <img src={item.value} style={{ width: 50, height: 50 }} />&emsp;<span>{item.label}</span>
                        </Menu.Item>
                      );
                    })
                  }
                </Menu>
              )}
            >
              {
                !!dataImageName.input.value ? (
                  <ArcoButton
                    onClick={() => {
                      change(`${focusIdx}.attributes.data-${props.isImage ? '' : 'background-'}image-name`, '');
                      change(props.isImage ? `${focusIdx}.attributes.src` : `${focusIdx}.attributes.background-url`, '');
                    }}
                    icon={<IconClose />}
                  />
                ) : (
                  <ArcoButton
                    icon={<IconImage />}
                  />
                )
              }
              {/* <ArcoButton icon={<IconImage />} /> */}
            </Dropdown>
          )}
        </Grid.Row>
      </div>
      <Modal visible={preview} footer={null} onCancel={() => setPreview(false)}>
        <img alt={String('Preview')} style={{ width: '100%' }} src={props.value} />
      </Modal>
    </div>
  );
}
