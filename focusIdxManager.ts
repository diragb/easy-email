// Imports:
import { ActionOrigin } from './conditionalMappingManager';

// Exports:
export const getFocusIdx = () => sessionStorage.getItem('focus-idx') ?? '';

export const setFocusIdx = (origin: ActionOrigin, newFocusIdx: string, isExporting = false) => {
  sessionStorage.setItem('focus-idx', newFocusIdx);
  window.postMessage(JSON.stringify({ origin, type: 'focus-idx', isExporting, focusIdx: newFocusIdx }), '*');
};

export const generateUpdateFocusIdxListener = (listenFor: ActionOrigin, callback: (newFocusIdx: string, isExporting: boolean) => void) => (event: MessageEvent<any>) => {
  try {
    if (typeof event.data !== 'string') return;
    if (event.data.trim().length === 0) return;
    const message = JSON.parse(event.data) as any;
    if (
      message.origin === listenFor &&
      message.type === 'focus-idx'
    ) callback(message.focusIdx, message.isExporting);
  } catch (error) {
  }
};
