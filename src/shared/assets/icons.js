const iconUrls = import.meta.glob("./icons/*.svg", {
  eager: true,
  import: "default",
  query: "?url",
});

export const icon = (name) => iconUrls[`./icons/${name}.svg`] || "";
