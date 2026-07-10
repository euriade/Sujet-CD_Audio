import { deleteCD, getCDs } from "../../../src/services/cdService";
import {
  clickElement,
  flushUpdates,
  renderComponent,
} from "../../helpers/reactDomTestUtils";
import CDList from "../../../src/components/CDList";

jest.mock("../../../src/services/cdService", () => ({
  getCDs: jest.fn(),
  deleteCD: jest.fn(),
}));

const cd = {
  id: 7,
  title: "Discovery",
  artist: "Daft Punk",
  year: 2001,
};

describe("CDList", () => {
  let view;

  afterEach(async () => {
    if (view) {
      await view.unmount();
      view = undefined;
    }
  });

  test("loads and renders the available CDs", async () => {
    getCDs.mockResolvedValue([cd]);

    view = await renderComponent(<CDList />);
    await flushUpdates();

    expect(getCDs).toHaveBeenCalledTimes(1);
    expect(view.container.querySelector("li").textContent).toContain(
      "Discovery - Daft Punk (2001)"
    );
  });

  test("renders a message when no CD is available", async () => {
    getCDs.mockResolvedValue([]);

    view = await renderComponent(<CDList />);
    await flushUpdates();

    expect(getCDs).toHaveBeenCalledTimes(1);
    expect(view.container.querySelector("li")).toBeNull();
    expect(view.container.querySelector("p").textContent).toBe(
      "Aucun CD disponible"
    );
  });

  test("deletes a CD and refreshes the list", async () => {
    getCDs.mockResolvedValueOnce([cd]).mockResolvedValueOnce([]);
    deleteCD.mockResolvedValue();

    view = await renderComponent(<CDList />);
    await flushUpdates();
    await clickElement(view.container.querySelector("button.delete-btn"));
    await flushUpdates();

    expect(deleteCD).toHaveBeenCalledWith(7);
    expect(getCDs).toHaveBeenCalledTimes(2);
    expect(view.container.querySelector("li")).toBeNull();
    expect(view.container.querySelector("p").textContent).toBe(
      "Aucun CD disponible"
    );
  });
});
