import fs from "fs";
import path from "path";
import { GetFilesProps, TestItemProps } from "./types";

const fileNameRegexp = "[a-zA-Z0-9\\-._\\$\\@\\[\\]\\+&!]+";

export const convertFileSystem = (item: string) => item.replace(/\\/g, "/");
export const convertFileSystemArray = (result: string[]) =>
  result.map((item) => convertFileSystem(item));

export const createRegexp = (value: string) => {
  let result = value;

  if (result.startsWith("^")) {
    result = result.slice(1);
  }

  if (result.startsWith("./")) {
    result = result.slice(1);
  } else if (!result.startsWith("/")) {
    result = `/${result}`;
  }

  result = result
    .replace(/(\\)+\./g, ".")
    .replace(/\*\*\/\*\//g, `(${fileNameRegexp}\\/(${fileNameRegexp}\\/)??)?`)
    .replace(/\*\*\/\*/g, `(${fileNameRegexp}(\\/${fileNameRegexp})??)?`)
    .replace(/\*\*\//g, `(${fileNameRegexp}\\/)?`)
    .replace(/\*/g, `(${fileNameRegexp})??`)
    .replace(/\?\?/g, "*")
    .replace(/\./g, "\\.")
    .replace(/([^\\]+|^)\//g, "$1\\/");

  if (!result.endsWith("$")) {
    result = `${result}$`;
  }

  return `^${result}`;
};

export const getFiles = (
  { excludeItems, extensions, folder }: GetFilesProps,
  files: string[] = []
) => {
  fs.readdirSync(folder).forEach((item) => {
    const itemPath = convertFileSystem(path.resolve(folder, item));
    const relativePath = convertFileSystem(
      `/${path.relative(process.cwd(), itemPath)}`
    );
    const isItemMatch = testItem({ excludeItems, relativePath });

    if (!isItemMatch) {
      return files;
    }

    const isDirectory = fs.lstatSync(itemPath).isDirectory();

    if (isDirectory) {
      getFiles({ excludeItems, extensions, folder: itemPath }, files);
    } else if (
      !isDirectory &&
      (!extensions.length || extensions.includes(path.extname(item)))
    ) {
      files.push(`.${relativePath}`);
    }
  });

  return files;
};

export const testItem = ({ excludeItems, relativePath }: TestItemProps) => {
  return excludeItems.every((regex) => !relativePath.match(regex));
};

export const testRegex = (patterns: string[]) => {
  for (let pattern of patterns) {
    try {
      new RegExp(pattern);
    } catch {
      throw Error(`'${pattern}' is not valid RegExp`);
    }
  }
};
