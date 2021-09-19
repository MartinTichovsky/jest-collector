import fs from "fs";
import path from "path";
import { __collectorProps__ } from "./constants";
import { getTestPath } from "./jest-globals";
import { GetFilesProps, TestItemProps } from "./types";

const fileNameRegexp = "[a-zA-Z0-9\\-._\\$\\@\\[\\]\\+&!]+";

export const convertFileSystem = (item: string) => item?.replace(/\\/g, "/");
export const convertFileSystemArray = (result: string[]) =>
  result.map((item) => convertFileSystem(item));

export const createRegexp = (value: string) => {
  let result = getPattern(value);

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
  { exclude, extensions, folder, include, root }: GetFilesProps,
  files: string[] = []
) => {
  fs.readdirSync(folder).forEach((item) => {
    const itemPath = convertFileSystem(path.resolve(folder, item));
    const relativePath = convertFileSystem(
      `/${path.relative(process.cwd(), itemPath)}`
    );

    const isDirectory = fs.lstatSync(itemPath).isDirectory();

    if (isDirectory) {
      getFiles({ exclude, extensions, folder: itemPath, include, root }, files);
    } else if (
      !isDirectory &&
      testItem({ exclude, include, relativePath, root }) &&
      (!extensions.length || extensions.includes(path.extname(item)))
    ) {
      files.push(`.${relativePath}`);
    }
  });

  return files;
};

export const getPattern = (value: string) => {
  if (!value.match(/^[\^\.\/\*]+/)) {
    value = `**/*/${value}`;
  }

  return value;
};

export const ignoreTest = (
  property: "exclude" | "include",
  items?: string[]
) => {
  const testPath = getTestPath();

  if (!testPath || !items) {
    return property === "exclude" ? false : true;
  }

  const relativeTestPath = convertFileSystem(
    testPath.replace(process.cwd(), "")
  );

  items = items.map((value) => createRegexp(value));

  testRegex(items, property);

  return items.some((regexp) => relativeTestPath.match(regexp));
};

export const removeCollectorPrivatePropsFromArgs = (...args: unknown[]) => {
  if (Array.isArray(args) && args[0] && args[0][__collectorProps__]) {
    args[0] = { ...args[0] };
    delete args[0][__collectorProps__];
  }

  return args;
};

export const testItem = ({
  exclude,
  include,
  relativePath,
  root
}: TestItemProps) => {
  relativePath = relativePath.replace(`/${root}`, "");

  return (
    (!exclude.length || exclude.every((regex) => !relativePath.match(regex))) &&
    (!include.length || include.some((regex) => relativePath.match(regex)))
  );
};

export const testRegex = (patterns: string[], property?: string) => {
  for (let pattern of patterns) {
    try {
      new RegExp(pattern);
    } catch {
      throw Error(`pattern '${pattern}' in '${property}' is not valid RegExp`);
    }
  }
};
