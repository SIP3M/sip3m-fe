declare module 'stylis' {
  export interface Middleware {
    (selector: string, block: string, callback: (input: string) => void, isScoped: boolean): string | void;
  }
}
