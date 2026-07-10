import { addCD } from "../../../src/services/cdService";
import {
  changeInput,
  renderComponent,
  submitForm,
} from "../../helpers/reactDomTestUtils";
import AddCD from "../../../src/components/AddCD";

jest.mock("../../../src/services/cdService", () => ({
  addCD: jest.fn(),
}));

describe("AddCD", () => {
  let view;

  afterEach(async () => {
    if (view) {
      await view.unmount();
      view = undefined;
    }
  });

  test("renders the form fields", async () => {
    view = await renderComponent(<AddCD onAdd={jest.fn()} />);

    expect(view.container.querySelector('input[name="title"]')).not.toBeNull();
    expect(view.container.querySelector('input[name="artist"]')).not.toBeNull();
    expect(view.container.querySelector('input[name="year"]')).not.toBeNull();
    expect(view.container.querySelector('button[type="submit"]').textContent).toBe(
      "Ajouter"
    );
  });

  test("does not add a CD when the form is incomplete", async () => {
    view = await renderComponent(<AddCD onAdd={jest.fn()} />);
    const form = view.container.querySelector("form");

    await submitForm(form);

    expect(addCD).not.toHaveBeenCalled();
  });

  test("submits the CD, calls onAdd and clears the form", async () => {
    const onAdd = jest.fn();
    addCD.mockResolvedValue({ id: 1 });
    view = await renderComponent(<AddCD onAdd={onAdd} />);

    const titleInput = view.container.querySelector('input[name="title"]');
    const artistInput = view.container.querySelector('input[name="artist"]');
    const yearInput = view.container.querySelector('input[name="year"]');

    await changeInput(titleInput, "Discovery");
    await changeInput(artistInput, "Daft Punk");
    await changeInput(yearInput, "2001");
    await submitForm(view.container.querySelector("form"));

    expect(addCD).toHaveBeenCalledWith({
      title: "Discovery",
      artist: "Daft Punk",
      year: "2001",
    });
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(titleInput.value).toBe("");
    expect(artistInput.value).toBe("");
    expect(yearInput.value).toBe("");
  });
});
