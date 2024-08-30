// Packages:
import React, { useEffect, useState } from 'react';
import {
  AttributeModifier,
  generateUpdateCustomAttributeListener,
  generateUpdatePredefinedAttributeListener,
  getCustomAttributes,
  getPredefinedAttributes
} from 'attribute-manager';
import truncate from 'truncate';
import {
  ActionOrigin,
  Condition,
  ConditionField,
  fieldConditions,
  generateUpdateConditionalMappingConditionsListener,
  generateUpdateEnableAddConditionButtonListener,
  generateUpdateFocusBlockListener,
  generateUpdateCurrentFocusIdxListener,
  generateUpdateLastBlockModificationListener,
  getBlockByIdx,
  getConditionalMappingCSS,
  getConditionalMappingConditions,
  getConditionalMappingJavascript,
  getDefaultTemplateContent,
  operators,
  setConditionalMappingCSS,
  setConditionalMappingConditions,
  setConditionalMappingJavascript,
  setCurrentFocusIdx,
  setLastBlockModification,
} from 'conditional-mapping-manager';
import { cloneDeep } from 'lodash';
import useConversationManager from '@demo/hooks/useConversationManager';
import { useToast } from '@demo/shadcn/components/ui/use-toast';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Imports:
import { RiDeleteBin6Fill } from 'react-icons/ri';
import { HiArrowLongLeft } from 'react-icons/hi2';

// Components:
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@demo/shadcn/components/ui/tabs';
import { ScrollArea } from '@demo/shadcn/components/ui/scroll-area';
import { Button } from '@demo/shadcn/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@demo/shadcn/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@demo/shadcn/components/ui/accordion';
import { Input } from '@demo/shadcn/components/ui/input';
import { Textarea } from '@demo/shadcn/components/ui/textarea';

