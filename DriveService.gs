const DriveService = {
  getOrCreatePath: function(rootId, path) {
    let currentFolder = DriveApp.getFolderById(rootId);
    path.split('/').forEach(name => {
      if (!name) return;
      const folders = currentFolder.getFoldersByName(name);
      currentFolder = folders.hasNext() ? folders.next() : currentFolder.createFolder(name);
    });
    return currentFolder;
  },

  saveAttachments: function(folder, atts, prefix) {
    atts.forEach(att => folder.createFile(att).setName(prefix + att.getName()));
  }
};
