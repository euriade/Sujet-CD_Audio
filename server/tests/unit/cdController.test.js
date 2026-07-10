jest.mock("../../configs/db", () => ({
    query: jest.fn(),
}));

const pool = require("../../configs/db");
const {
    getAllCDs,
    addCD,
    deleteCD,
} = require("../../Controllers/cdController");

const createMockResponse = () => {
    const res = {};

    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);

    return res;
};

describe("cdController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getAllCDs", () => {
        test("should return all CDs", async () => {
            const mockCDs = [
                {
                    id: 1,
                    title: "Random Access Memories",
                    artist: "Daft Punk",
                    year: 2013,
                },
                {
                    id: 2,
                    title: "Discovery",
                    artist: "Daft Punk",
                    year: 2001,
                },
            ];

            pool.query.mockResolvedValue({ rows: mockCDs });

            const req = {};
            const res = createMockResponse();

            await getAllCDs(req, res);

            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith("SELECT * FROM cds ORDER BY id ASC");
            expect(res.json).toHaveBeenCalledWith(mockCDs);
            expect(res.status).not.toHaveBeenCalled();
        });

        test("should return a 500 status code if database connection fails", async () => {
            pool.query.mockRejectedValue(
                new Error("Database connection impossible")
            );

            const req = {};
            const res = createMockResponse();

            await getAllCDs(req, res);

            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Database connection impossible" });
        });

        test("should return an empty array if no CDs are found", async () => {
            pool.query.mockResolvedValue({ rows: [] });

            const req = {};
            const res = createMockResponse();

            await getAllCDs(req, res);

            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith([]);
        });
    });

    describe("addCD", () => {
        test("should add a new CD and return it", async () => {
            const req = {
                body: {
                    title: "The Dark Side of the Moon",
                    artist: "Pink Floyd",
                    year: 1973,
                },
            };

            const createdCD = {
                id: 1,
                ...req.body,
            };

            pool.query.mockResolvedValue({ rows: [createdCD] });

            const res = createMockResponse();

            await addCD(req, res);

            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith(
                "INSERT INTO cds (title, artist, year) VALUES ($1, $2, $3) RETURNING *",
                [req.body.title, req.body.artist, req.body.year]
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(createdCD);
        });

        test("should return a 500 status code if adding a CD fails", async () => {
            const req = {
                body: {
                    title: "Oui Jérôme c'est moi",
                    artist: "Jérôme Chépuki",
                    year: 1980,
                },
            };

            pool.query.mockRejectedValue(new Error("Error during CD insertion"));

            const res = createMockResponse();

            await addCD(req, res);

            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Error during CD insertion" });
        });
    });

    describe("deleteCD", () => {
        test("should delete a CD and return 204 status code", async () => {
            pool.query.mockResolvedValue({
                rowCount: 1,
            });

            const req = {
                params: {
                    id: 1,
                },
            };

            const res = createMockResponse();

            await deleteCD(req, res);

            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith("DELETE FROM cds WHERE id = $1", [req.params.id]);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        test("should return a 500 status code if deleting a CD fails", async () => {
            pool.query.mockRejectedValue(new Error("Error during CD deletion"));

            const req = {
                params: {
                    id: 1,
                },
            };

            const res = createMockResponse();

            await deleteCD(req, res);

            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Error during CD deletion" });
        });
    });
});