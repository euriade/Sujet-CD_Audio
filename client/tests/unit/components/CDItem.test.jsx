import { clickElement, renderComponent } from "../../helpers/reactDomTestUtils";
import CDItem from "../../../src/components/CDItem";

describe("CDItem", () => {
  let view;

  afterEach(async () => {
    if (view) {
      await view.unmount();
      view = undefined;
    }
  });

  test("renders the CD information", async () => {
    const cd = {
      id: 7,
      title: "Discovery",
      artist: "Daft Punk",
      year: 2001,
    };

    view = await renderComponent(<CDItem cd={cd} onDelete={jest.fn()} />);

    expect(view.container.querySelector("span").textContent).toBe(
      "Discovery - Daft Punk (2001)"
    );
  });

  test("calls onDelete with the CD id", async () => {
    const onDelete = jest.fn();
    const cd = {
      id: 7,
      title: "Discovery",
      artist: "Daft Punk",
      year: 2001,
    };
    view = await renderComponent(<CDItem cd={cd} onDelete={onDelete} />);

    await clickElement(view.container.querySelector("button"));

    expect(onDelete).toHaveBeenCalledWith(7);
  });
});
