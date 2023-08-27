export {};

declare global {
  interface Function {
    clone?: Function;
  }
}
