// A tiny hash router: "#/signin", "#/welcome/2", "#/settings/bot". Each page renders markup and handles
// its own clicks, changes and submits (events are delegated from #app).

export type Page = {
  title: string;
  render: (param: string) => string;
  click?: (el: HTMLElement, param: string) => void;
  change?: (el: HTMLElement, param: string) => void;
  submit?: (form: HTMLFormElement, param: string) => void;
};

export type Route = { name: string; param: string };

export const parse = (hash: string): Route => {
  const [name = "", param = ""] = hash.replace(/^#\/?/, "").split("/");
  return { name, param };
};

export const go = (hash: string) => {
  if (location.hash === hash) window.dispatchEvent(new HashChangeEvent("hashchange"));
  else location.hash = hash;
};
