import { getCDs, addCD, deleteCD } from "../../src/services/cdService";

describe("Frontend-API Integration Tests", () => {
    let createdCDIds = [];

    beforeEach(() => {
        createdCDIds = [];
    });

    afterEach(async () => {
        for (const id of createdCDIds) {
            await deleteCD(id);
        }
    });

    describe("getCDs", () => {
        test("should return an empty array when there are no CDs", async () => {
            const cds = await getCDs();
            expect(Array.isArray(cds)).toBe(true);
            expect(cds).toHaveLength(0);
        });

        test("should return all CDs after adding them", async () => {
            const testCD = {
                title: "Like Water",
                artist: "Lyves",
                year: 2017,
            };
            const addedCD = await addCD(testCD);
            createdCDIds.push(addedCD.id);

            const cds = await getCDs();

            expect(Array.isArray(cds)).toBe(true);
            expect(cds.length).toBeGreaterThan(0);
            expect(cds.some((cd) => cd.id === addedCD.id)).toBe(true);
        });
    });

    describe("addCD", () => {
        test("should add a new CD and return it", async () => {
            const newCD = {
                title: "A Moment Apart",
                artist: "Odesza",
                year: 2017,
            };

            const result = await addCD(newCD);
            createdCDIds.push(result.id);

            expect(result).toHaveProperty("id");
            expect(result.title).toBe(newCD.title);
            expect(result.artist).toBe(newCD.artist);
            expect(result.year).toBe(newCD.year);

            const cds = await getCDs();
            const addedCD = cds.find((cd) => cd.id === result.id);
            expect(addedCD).toBeDefined();
            expect(addedCD.title).toBe(newCD.title);
        });

        test("should return a CD with an id when added", async () => {
            const cd1 = {
                title: "Awake",
                artist: "Tycho",
                year: 2014,
            };

            const cd2 = {
                title: "Dive",
                artist: "Tycho",
                year: 2011,
            };

            const result1 = await addCD(cd1);
            const result2 = await addCD(cd2);

            createdCDIds.push(result1.id, result2.id);

            expect(result1.id).toBeDefined();
            expect(result2.id).toBeDefined();
            expect(result1.id).not.toBe(result2.id);
        });
    });

    describe("deleteCD", () => {
        test("should delete a CD with API", async () => {
            const testCD = {
                title: "Awake",
                artist: "Tycho",
                year: 2014,
            };

            const addedCD = await addCD(testCD);
            const cdId = addedCD.id;

            let cds = await getCDs();
            expect(cds.some((cd) => cd.id === cdId)).toBe(true);

            await deleteCD(cdId);

            cds = await getCDs();
            expect(cds.some((cd) => cd.id === cdId)).toBe(false);
        });

        test("ne devrait pas échouer lors de la suppression d'un CD inexistant", async () => {
            await expect(deleteCD(99999)).resolves.not.toThrow();
        });
    });

    describe("Scénario d'intégration complet Frontend-API", () => {
        test("devrait permettre d'ajouter, lister et supprimer plusieurs CDs", async () => {
            const cd1 = {
                title: "The Dark Side of the Moon",
                artist: "Pink Floyd",
                year: 1973,
            };
            const addedCD1 = await addCD(cd1);
            createdCDIds.push(addedCD1.id);

            const cd2 = {
                title: "Abbey Road",
                artist: "The Beatles",
                year: 1969,
            };
            const addedCD2 = await addCD(cd2);
            createdCDIds.push(addedCD2.id);

            let cds = await getCDs();
            expect(cds.some((cd) => cd.id === addedCD1.id)).toBe(true);
            expect(cds.some((cd) => cd.id === addedCD2.id)).toBe(true);

            await deleteCD(addedCD1.id);
            createdCDIds = createdCDIds.filter((id) => id !== addedCD1.id);

            cds = await getCDs();
            const hasCD1 = cds.some((cd) => cd.id === addedCD1.id);
            const hasCD2 = cds.some((cd) => cd.id === addedCD2.id);

            expect(hasCD1).toBe(false);
            expect(hasCD2).toBe(true);

            await deleteCD(addedCD2.id);
            createdCDIds = createdCDIds.filter((id) => id !== addedCD2.id);

            cds = await getCDs();
            expect(cds.some((cd) => cd.id === addedCD2.id)).toBe(false);
        });
    });
});