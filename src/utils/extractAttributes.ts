
// Functions:
const extractAttributes = (content: string) => {
  let match: RegExpExecArray | null = null;
  const HTMLCaptureRegex = /<input\s+(?:(?:\w+\s*=\s*(?:\\"[^\\"]*\\"|'[^']*'))\s*)*>/gi;
  const attributes: string[] = [];
  while ((match = HTMLCaptureRegex.exec(content)) !== null) {
    const valueCaptureRegex = /value=\\"([^\\"]*)\\"/;
    const HTMLInputElement = match[0];
    const matchForValue = HTMLInputElement.match(valueCaptureRegex);
    if (matchForValue?.[1]) attributes.push(matchForValue[1]);
  }

  return [...new Set(attributes)];
};

// Exports:
export default extractAttributes;
