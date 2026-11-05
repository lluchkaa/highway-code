const isComponentName = (name) => /^[A-Z]/.test(name)

const componentStyle = {
  meta: {
    type: 'suggestion',
    schema: [],
    messages: {
      declaration:
        'Declare UI as const Name: React.FC<Props> = (...) => {...}. Use React.FC when there are no props.',
      props:
        'Declare a local type Props immediately above the UI declaration; reference it as React.FC<Props> without inline parameter types.',
      single:
        'Keep one UI declaration per file; group related files in a folder with index.ts exports.',
    },
  },
  create(context) {
    const components = []
    return {
      FunctionDeclaration(node) {
        if (node.id && isComponentName(node.id.name)) {
          components.push(node)
          context.report({ node, messageId: 'declaration' })
        }
      },
      VariableDeclarator(node) {
        if (
          node.id.type !== 'Identifier' ||
          !isComponentName(node.id.name) ||
          !['ArrowFunctionExpression', 'FunctionExpression'].includes(
            node.init?.type,
          )
        ) {
          return
        }
        const type = node.id.typeAnnotation?.typeAnnotation
        const isFC =
          type?.type === 'TSTypeReference' &&
          type.typeName.type === 'TSQualifiedName' &&
          type.typeName.left.type === 'Identifier' &&
          type.typeName.left.name === 'React' &&
          type.typeName.right.name === 'FC'
        components.push(node)
        if (
          !isFC ||
          node.parent.kind !== 'const' ||
          node.init.type !== 'ArrowFunctionExpression'
        ) {
          context.report({ node, messageId: 'declaration' })
          return
        }
        const args = type.typeArguments?.params ?? []
        if (node.init.params.length === 0 && args.length === 0) {
          return
        }
        const declaration =
          node.parent.parent.type === 'ExportNamedDeclaration'
            ? node.parent.parent
            : node.parent
        const siblings = declaration.parent.body
        const previous = Array.isArray(siblings)
          ? siblings[siblings.indexOf(declaration) - 1]
          : null
        if (
          args.length !== 1 ||
          args[0].type !== 'TSTypeReference' ||
          args[0].typeName.type !== 'Identifier' ||
          args[0].typeName.name !== 'Props' ||
          previous?.type !== 'TSTypeAliasDeclaration' ||
          previous.id.name !== 'Props' ||
          node.init.params.length > 1 ||
          node.init.params.some((param) => param.typeAnnotation)
        ) {
          context.report({ node, messageId: 'props' })
        }
      },
      'Program:exit'() {
        for (const node of components.slice(1)) {
          context.report({ node, messageId: 'single' })
        }
      },
    }
  },
}

export default { rules: { 'component-style': componentStyle } }
