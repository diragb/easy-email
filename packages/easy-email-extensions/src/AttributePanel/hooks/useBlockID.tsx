// Packages:
import { useEffect, useState } from 'react';
import { useField, useForm } from 'react-final-form';
import { deleteIndex, isBlockIDValid, setIDForIndex, validateBlockID } from '@extensions/utils/blockIDManager';
import { ActionOrigin, Condition, setConditionalMappingConditions } from 'conditional-mapping-manager';
import { useFocusIdx } from 'easy-email-editor';

// Functions:
const useBlockID = () => {
  // Constants:
  const { focusIdx: idx } = useFocusIdx();
  const dataIDField = `${idx}.attributes.data-id`;
  const { change } = useForm();
  const dataID = useField(dataIDField);

  // State:
  const [lastValidDataID, setLastValidDataID] = useState(dataID.input.value as string | undefined);

  // Functions:
  const onBlurCapture = () => {
    if (isBlockIDValid(idx, dataID.input.value)) return;
    if (!dataID.input.value || dataID.input.value?.trim().length === 0) {
      // Delete all relevant conditions that were reliant on this data-id.
      setConditionalMappingConditions(
        ActionOrigin.EasyEmail,
        conditions => conditions.filter(condition => condition.id !== lastValidDataID)
      );
      deleteIndex(idx);
    }
    else { change(dataIDField, lastValidDataID); }
  };

  // Effects:
  useEffect(() => {
    if (isBlockIDValid(idx, dataID.input.value)) {
      setLastValidDataID(_lastValidDataID => {
        // Get all conditions that utilize this data-id
        setConditionalMappingConditions(ActionOrigin.EasyEmail, conditions => {
          return conditions.map(condition => {
            if (condition.id === _lastValidDataID) {
              return {
                ...condition,
                id: dataID.input.value,
                focusIdx: idx,
              } as Condition;
            }
            else return condition;
          });
        });

        return dataID.input.value;
      });
      setIDForIndex(dataID.input.value, idx);
    }
  }, [dataID.input.value, idx]);

  // Return:
  return {
    onBlurCapture,
    lastValidDataID,
  };
};

// Exports:
export default useBlockID;