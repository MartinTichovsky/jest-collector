export interface TestItemProps {
  excludeItems: string[];
  relativePath: string;
}

export interface GetFilesProps {
  excludeItems: string[];
  extensions: string[];
  folder: string;
}

export interface Options {
  exclude?: string[];
  extensions?: string[];
  include: string[];
}
