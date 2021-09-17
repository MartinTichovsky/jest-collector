import { PrivateCollector } from "./private-collector";

export const mockReactClass = ({
  component,
  privateCollector
}: {
  component: any;
  privateCollector: PrivateCollector;
}) => {
  const componentPrototype = component.prototype;
  const reactPrototype = Object.getPrototypeOf(component).prototype;

  const registered = privateCollector.registerReactClass({
    implementation: {
      render: componentPrototype.render,
      setState: reactPrototype.setState
    }
  });

  /* istanbul ignore next line */
  if (registered) {
    componentPrototype.render = registered.render;
    componentPrototype.render.bind(componentPrototype);
    reactPrototype.setState = registered.setState;
    reactPrototype.setState.bind(reactPrototype);
  }
};
