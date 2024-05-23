import React, { useEffect, useMemo, useState } from 'react';
import { ImageUploaderField, SelectField, TextField } from '../../../components/Form';
import { useFocusIdx, useEditorProps } from 'easy-email-editor';
import { BackgroundColor } from './BackgroundColor';
import { Grid, Space } from '@arco-design/web-react';
import { getTemplateTheme } from 'template-theme-manager';

const backgroundRepeatOptions = [
  {
    value: 'no-repeat',
    get label() {
      return String('No repeat');
    },
  },
  {
    value: 'repeat',
    get label() {
      return String('Repeat');
    },
  },
  {
    value: 'repeat-x',
    get label() {
      return String('Repeat X');
    },
  },
  {
    value: 'repeat-y',
    get label() {
      return String('Repeat Y');
    },
  },
];

export function Background() {
  // Constants:
  const { focusIdx } = useFocusIdx();
  const { onUploadImage } = useEditorProps();

  // State:
  const [imagesDropdownOptions, setImagesDropdownOptions] = useState<{ label: string, value: string; }[]>([]);

  // Effects:
  useEffect(() => {
    const _images = getTemplateTheme()?.images ?? [];
    setImagesDropdownOptions(_images.map(image => ({ label: image.name, value: image.url })));
  }, []);

  // Return:
  return useMemo(() => {
    return (
      <Space
        key={focusIdx}
        direction='vertical'
      >
        <ImageUploaderField
          label={String('Background image')}
          name={`${focusIdx}.attributes.background-url`}
          helpText={String(
            'The image suffix should be .jpg, jpeg, png, gif, etc. Otherwise, the picture may not be displayed normally.',
          )}
          uploadHandler={onUploadImage}
          autoCompleteOptions={imagesDropdownOptions}
        />

        <Grid.Row>
          <Grid.Col span={11}>
            <BackgroundColor />
          </Grid.Col>
          <Grid.Col
            offset={1}
            span={11}
          >
            <SelectField
              label={String('Background repeat')}
              name={`${focusIdx}.attributes.background-repeat`}
              options={backgroundRepeatOptions}
            />
          </Grid.Col>
        </Grid.Row>
        <TextField
          label={String('Background size')}
          name={`${focusIdx}.attributes.background-size`}
        />
      </Space>
    );
  }, [focusIdx, onUploadImage, imagesDropdownOptions]);
}
