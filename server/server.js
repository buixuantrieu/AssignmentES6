import express from "express";
import bodyParser from "body-parser";
import csv from "csv-parser";
import cors from "cors";
import fs from "fs";
import multer from "multer";
const upload = multer({ dest: "uploads/" });
import { PrismaClient } from "@prisma/client";
import { convertToDate } from "./service/utils.js";
const prisma = new PrismaClient();

const PORT = 3000;
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let results = [];

app.post("/upload-csv", upload.single("fileCSV"), async (req, res) => {
  results = [];
  await prisma.statement.deleteMany();
  const startTime = Date.now();
  fs.createReadStream(req.file.path)
    .pipe(
      csv({
        headers: ["dateTime", "transNo", "credit", "debit", "detail"],
        skipLines: 1,
      })
    )
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      const fileReadingTime = Date.now() - startTime;
      const newData = results.map((item) => {
        const dateTime = convertToDate(item.dateTime);
        return {
          dateTime,
          transNo: parseFloat(item.transNo),
          credit: parseFloat(item.credit),
          debit: parseFloat(item.debit),
          detail: item.detail,
        };
      });
      try {
        const batchSize = 2000;
        for (let i = 0; i < newData.length; i += batchSize) {
          const batch = newData.slice(i, i + batchSize);
          await prisma.$transaction(async (prisma) => {
            await prisma.statement.createMany({
              data: batch,
            });
          });
        }
        const databaseRetentionTime = Date.now() - startTime;
        res.json({ fileReadingTime, databaseRetentionTime, dataList: newData });
      } catch (e) {
        console.log(e);
      }
    });
});

app.get("/", async (req, res) => {
  const { keyword, credit, fromDate, toDate } = req.query;
  const startTime = Date.now();
  const result = await prisma.statement.findMany({
    where: {
      detail: {
        contains: keyword,
      },
      ...(credit && {
        AND: [{ credit: { gte: parseFloat(credit[0]) } }, { credit: { lte: parseFloat(credit[1]) } }],
      }),
      dateTime: {
        gte: fromDate,
        lte: toDate,
      },
    },
  });
  const endTime = Date.now() - startTime;
  res.json({ dataList: result, endTime });
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
