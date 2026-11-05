export const uikitRules = {
  'no-restricted-syntax': [
    'error',
    {
      selector:
        'JSXOpeningElement[name.type="JSXIdentifier"][name.name=/^(button|input|select|textarea|progress|dialog)$/]',
      message:
        'Use the generated UIKit control instead of implementing a native control here.',
    },
  ],
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        {
          group: ['@/components/uikit/*', '**/uikit/*'],
          message:
            'Import UIKit primitives from @/components/uikit. Generated files keep their internal imports.',
        },
        {
          group: ['@base-ui/react', '@base-ui/react/**'],
          message:
            'Use generated UIKit primitives rather than importing Base UI into application code.',
        },
      ],
    },
  ],
}

export const persistenceRules = {
  'no-restricted-globals': [
    'error',
    {
      name: 'localStorage',
      message: 'Use the shared persistence module for browser storage.',
    },
    {
      name: 'sessionStorage',
      message: 'Use the shared persistence module for browser storage.',
    },
  ],
  'no-restricted-properties': [
    'error',
    ...['window', 'globalThis'].flatMap((object) =>
      ['localStorage', 'sessionStorage'].map((property) => ({
        object,
        property,
        message: 'Use the shared persistence module for browser storage.',
      })),
    ),
  ],
}
