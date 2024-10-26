import { format } from "date-fns";
import fs from "fs";
import CryptoJS from "crypto-js";

export const convertToDate = (input) => {
  const [datePart, secondsPart] = input.split("_");
  const [day, month, year] = datePart.split("/");
  const totalSeconds = parseFloat(secondsPart);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hours
    .toString()
    .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}Z`;
  return isoDate;
};

export const getFileChecksum = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return reject(err);
      }
      const hash = CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
      resolve(hash);
    });
  });
};

const str = "7a33de98fd5e7b3b00c06cf688bad6432c5447895f501c748174454275b4f32a";
