export type FileSystem = (string | [directory: string, items: FileSystem])[];

export const lstatSyncMock = (fileSystem: FileSystem) => (item: string) => ({
  isDirectory: () => {
    item = item.replace(process.cwd(), "");
    const paths = item.split("/");

    let isDirectory = false;
    let folderItems = fileSystem.slice();

    for (let key of paths) {
      const existingItem = folderItems.find(
        (item) => (Array.isArray(item) && item[0] === key) || item === key
      );

      if (!existingItem || !Array.isArray(existingItem)) {
        isDirectory = false;
        break;
      }

      folderItems = existingItem[1].slice();
      isDirectory = true;
    }

    return isDirectory;
  }
});

export const readdirSyncMock = (fileSystem: FileSystem) => (folder: string) => {
  folder = folder.replace(process.cwd(), "");
  const paths = folder.split("/");
  let folderItems = fileSystem.slice();

  for (let key of paths) {
    const existingItem = folderItems.find(
      (item) => (Array.isArray(item) && item[0] === key) || item === key
    );
    if (!existingItem || !Array.isArray(existingItem)) {
      folderItems = [];
      break;
    }
    folderItems = existingItem[1].slice();
  }

  return folderItems.map((item) => (Array.isArray(item) ? item[0] : item));
};
