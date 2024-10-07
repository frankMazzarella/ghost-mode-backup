const fs = require("node:fs/promises");
const path = require("node:path");
const readline = require("node:readline");

let config;

// TODO: should probably be using path.join
// TODO: copy wildlands only 1771 (ubisoft version) or 3559 (steam version)

const defaultConfigData = {
  backupIntervalMinutes: 15,
  sourceDir:
    "C:\\Program Files (x86)\\Ubisoft\\Ubisoft Game Launcher\\savegames",
  userId: "",
};

const initialize = async () => {
  const configExists = await getConfigExists();
  if (configExists) {
    await loadConfigData();
    const isConfigDataValid = await getConfigDataValid();
    if (isConfigDataValid) {
      console.log(
        `starting savegame backup at ${config.backupIntervalMinutes} minute intervals`
      );
      copySaveGame();
      setInterval(copySaveGame, config.backupIntervalMinutes * 60 * 1000);
    } else {
      pressEnterToClose();
    }
  } else {
    await createConfigFile();
    console.warn("make sure to edit config.json and add the correct user id");
    pressEnterToClose();
  }
};

const pressEnterToClose = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("press enter to close", () => {
    rl.close();
  });
};

const getConfigDataValid = async () => {
  if (!config.userId) {
    const userIdSuccess = await tryToAssumeUserId();
    if (!userIdSuccess) {
      console.error("you must edit config.json and set the user id value");
      return false;
    }
  }
  try {
    await fs.stat(getSourceDir());
  } catch {
    console.error("user id value is not correct");
    return false;
  }
  return true;
};

const tryToAssumeUserId = async () => {
  const dir = await fs.readdir(config.sourceDir);
  if (dir.length === 1) {
    config.userId = dir[0];
    console.log(`user id is not set - assuming ${config.userId}`);
    return true;
  }
  return false;
};

const loadConfigData = async () => {
  try {
    config = JSON.parse(await fs.readFile("config.json"));
  } catch (error) {
    console.error(error);
  }
};

const getConfigExists = async () => {
  try {
    await fs.stat("config.json");
    return true;
  } catch {
    console.log("config.json file does not exist");
    return false;
  }
};

const createConfigFile = async () => {
  try {
    await fs.writeFile(
      "config.json",
      JSON.stringify(defaultConfigData, null, 2)
    );
    console.log("config.json file has been created with default data");
  } catch (error) {
    console.error(error);
  }
};

const getSourceDir = () => {
  return `${config.sourceDir}\\${config.userId}`;
};

const getDestinationDir = () => {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const hours = `${now.getHours().toString().padStart(2, 0)}`;
  const minutes = `${now.getMinutes().toString().padStart(2, 0)}`;
  const seconds = `${now.getSeconds().toString().padStart(2, 0)}`;
  const timeStr = `${hours}-${minutes}-${seconds}`;
  return `backups\\${dateStr}T${timeStr}\\${path.basename(getSourceDir())}`;
};

const copySaveGame = async () => {
  try {
    const sourceDir = getSourceDir();
    const destinationDir = getDestinationDir();
    await fs.cp(sourceDir, destinationDir, { recursive: true });
    console.log(
      `\nFILES SUCCESSFULLY COPIED\n\tFROM: ${sourceDir}\n\t  TO: ${destinationDir}`
    );
  } catch (error) {
    console.error(error);
  }
};

initialize();
