module.exports = {
  permalink: (data) => {
    // Preserve original .html filenames instead of creating /dir/index.html
    return data.page.filePathStem + ".html";
  },
};
