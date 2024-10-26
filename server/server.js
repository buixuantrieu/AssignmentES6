import express from "express";
import bodyParser from "body-parser";
import csv from "csv-parser";
import cors from "cors";
import fs from "fs";
import multer from "multer";

const upload = multer({ dest: "uploads/" });
import { PrismaClient } from "@prisma/client";
import { convertToDate } from "./service/utils.js";
import { getFileChecksum } from "./service/utils.js";
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
  try {
    results = [];
    let { checkSum } = req.query;
    if (checkSum == "undefined") {
      checkSum = undefined;
    }

    const startTime = Date.now();

    const hash = await getFileChecksum(req.file.path);
    const checkSumm = await prisma.checkSum.findFirst({
      where: {
        hash,
      },
    });
    if (checkSumm && !checkSum) {
      res.status(400).json({ message: "File đã được tải lên" });
    } else {
      await prisma.checkSum.create({
        data: {
          hash,
        },
      });
      await prisma.statement.deleteMany();
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
          const batchSize = 1000;
          const batches = [];
          for (let i = 0; i < newData.length; i += batchSize) {
            const batch = newData.slice(i, i + batchSize);
            batches.push(
              prisma.statement.createMany({
                data: batch,
              })
            );
          }
          await Promise.all(batches);

          const databaseRetentionTime = Date.now() - startTime;
          res.json({ fileReadingTime, databaseRetentionTime, dataList: newData });
        });
    }
  } catch (e) {
    res.status(500).json({ error: "Error saving data" });
  }
});
app.get("/total-by-day", async (req, res) => {
  const startTime = Date.now();

  const { date } = req.query;
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);
  startOfDay.setHours(startOfDay.getHours() + 14);
  endOfDay.setHours(endOfDay.getHours() + 14);

  try {
    const result = await prisma.statement.findMany({
      where: {
        dateTime: {
          gte: startOfDay.toISOString(),
          lt: endOfDay.toISOString(),
        },
      },
    });
    const totalAmount = result.reduce((acc, transaction) => acc + transaction.credit, 0);
    const endTime = Date.now() - startTime;

    res.json({ total: totalAmount, endTime });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/total-period", async (req, res) => {
  const startTime = Date.now();

  const { date } = req.query;
  const startOfDay = new Date(date[0]);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date[1]);
  endOfDay.setUTCHours(23, 59, 59, 999);
  startOfDay.setHours(startOfDay.getHours() + 14);
  endOfDay.setHours(endOfDay.getHours() + 14);
  try {
    const result = await prisma.statement.findMany({
      where: {
        dateTime: {
          gte: startOfDay.toISOString(),
          lt: endOfDay.toISOString(),
        },
      },
    });
    const totalAmount = result.reduce((acc, transaction) => acc + transaction.credit, 0);
    const endTime = Date.now() - startTime;

    res.json({ total: totalAmount, endTime });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/count", async (req, res) => {
  try {
    const startTime = Date.now();
    const { money } = req.query;

    const count = await prisma.statement.count({
      where: {
        credit: Number(money),
      },
    });
    const endTime = Date.now() - startTime;
    res.status(200).json({ count, endTime });
  } catch (e) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/", async (req, res) => {
  try {
    const { keyword, credit, fromDate, toDate, take, skip } = req.query;
    const takeNumber = Number(take);
    const skipNumber = Number(skip) * Number(take);
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
      skip: skipNumber,
      take: takeNumber,
      orderBy: {
        dateTime: "desc",
      },
    });
    const maxPrice = await prisma.statement.aggregate({
      _max: {
        credit: true,
      },
    });
    const maxCredit = maxPrice._max.credit;
    const endTime = Date.now() - startTime;
    res.json({ dataList: result, endTime, maxCredit });
  } catch (e) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
