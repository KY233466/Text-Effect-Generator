const EDITABLE_SELECTOR = [
  "textarea",
  "input:not([type])",
  'input[type="text"]',
  'input[type="search"]',
  'input[type="email"]',
  'input[type="url"]',
  'input[type="tel"]',
  'input[type="password"]',
  '[contenteditable="true"]',
].join(",");

const isEditableTarget = (target) => {
  const element = target instanceof Element ? target : target?.parentElement;
  return Boolean(element?.closest(EDITABLE_SELECTOR));
};

/**
 * Prevents UI chrome from participating in clipboard and drag/drop flows while
 * preserving normal interaction inside intentional text-entry controls.
 */
export const installUIInteractionGuards = () => {
  const preventOutsideEditable = (event) => {
    if (!isEditableTarget(event.target)) event.preventDefault();
  };

  const eventTypes = ["selectstart", "copy", "cut", "paste", "dragstart", "drop"];
  eventTypes.forEach((type) => {
    document.addEventListener(type, preventOutsideEditable, true);
  });

  return () => {
    eventTypes.forEach((type) => {
      document.removeEventListener(type, preventOutsideEditable, true);
    });
  };
};
