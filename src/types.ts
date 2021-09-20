export interface TestItemProps {
  exclude: string[];
  include: string[];
  relativePath: string;
  root: string;
}

export interface GetFilesProps {
  exclude: string[];
  extensions: string[];
  folder: string;
  include: string[];
  root: string;
}

export interface Options {
  exclude?: string[];
  excludeImports?: string[];
  extensions?: string[];
  include?: string[];
  includeImports?: string[];
  roots: string[];
}
