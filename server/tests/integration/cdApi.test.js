const request = require("supertest");
const express = require("express");
const cors = require("cors");
const cdRoutes = require("../../Routes/cdRoutes");
const pool = require("../../configs/db");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", cdRoutes);

describe("CD API Integration Tests", () => {
    beforeAll(async () => {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS cds (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                artist VARCHAR(255) NOT NULL,
                year INT NOT NULL
            )
        `);
    });

    beforeEach(async () => {
        await pool.query("DELETE FROM cds");
        await pool.query(`ALTER SEQUENCE cds_id_seq RESTART WITH 1`);
    });

    afterAll(async () => {
        await pool.query("DELETE FROM cds");
        await pool.end();
    });

    describe("GET /api/cds", () => {
        test("should return an empty array when there are no CDs", async () => {
            const response = await request(app).get("/api/cds");
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        test("should return all CDs", async () => {
            await pool.query(
                "INSERT INTO cds (title, artist, year) VALUES ($1, $2, $3), ($4, $5, $6)",
                ["What Kinda Music", "Yussef Dayes", 2020, "Unison Life", "Brutus", 2022]
            );

            const response = await request(app).get("/api/cds");

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(response.body[0]).toMatchObject({
                id: 1,
                title: "What Kinda Music",
                artist: "Yussef Dayes",
                year: 2020,
            });
            expect(response.body[1]).toMatchObject({
                id: 2,
                title: "Unison Life",
                artist: "Brutus",
                year: 2022,
            });
        });
    });

    describe("POST /api/cds", () => {
        test("should add a new CD and return it", async () => {
            const newCD = {
                title: "The Celestial Suite",
                artist: "Pale Jay",
                year: 2021,
            };

            const response = await request(app).post("/api/cds").send(newCD);

            expect(response.status).toBe(201);
            expect(response.body).toMatchObject({
                id: 1,
                ...newCD,
            });

            const dbResponse = await pool.query("SELECT * FROM cds WHERE id = $1", [1]);
            expect(dbResponse.rows).toHaveLength(1);
            expect(dbResponse.rows[0]).toMatchObject({
                id: 1,
                ...newCD,
            });
        });

        test("should return a CD with an auto-incremented ID", async () => {
            const firstCD = {
                title: "Odyssey",
                artist: "SunSquabi",
                year: 2016,
            };

            const secondCD = {
                title: "Rin, Tongue and Dorner",
                artist: "Elsiane",
                year: 2018,
            };

            const response1 = await request(app).post("/api/cds").send(firstCD);
            const response2 = await request(app).post("/api/cds").send(secondCD);

            expect(response1.body.id).toBe(1);
            expect(response2.body.id).toBe(2);
        });
    });

    describe("DELETE /api/cds/:id", () => {
        test("should delete a CD", async () => {
            const result = await pool.query(
                "INSERT INTO cds (title, artist, year) VALUES ($1, $2, $3) RETURNING *",
                ["The Celestial Suite", "Pale Jay", 2021]
            );
            const cdId = result.rows[0].id;

            const response = await request(app).delete(`/api/cds/${cdId}`);

            expect(response.status).toBe(204);

            const checkResult = await pool.query("SELECT * FROM cds WHERE id = $1", [cdId]);
            expect(checkResult.rows).toHaveLength(0);
        });

        test("should return 404 when trying to delete a non-existent CD", async () => {
            const response = await request(app).delete("/api/cds/999");

            expect(response.status).toBe(204);
        });
    });

    describe("Complete integration scenario", () => {
        test("should add, retrieve, and delete a CD", async () => {
            let response = await request(app).get("/api/cds");
            expect(response.body).toHaveLength(0);

            const cd1 = {
                title: "Random Access Memories",
                artist: "Daft Punk",
                year: 2013,
            };

            response = await request(app).post("/api/cds").send(cd1);
            expect(response.status).toBe(201);
            const cdId = response.body.id;

            const cd2 = {
                title: "Discovery",
                artist: "Daft Punk",
                year: 2001,
            };

            response = await request(app).post("/api/cds").send(cd2);
            expect(response.status).toBe(201);
            const cd2Id = response.body.id;

            response = await request(app).get("/api/cds");
            expect(response.body).toHaveLength(2);

            response = await request(app).delete(`/api/cds/${cdId}`);
            expect(response.status).toBe(204);

            response = await request(app).get("/api/cds");
            expect(response.body).toHaveLength(1);
            expect(response.body[0].id).toBe(cd2Id);

            response = await request(app).delete(`/api/cds/${cd2Id}`);
            expect(response.status).toBe(204);

            response = await request(app).get("/api/cds");
            expect(response.body).toHaveLength(0);
        });
    });
});

