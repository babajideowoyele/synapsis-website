module.exports = function (eleventyConfig) {
  // Passthrough copy — static asset directories
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("demos");
  eleventyConfig.addPassthroughCopy("downloads");
  eleventyConfig.addPassthroughCopy("maskanyone_carbon_redesign");

  // Passthrough copy — root-level static files
  eleventyConfig.addPassthroughCopy("*.css");
  eleventyConfig.addPassthroughCopy("*.svg");
  eleventyConfig.addPassthroughCopy("main.js");
  eleventyConfig.addPassthroughCopy("search.js");
  eleventyConfig.addPassthroughCopy("theme.js");
  eleventyConfig.addPassthroughCopy("search-index.json");

  // Ignore directories that should not be processed as templates
  eleventyConfig.ignores.add("maskanyone_carbon_redesign/**");
  eleventyConfig.ignores.add("demos/**");
  eleventyConfig.ignores.add("downloads/**");
  eleventyConfig.ignores.add("assets/**");

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    htmlTemplateEngine: "njk",
  };
};
