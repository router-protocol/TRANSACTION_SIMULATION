const fs = require("fs").promises;

export async function readJsonFile (filePath, defaultMessage = ""){
  try {
    const data = await fs.readFile(filePath, "utf8");
    if (!data) {
      console.error(`File ${filePath} is empty. ${defaultMessage}`);
      return [];
    }
    const parsedData = JSON.parse(data);
    if (Object.keys(parsedData).length === 0) {
      console.error(`File ${filePath} contains no data. ${defaultMessage}`);
      return [];
    }
    return parsedData;
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(`File ${filePath} is missing. ${defaultMessage}`);
    } else {
      console.error(
        `Error reading or parsing file ${filePath}: ${error.message}`
      );
    }
    return [];
  }
};

export async function writeJsonFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
    console.log(`File has been saved successfully to ${filePath}`);
  } catch (error) {
    console.error(`Error writing file to ${filePath}:`, error);
  }
};

module.exports = {
  readJsonFile,
  writeJsonFile,
};
