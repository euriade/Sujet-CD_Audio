import { act } from "react";
import { createRoot } from "react-dom/client";

export const renderComponent = async (element) => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);
  await act(async () => {
    root.render(element);
  });

  return {
    container,
    unmount: async () => {
      await act(async () => {
        root.unmount();
      });
      container.remove();
    },
  };
};

export const changeInput = async (input, value) => {
  const valueSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  ).set;

  await act(async () => {
    valueSetter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
};

export const submitForm = async (form) => {
  await act(async () => {
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );
    await Promise.resolve();
  });
};

export const clickElement = async (element) => {
  await act(async () => {
    element.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true })
    );
    await Promise.resolve();
  });
};

export const flushUpdates = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};
