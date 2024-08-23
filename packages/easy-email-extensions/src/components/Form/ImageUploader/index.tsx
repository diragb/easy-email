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
  Button,
} from '@arco-design/web-react';
import { IconPlus, IconEye, IconDelete, IconImage, IconClose } from '@arco-design/web-react/icon';
import styles from './index.module.scss';
import { Uploader, UploaderServer } from '@extensions/AttributePanel/utils/Uploader';
import { classnames } from '@extensions/AttributePanel/utils/classnames';
import { previewLoadImage } from '@extensions/AttributePanel/utils/previewLoadImage';
import { MergeTags } from '@extensions';
import { IconFont, useFocusIdx } from 'easy-email-editor';
import {
  AttributeModifier,
  generateUpdateCustomAttributeListener,
  generateUpdatePredefinedAttributeListener,
  getCustomAttributes,
  getPredefinedAttributes,
} from 'attribute-manager';
import { useField, useForm } from 'react-final-form';
import {
  setImageUpload,
  generateUpdateImageUploadListener,
} from 'image-upload-manager';
import { getTemplateTheme, getUsedTemplateTheme, LibraryImage, setUsedTemplateTheme } from 'template-theme-manager';

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
  const themeSettingImage = useRef<LibraryImage | null>(null);
  const { change } = useForm();
  const { focusIdx } = useFocusIdx();
  const dataImageName = useField(`${focusIdx}.attributes.data-${props.isImage ? '' : 'background-'}image-name`);
  const dataIsUploadedImage = useField(`${focusIdx}.attributes.data-is-uploaded-image`);

  const updateCustomAttributes = generateUpdateCustomAttributeListener(AttributeModifier.EasyEmail, _setCustomAttributes);
  const updatePredefinedAttributes = generateUpdatePredefinedAttributeListener(AttributeModifier.EasyEmail, _setPredefinedAttributes);

  const mergeTags = {
    ...predefinedAttributes,
    ...customAttributes,
  };
  const onChange = props.onChange;

  const onUpload = useCallback(() => setImageUpload(() => ({ idx: focusIdx, status: 'NEED_TO_UPLOAD' })), [focusIdx]);

  const updateImageUpload = generateUpdateImageUploadListener(imageUpload => {
    if (
      imageUpload.status === 'UPLOADED' &&
      imageUpload.url
    ) {
      change(`${focusIdx}.attributes.data-${props.isImage ? '' : 'background-'}image-name`, '');
      change(props.isImage ? `${focusIdx}.attributes.src` : `${focusIdx}.attributes.background-url`, imageUpload.url);
      change(`${focusIdx}.attributes.data-is-uploaded-image`, true);
    }
  });

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
            <a
              title={String('Remove')}
              onClick={() => {
                onRemove();
                change(`${focusIdx}.attributes.data-${props.isImage ? '' : 'background-'}image-name`, '');
              }}
            >
              <IconDelete />
            </a>
          </div>
        </div>
      </div>
    );
  }, [isUploading, onRemove, onUpload, props.value]);

  useEffect(() => {
    window.addEventListener('message', updateCustomAttributes);
    window.addEventListener('message', updatePredefinedAttributes);
    window.addEventListener('message', updateImageUpload);

    return () => {
      window.removeEventListener('message', updateCustomAttributes);
      window.removeEventListener('message', updatePredefinedAttributes);
      window.removeEventListener('message', updateImageUpload);
    };
  }, []);

  useEffect(() => {
    if (dataImageName.input.value === '') {
      const _previousThemeSettingImage = themeSettingImage.current;
      if (_previousThemeSettingImage === null) {
        // Since nothing was set before, nothing needs to be changed for usedTemplate.
        themeSettingImage.current = null;
      } else {
        // An image was indeed set before, so we remove the focusIdx from usedIn, and remove if usedIn.length === 0
        setUsedTemplateTheme(_usedTemplateTheme => {
          const _images = _usedTemplateTheme.images;
          const image = _images.find(_image => _image.name === _previousThemeSettingImage.name);

          if (image) {
            // Image has already been used somewhere in the template.
            const usedIn = image.usedIn;

            if (usedIn.length === 1) {
              // Implying image is only being used once across the template, so we can delete this entry.
              return {
                ..._usedTemplateTheme,
                images: _images.filter(_image => _image.name !== image.name)
              };
            } else if (usedIn.length > 1) {
              // Impling image is being used elsewhere, so we just remove the focusIdx from usedIn.
              return {
                ..._usedTemplateTheme,
                images: _images.map(_image => {
                  if (_image.name !== image.name) return _image;
                  else return {
                    ..._image,
                    usedIn: _image.usedIn.filter(_usedInIdx => _usedInIdx !== focusIdx),
                  };
                })
              };
            } else return _usedTemplateTheme;
          } else return _usedTemplateTheme;
        });

        themeSettingImage.current = null;
      }
    } else {
      const _previousThemeSettingImage = themeSettingImage.current;
      const imageBeingUsed = getUsedTemplateTheme().images.find(_image => _image.name === dataImageName.input.value) ?? null;

      if (_previousThemeSettingImage === null) {
        // No image was set before, so no other image where we need to remove the focusIdx from usedIn.
        setUsedTemplateTheme(_usedTemplateTheme => {
          const _images = _usedTemplateTheme.images;
          const image = _images.find(_image => _image.name === dataImageName.input.value);

          if (image) {
            // The image exists before in usedTemplateTheme, so add focusIdx to usedIn.
            const usedIn = image.usedIn;

            return {
              ..._usedTemplateTheme,
              images: _images.map(_image => {
                if (_image.name !== image.name) return _image;
                else return {
                  ..._image,
                  usedIn: [...new Set([...usedIn, focusIdx])],
                };
              })
            };
          } else {
            // The image does not exist, create it.
            const imageToAdd = getTemplateTheme().images.find(_image => _image.name === dataImageName.input.value);

            if (!imageToAdd) return _usedTemplateTheme;
            else return {
              ..._usedTemplateTheme,
              images: [
                ..._usedTemplateTheme.images,
                {
                  ...imageToAdd,
                  usedIn: [focusIdx],
                }
              ]
            };
          }
        });

        themeSettingImage.current = imageBeingUsed;
      } else {
        // An image was set indeed set before, so we remove the focusIdx from its usedIn as well as adding focusIdx to the usedIn of the image selected.
        setUsedTemplateTheme(_usedTemplateTheme => {
          const _images = _usedTemplateTheme.images;
          const image = _images.find(_image => _image.name === dataImageName.input.value);
          const previousImage = _images.find(_image => _image.name === _previousThemeSettingImage.name);

          if (image) {
            // The image exists before in usedTemplateTheme, so bump it up.
            const usedIn = image.usedIn;

            return {
              ..._usedTemplateTheme,
              images: _images
                .map(_image => {
                  if (_image.name === image.name) {
                    return {
                      ..._image,
                      usedIn: [...new Set([...usedIn, focusIdx])],
                    };
                  } else if (_image.name === previousImage?.name) {
                    return {
                      ..._image,
                      usedIn: _image.usedIn.filter(_usedInIdx => _usedInIdx !== focusIdx),
                    };
                  } else return _image;
                })
                .filter(_image => (_image.usedIn.length ?? 0) > 0)
            };
          } else {
            // The image does not exist, create it.
            const imageToAdd = getTemplateTheme().images.find(_image => _image.name === dataImageName.input.value);

            if (!imageToAdd) return _usedTemplateTheme;
            else return {
              ..._usedTemplateTheme,
              images: [
                ..._usedTemplateTheme.images,
                {
                  ...imageToAdd,
                  usedIn: [focusIdx],
                }
              ].map(_image => {
                if (_image.name === previousImage?.name) {
                  return {
                    ..._image,
                    usedIn: _image.usedIn.filter(_usedInIdx => _usedInIdx !== focusIdx),
                  };
                } else return _image;
              })
                .filter(_image => (_image.usedIn.length ?? 0) > 0)
            };
          }
        });

        themeSettingImage.current = imageBeingUsed;
      }
    }
  }, [themeSettingImage.current, dataImageName, focusIdx]);

  return (
    <div className={styles.wrap}>
      <div className={styles['container']}>
        {content}
        <Grid.Row style={{ width: '100%' }}>
          {mergeTags && (
            <Popover
              trigger='click'
              content={<MergeTags value={props.value} onChange={onChange} />}
              disabled={
                isUploading ||
                !!dataImageName.input.value ||
                !!dataIsUploadedImage.input.value
              }
            >
              <ArcoButton icon={<IconFont iconName='icon-merge-tags' />} />
            </Popover>
          )}
          <Input
            style={{ flex: 1 }}
            onPaste={onPaste}
            value={props.value}
            onChange={onChange}
            disabled={
              isUploading ||
              !!dataImageName.input.value ||
              !!dataIsUploadedImage.input.value
            }
          />
          {props.autoCompleteOptions && (
            <Dropdown
              position="tr"
              disabled={!!dataIsUploadedImage.input.value}
              droplist={(
                <Menu
                  style={{ width: '300px' }}
                  onClickMenuItem={(indexStr) => {
                    if (!props.autoCompleteOptions) return;
                    onChange(props.autoCompleteOptions[+indexStr]?.value);
                    change(`${focusIdx}.attributes.data-${props.isImage ? '' : 'background-'}image-name`, props.autoCompleteOptions[+indexStr]?.label);
                    change(`${focusIdx}.attributes.data-is-uploaded-image`, false);
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
              <ArcoButton icon={<IconImage />} />
            </Dropdown>
          )}
          <Button
            onClick={() => {
              change(`${focusIdx}.attributes.data-${props.isImage ? '' : 'background-'}image-name`, '');
              change(`${focusIdx}.attributes.data-is-uploaded-image`, false);
              change(props.isImage ? `${focusIdx}.attributes.src` : `${focusIdx}.attributes.background-url`, '');
            }}
            disabled={!props.value || isUploading}
            status='danger'
            style={{
              marginLeft: '0.5rem'
            }}
          >
            Reset
          </Button>
        </Grid.Row>
      </div>
      <Modal visible={preview} footer={null} onCancel={() => setPreview(false)}>
        <img alt={String('Preview')} style={{ width: '100%' }} src={props.value} />
      </Modal>
    </div>
  );
}
