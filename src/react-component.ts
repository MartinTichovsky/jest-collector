import { PrivateCollector } from "./private-collector";

export const mockReactComponent = ({
  component,
  dataTestId,
  componentName,
  privateCollector,
  relativePath
}: {
  component: any;
  dataTestId?: string;
  componentName: string;
  privateCollector: PrivateCollector;
  relativePath: string;
}) => {
  const componentPrototype = component.prototype;
  const reactPrototype = Object.getPrototypeOf(component).prototype;

  const registered = privateCollector.registerClassComponent({
    componentName,
    dataTestId,
    implementation: {
      render: componentPrototype.render,
      setState: reactPrototype.setState
    },
    relativePath
  });

  /* istanbul ignore next line */
  if (registered) {
    componentPrototype.render = registered.render;
    componentPrototype.render.bind(componentPrototype);
    reactPrototype.setState = registered.setState;
    reactPrototype.setState.bind(reactPrototype);
  }
};
