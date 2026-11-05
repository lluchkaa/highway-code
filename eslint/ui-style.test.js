import { RuleTester } from 'eslint'
import tseslint from 'typescript-eslint'

import uiStyle from './ui-style.js'

const tester = new RuleTester({
  languageOptions: { parser: tseslint.parser },
})

tester.run('component-style', uiStyle.rules['component-style'], {
  valid: [
    'type Props = { title: string }; export const Heading: React.FC<Props> = ({ title }) => <h1>{title}</h1>',
    'export const Page: React.FC = () => <main />',
    'const Select = SelectPrimitive.Root',
    'const helper = () => 1',
    'type Props = React.ComponentProps<"div">; export const Panel: React.FC<Props> = props => <div {...props} />',
    'type Props = { hidden: boolean }; export const Panel: React.FC<Props> = ({ hidden }) => hidden ? null : <div />',
  ].map((code) => ({ code, filename: 'view.tsx' })),
  invalid: [
    {
      code: 'export const Empty = () => null',
      errors: [{ messageId: 'declaration' }],
    },
    {
      code: 'export function Heading() { return <h1 /> }',
      errors: [{ messageId: 'declaration' }],
    },
    {
      code: 'export const Heading = () => <h1 />',
      errors: [{ messageId: 'declaration' }],
    },
    {
      code: 'type HeadingProps = {}; export const Heading: React.FC<HeadingProps> = props => <h1 {...props} />',
      errors: [{ messageId: 'props' }],
    },
    {
      code: 'type Props = {}; const other = 1; export const Heading: React.FC<Props> = props => <h1 {...props} />',
      errors: [{ messageId: 'props' }],
    },
    {
      code: 'export const Heading: React.FC<{ title: string }> = ({ title }) => <h1>{title}</h1>',
      errors: [{ messageId: 'props' }],
    },
    {
      code: 'type Props = {}; export const Heading: React.FC<Props> = (props: Props) => <h1 {...props} />',
      errors: [{ messageId: 'props' }],
    },
    {
      code: 'export const Heading: React.FC = () => <h1 />; export const Page: React.FC = () => <main />',
      errors: [{ messageId: 'single' }],
    },
  ].map((test) => ({ ...test, filename: 'view.tsx' })),
})
