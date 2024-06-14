// Constants:
export const CSS_ID_REGEX = /^[A-Za-z]+[\w\-\:\.]*$/;

// Functions:
export const isJSONStringValid = (JSONString: string) => {
  try {
    JSON.parse(JSONString);
  } catch (e) {
    return false;
  }
  return true;
};

export const getBlockIDMap = () => {
  const blockIDMap = isJSONStringValid(sessionStorage.getItem('block-ids') ?? '{}') ? (sessionStorage.getItem('block-ids') ?? '{}') : '{}';
  return JSON.parse(blockIDMap === 'undefined' ? '{}' : blockIDMap) as Record<string, string>;
};
export const setBlockIDMap = (newBlockIDMap: Record<string, string>) => sessionStorage.setItem('block-ids', JSON.stringify(newBlockIDMap));

export const removeIDAssociatedWithIndex = (index: string) => {
  let blockIDMap = getBlockIDMap();
  if (typeof blockIDMap[index] === 'undefined') return;
  delete blockIDMap[index];
  setBlockIDMap(blockIDMap);
};

export const setIDForIndex = (ID: string, index: string) => {
  let newBlockIDMap = getBlockIDMap();
  newBlockIDMap[index] = ID;
  setBlockIDMap(newBlockIDMap);
};

export const deleteIndex = (index: string) => {
  let newBlockIDMap = getBlockIDMap();
  delete newBlockIDMap[index];
  setBlockIDMap(newBlockIDMap);
};

export const isIDValid = (index: string, value?: string) => {
  if (value && value?.trim().length > 0) {
    setIDForIndex(value, index);

    // Check for validity:
    if (!CSS_ID_REGEX.test(value)) return 'ID is invalid!';

    // Check for duplicates:
    let blockIDMap = getBlockIDMap();
    if (typeof blockIDMap[index] !== 'undefined') delete blockIDMap[index];

    const IDs = Object.values(blockIDMap);
    if (IDs.includes(value)) return 'ID is already taken!';
  } else deleteIndex(index);
};

export const isBlockIDValid = (idx: string, value?: string) => {
  if (value && value?.trim().length > 0) {
    return !validateBlockID(idx, value);
  } else return false;
};

export const validateBlockID = (idx: string, value?: string) => {
  if (value && value?.trim().length > 0) {
    // Check for validity:
    if (!CSS_ID_REGEX.test(value)) return 'ID is invalid!';

    // Check for duplicates:
    let blockIDMap = getBlockIDMap();
    if (typeof blockIDMap[idx] !== 'undefined') delete blockIDMap[idx];
    const IDs = Object.values(blockIDMap);
    if (IDs.includes(value)) return 'ID is already taken!';
  }
};