// Functions:
const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const ConditionalMappingSection = () => {
  // Constants:
  const { exitConditionalMapping, enableSave } = useConversationManager();
  const { toast } = useToast();

  // State:
  const [conditions, _setConditions] = useState<Condition[]>([]);
  const [predefinedAttributes, _setPredefinedAttributes] = useState(getPredefinedAttributes());
  const [customAttributes, _setCustomAttributes] = useState(getCustomAttributes());
  const attributes = {
    ...predefinedAttributes,
    ...customAttributes,
  };
  const [focusedConditionIndex, setFocusedConditionIndex] = useState<number>(-1);
  const [focusIdx, _setFocusIdx] = useState('');
  const [focusBlock, _setFocusBlock] = useState<any>();
  const [enableAddConditionButton, _setEnableAddConditionButton] = useState(false);
  const [javascript, setJavascript] = useState(getConditionalMappingJavascript());
  const [CSS, setCSS] = useState(getConditionalMappingCSS());
  const [areConditionsErrorFree, setAreConditionsErrorFree] = useState(false);

  // Functions:
  const updateCustomAttributes = generateUpdateCustomAttributeListener(AttributeModifier.EasyEmail, _setCustomAttributes);
  const updatePredefinedAttributes = generateUpdatePredefinedAttributeListener(AttributeModifier.EasyEmail, _setPredefinedAttributes);
  const updateFocusIdx = generateUpdateCurrentFocusIdxListener(ActionOrigin.EasyEmail, _setFocusIdx);
  const updateFocusBlock = generateUpdateFocusBlockListener(ActionOrigin.EasyEmail, _setFocusBlock);
  const updateConditions = generateUpdateConditionalMappingConditionsListener(ActionOrigin.EasyEmail, _setConditions);
  const updateEnableAddConditionButton = generateUpdateEnableAddConditionButtonListener(ActionOrigin.EasyEmail, _setEnableAddConditionButton);

  const updateConditionAttributes = (idx: string, attributes: Record<string, string>) => {
    if (focusIdx !== idx || focusedConditionIndex === -1) return;
    setConditionalMappingConditions(ActionOrigin.React, conditions => {
      const _conditions = cloneDeep(conditions);
      _conditions[focusedConditionIndex].attributes = {
        ..._conditions[focusedConditionIndex].attributes,
        ...attributes,
      };
      _setConditions(_conditions);
      return _conditions;
    });
  };

  const updateLastBlockModification = generateUpdateLastBlockModificationListener(ActionOrigin.EasyEmail, ({ idx, attributes }) => updateConditionAttributes(idx, attributes));

  const fillBlockAttributes = (focusIdx: string, attributes: Record<string, string>) => {
    setLastBlockModification(ActionOrigin.React, {
      idx: focusIdx,
      attributes: attributes ?? {},
    });
  };

  const resetBlockAttributes = (focusIdx: string) => {
    const defaultBlock = getBlockByIdx({ content: getDefaultTemplateContent() }, focusIdx);
    const defaultBlockAttributes = defaultBlock?.attributes;
    setLastBlockModification(ActionOrigin.React, {
      idx: focusIdx,
      attributes: defaultBlockAttributes ?? {},
      isReset: true,
    });
  };

  const onConditionsTouched = (conditionIndex?: string) => {
    const _conditionIndex = parseInt(conditionIndex ?? '');
    if (!isNaN(_conditionIndex)) {
      if (focusedConditionIndex !== -1) resetBlockAttributes(conditions[_conditionIndex].focusIdx);
      fillBlockAttributes(conditions[_conditionIndex].focusIdx, conditions[_conditionIndex].attributes);
      setCurrentFocusIdx(ActionOrigin.React, conditions[_conditionIndex].focusIdx);
      _setFocusIdx(conditions[_conditionIndex].focusIdx);
      setFocusedConditionIndex(_conditionIndex);
    } else {
      resetBlockAttributes(conditions[focusedConditionIndex].focusIdx);
      setCurrentFocusIdx(ActionOrigin.React, 'content');
      _setFocusIdx('content');
      setFocusedConditionIndex(-1);
    }
  };

  const addConditionField = (conditionIndex: number) => {
    setConditionalMappingConditions(ActionOrigin.React, conditions => {
      const _conditions = cloneDeep(conditions);
      _conditions[conditionIndex].fields = [
        ..._conditions[conditionIndex].fields,
        {
          attribute: '',
          operator: '',
          value: '',
          condition: 'and' as typeof fieldConditions[number],
          isValueAnAttribute: false,
        }
      ];
      _setConditions(_conditions);
      return _conditions;
    });
  };

  const updateConditionField = (
    conditionIndex: number,
    fieldIndex: number,
    delta: Partial<ConditionField>
  ) =>
    setConditionalMappingConditions(ActionOrigin.React, conditions => {
      const _conditions = cloneDeep(conditions);
      _conditions[conditionIndex].fields[fieldIndex] = {
        ..._conditions[conditionIndex].fields[fieldIndex],
        ...delta,
      };
      _setConditions(_conditions);
      return _conditions;
    });
  ;

  const deleteConditionField = (conditionIndex: number, fieldIndex: number) => {
    setConditionalMappingConditions(ActionOrigin.React, conditions => {
      const _conditions = cloneDeep(conditions);
      _conditions[conditionIndex].fields.splice(fieldIndex, 1);
      _setConditions(_conditions);
      return _conditions;
    });
  };

  const addCondition = () => {
    if (!focusBlock || !focusIdx) return;
    setConditionalMappingConditions(ActionOrigin.React, conditions => {
      const id = focusBlock.attributes?.['data-id'] ?? undefined;
      const _conditions = cloneDeep(conditions);
      _conditions.push({
        id,
        focusIdx,
        attributes: {},
        fields: []
      });
      _setConditions(_conditions);
      return _conditions;
    });
  };

  const deleteCondition = (conditionIndex: number) => {
    resetBlockAttributes(conditions[focusedConditionIndex].focusIdx);
    setConditionalMappingConditions(ActionOrigin.React, conditions => {
      const _conditions = cloneDeep(conditions);
      _conditions.splice(conditionIndex, 1);
      _setConditions(_conditions);
      return _conditions;
    });
  };

  // Effects:
  useEffect(() => {
    _setConditions(getConditionalMappingConditions());
    window.addEventListener('message', updateCustomAttributes);
    window.addEventListener('message', updatePredefinedAttributes);
    window.addEventListener('message', updateFocusIdx);
    window.addEventListener('message', updateFocusBlock);
    window.addEventListener('message', updateConditions);
    window.addEventListener('message', updateEnableAddConditionButton);

    return () => {
      window.removeEventListener('message', updateCustomAttributes);
      window.removeEventListener('message', updatePredefinedAttributes);
      window.removeEventListener('message', updateFocusIdx);
      window.removeEventListener('message', updateFocusBlock);
      window.removeEventListener('message', updateConditions);
      window.removeEventListener('message', updateEnableAddConditionButton);
    };
  }, []);

  useEffect(() => {
    window.addEventListener('message', updateLastBlockModification);

    return () => {
      window.removeEventListener('message', updateLastBlockModification);
    };
  }, [focusIdx, focusBlock]);

  // NOTE: Conditional Mapping focuser, archaic and had issues with multi-condition focus for same block.
  // useEffect(() => {
  //   const highlightedConditionIndex = conditions.findIndex(condition => condition.focusIdx === focusIdx);
  //   console.log(highlightedConditionIndex, focusedConditionIndex);
  //   if (highlightedConditionIndex !== -1 && highlightedConditionIndex !== focusedConditionIndex) setFocusedConditionIndex(highlightedConditionIndex);
  //   else if (highlightedConditionIndex === -1 && highlightedConditionIndex !== focusedConditionIndex) setFocusedConditionIndex(-1);
  // }, [focusIdx, focusedConditionIndex]);

  useEffect(() => {
    let containsErrors = false;
    for (const condition of conditions) {
      for (const [fieldIndex, field] of condition.fields.entries()) {
        if (
          (field.attribute.length === 0) ||
          (!field.operator || field.operator.length === 0) ||
          (!['is not null', 'is null'].includes(field.operator) && (!field.value || field.value.length === 0)) ||
          (fieldIndex > 0 && (!field.condition || field.condition.length === 0))
        ) {
          containsErrors = true;
          break;
        }
      }

      if (containsErrors) break;
    }

    if (containsErrors && areConditionsErrorFree) setAreConditionsErrorFree(false);
    else if (!containsErrors && !areConditionsErrorFree) setAreConditionsErrorFree(true);
  }, [conditions]);

  useEffect(() => {
    enableSave(areConditionsErrorFree);
  }, [areConditionsErrorFree]);

  // Return:
  return (
    <div className='flex flex-col w-[30vw] h-full px-3 py-4 bg-[#F8FAFC]'>
      <div
        className='flex justify-start items-center gap-2 w-full h-[2.5%] pb-[1rem] cursor-pointer hover:underline'
        onClick={areConditionsErrorFree ? exitConditionalMapping : () => toast({ title: 'Uh oh! Cannot exit Conditional Mapping.', description: 'Please fix the errors on this page to go back.', variant: 'destructive', className: cn('top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4') })}
      >
        <HiArrowLongLeft />
        <div className='text-sm font-bold'>Exit Conditional Mapping</div>
      </div>
      <Tabs defaultValue='conditions' className='w-full h-[95%]'>
        <div className='h-[2.5%]'>
          <TabsList className='w-full' style={{ boxShadow: '0px 2px 6px 0px #0F172A0F' }}>
            <TabsTrigger className='w-[33%] rounded-l-sm mr-[1px]' value='conditions'>Conditions</TabsTrigger>
            <TabsTrigger className='w-[33%] rounded-r-sm' value='javascript'>Javascript</TabsTrigger>
            <TabsTrigger className='w-[33%] rounded-r-sm' value='css'>CSS</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value='conditions' className='h-[89%]'>
          <ScrollArea className='h-full w-full mt-[5%] p-6 rounded-md bg-white'>
            <Accordion
              type='single'
              collapsible
              className='w-full'
              value={`${focusedConditionIndex ?? ''}`}
              onValueChange={onConditionsTouched}
            >
              {
                conditions.map((condition, conditionIndex) => (
                  <AccordionItem
                    value={`${conditionIndex}`}
                    key={`condition-${conditionIndex}`}
                    className='flex flex-col gap-6'
                  >
                    <AccordionTrigger>
                      <div className='flex justify-start items-start flex-col gap-0'>
                        <div className='text-base'>Condition {conditionIndex + 1}</div>
                        <div className='text-sm text-gray-500'>For {condition.id ? truncate(condition.id, 20) : truncate(condition.focusIdx, 20)}</div>
                      </div>
                    </AccordionTrigger>
                    {/* <div className='text-2xl text-[#0F172A] font-medium'>Condition {index + 1}</div> */}
                    <AccordionContent className='flex flex-col gap-6 w-full'>
                      {
                        condition.fields.map((field, fieldIndex) => (
                          <div
                            key={`condition-${conditionIndex}-field-${fieldIndex}`}
                            className='flex justify-between items-stretch flex-row w-full h-fit'
                          >
                            <div className='flex items-center w-[20%] text-base text-[#0F172A] font-medium'>
                              {
                                fieldIndex === 0 ? (
                                  'When'
                                ) : (
                                  <Select
                                    value={field.condition ?? 'and'}
                                    onValueChange={value => updateConditionField(
                                      conditionIndex,
                                      fieldIndex,
                                      {
                                        condition: value as typeof fieldConditions[number]
                                      },
                                    )}
                                  >
                                    <SelectTrigger className='w-full'>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {
                                        fieldConditions.map((fieldCondition, fieldConditionIndex) => (
                                          <SelectItem key={`condition-${conditionIndex}-field-${fieldIndex}-condition-${fieldConditionIndex}`} value={fieldCondition}>{fieldCondition}</SelectItem>
                                        ))
                                      }
                                    </SelectContent>
                                  </Select>
                                )
                              }
                            </div>
                            <div className='flex flex-col gap-3 w-[55%]'>
                              <Select
                                value={field.attribute}
                                onValueChange={value => updateConditionField(conditionIndex, fieldIndex, { attribute: value })}
                              >
                                <SelectTrigger className='w-full'>
                                  <SelectValue placeholder='Select an attribute' />
                                </SelectTrigger>
                                <SelectContent>
                                  {
                                    Object.keys(attributes).map((attribute, attributeIndex) => (
                                      <SelectItem key={`condition-${conditionIndex}-field-${fieldIndex}-attribute-${attributeIndex}-primary-operand`} value={attribute}>{attribute}</SelectItem>
                                    ))
                                  }
                                </SelectContent>
                              </Select>
                              <Select
                                value={field.operator}
                                onValueChange={value => {
                                  const shouldSetValueToUndefined = (['is null', 'is not null']).includes(value);
                                  updateConditionField(
                                    conditionIndex,
                                    fieldIndex,
                                    shouldSetValueToUndefined ? {
                                      operator: value as typeof operators[number],
                                      value: undefined,
                                      isValueAnAttribute: false,
                                    } : {
                                      operator: value as typeof operators[number]
                                    }
                                  );
                                }}
                              >
                                <SelectTrigger className='w-full'>
                                  <SelectValue placeholder='Select an operator' />
                                </SelectTrigger>
                                <SelectContent>
                                  {
                                    operators.map((operator, operatorIndex) => (
                                      <SelectItem key={`condition-${conditionIndex}-field-${fieldIndex}-attribute-${operatorIndex}`} value={operator}>{operator}</SelectItem>
                                    ))
                                  }
                                </SelectContent>
                              </Select>
                              {
                                (!(['is null', 'is not null']).includes(field.operator)) && (
                                  <div className='relative'>
                                    <Select
                                      value={field.isValueAnAttribute ? field.value : ''}
                                      onValueChange={value => {
                                        updateConditionField(
                                          conditionIndex,
                                          fieldIndex,
                                          {
                                            value,
                                            isValueAnAttribute: true,
                                          }
                                        );
                                      }}
                                    >
                                      <Input
                                        className='w-full'
                                        placeholder='Enter a value'
                                        value={field.value}
                                        onInput={event => {
                                          updateConditionField(conditionIndex, fieldIndex, {
                                            value: event.currentTarget.value,
                                            isValueAnAttribute: false,
                                          });
                                        }}
                                        endAdornment={<SelectTrigger className='w-10 mr-2 border-none'></SelectTrigger>}
                                      />
                                      <SelectContent>
                                        {
                                          Object.keys(attributes).map((attribute, attributeIndex) => (
                                            <SelectItem key={`condition-${conditionIndex}-field-${fieldIndex}-attribute-${attributeIndex}-secondary-operand`} value={attribute}>{attribute}</SelectItem>
                                          ))
                                        }
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )
                              }
                            </div>
                            <div className='w-[1px] mx-[2.5%] h-auto bg-[#94A3B8]' />
                            <div className='flex justify-center items-center gap-2 w-[8%] pl-1'>
                              <div
                                className='flex justify-center items-center p-[6px] rounded-sm bg-[#FEF2F3] cursor-pointer'
                                onClick={() => deleteConditionField(conditionIndex, fieldIndex)}
                              >
                                <RiDeleteBin6Fill size='1rem' color='#DA1E28' />
                              </div>
                            </div>
                          </div>
                        ))
                      }
                      {
                        condition.fields.length === 0 && (
                          <div className='flex justify-center items-center w-full text-sm text-gray-500'>No filters present.</div>
                        )
                      }
                      <div className='flex flex-row gap-2 mt-4'>
                        <Button
                          className='w-fit h-8 px-6 py-0 text-sm text-[#2B24DE] rounded-lg'
                          style={{ borderColor: '#2B24DE' }}
                          variant='outline'
                          size='sm'
                          onClick={() => addConditionField(conditionIndex)}
                        >
                          Add Filter
                        </Button>
                        <Button
                          className='w-fit h-8 px-6 py-0 text-sm text-[#DA1E28] rounded-lg'
                          style={{ borderColor: '#DA1E28' }}
                          variant='outline'
                          size='sm'
                          onClick={() => deleteCondition(conditionIndex)}
                        >
                          Delete Condition
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))
              }
              {
                conditions.length === 0 && (
                  <div className='flex justify-center items-center w-full text-sm text-gray-500'>No conditions present.</div>
                )
              }
            </Accordion>
          </ScrollArea>
          <div className='h-[3.5%] mt-[5%]'>
            <Button
              className='h-10 px-12 py-0 text-white transition-all'
              onClick={addCondition}
              disabled={!enableAddConditionButton}
            >
              Add Condition
            </Button>
            <div
              className='mt-2 text-xs font-bold text-gray-500 transition-colors'
              style={{ filter: `opacity(${enableAddConditionButton ? 0 : 1})` }}
            >
              Cannot add condition since block does not contain an ID.
            </div>
          </div>
        </TabsContent>
        <TabsContent value='javascript' className='h-[95%]'>
          <Textarea
            value={javascript}
            onChange={event => {
              const value = event.currentTarget.value;
              setConditionalMappingJavascript(ActionOrigin.React, () => value);
              setJavascript(value);
            }}
            className='h-full mt-4 resize-none'
            placeholder='Enter JavaScript code..'
          />
        </TabsContent>
        <TabsContent value='css' className='h-[95%]'>
          <Textarea
            value={CSS}
            onChange={event => {
              const value = event.currentTarget.value;
              setConditionalMappingCSS(ActionOrigin.React, () => value);
              setCSS(value);
            }}
            className='h-full mt-4 resize-none'
            placeholder='Enter CSS'
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Exports:
export default ConditionalMappingSection;