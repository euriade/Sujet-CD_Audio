import axios from "axios";
import { addCD, deleteCD, getCDs } from "../../../src/services/cdService";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

const API_URL = "http://localhost:5005/api/cds";

describe("cdService", () => {
  test("getCDs returns the CDs received from the API", async () => {
    const cds = [
      { id: 1, title: "Discovery", artist: "Daft Punk", year: 2001 },
    ];
    axios.get.mockResolvedValue({ data: cds });

    await expect(getCDs()).resolves.toEqual(cds);
    expect(axios.get).toHaveBeenCalledWith(API_URL);
  });

  test("addCD sends a CD and returns the created CD", async () => {
    const cd = {
      title: "The Dark Side of the Moon",
      artist: "Pink Floyd",
      year: 1973,
    };
    const createdCD = { id: 1, ...cd };
    axios.post.mockResolvedValue({ data: createdCD });

    await expect(addCD(cd)).resolves.toEqual(createdCD);
    expect(axios.post).toHaveBeenCalledWith(API_URL, cd);
  });

  test("deleteCD sends the CD id in the URL", async () => {
    axios.delete.mockResolvedValue({});

    await deleteCD(12);

    expect(axios.delete).toHaveBeenCalledWith(`${API_URL}/12`);
  });
});
