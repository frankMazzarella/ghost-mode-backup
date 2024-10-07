const fs = require("node:fs/promises");
const path = require("node:path");
const readline = require("node:readline");

const asciiArt = require("./asciiArt");

const APP_VERSION = "v0.1.0";
let config;

const defaultConfigData = {
  backupIntervalMinutes: 15,
  sourceDir:
    "C:\\Program Files (x86)\\Ubisoft\\Ubisoft Game Launcher\\savegames",
  userId: "",
  gameId: "",
};

const initialize = async () => {
  asciiArt.printAsciiArt();
  console.log(`launching drone from helicopter ${APP_VERSION}`);
  const configExists = await getConfigExists();
  if (!configExists) {
    await createConfigFile();
  }
  await loadConfigData();
  const isConfigDataValid = await getConfigDataValid();
  if (isConfigDataValid) {
    startBackupInterval();
  } else {
    pressEnterToClose();
  }
};

const startBackupInterval = () => {
  console.log(
    `starting savegame backup at ${config.backupIntervalMinutes} minute intervals`
  );
  copySaveGame();
  setInterval(copySaveGame, config.backupIntervalMinutes * 60 * 1000);
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
  await validateUserId();
  await validateGameId();
  return true;
};

const validateUserId = async () => {
  if (!config.userId) {
    const userIdSuccess = await tryToAssumeUserId();
    if (!userIdSuccess) {
      console.error("you must edit config.json and set the user id value");
      return false;
    }
  }
  try {
    await fs.stat(path.join(config.sourceDir, config.userId));
  } catch {
    console.error("user id value is not correct");
    return false;
  }
};

const validateGameId = async () => {
  if (!config.gameId) {
    const gameIdSuccess = await tryToAssumeGameId();
    if (!gameIdSuccess) {
      console.error("you must edit config.json and set the game id value");
      return false;
    }
  }
  try {
    await fs.stat(path.join(config.sourceDir, config.userId, config.gameId));
  } catch {
    console.error("game id value is not correct");
    return false;
  }
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

const tryToAssumeGameId = async () => {
  const ubisoftId = "1771";
  const steamId = "3559";
  const dir = await fs.readdir(path.join(config.sourceDir, config.userId));
  if (dir.includes(ubisoftId) && dir.includes(steamId)) {
    console.error(
      "savegame directories for both versions exist - set one in config.json"
    );
    return false;
  }
  if (dir.includes(ubisoftId)) {
    config.gameId = ubisoftId;
    console.log(`game id is not set - assuming ${ubisoftId} (UBISOFT VERSION)`);
    return true;
  }
  if (dir.includes(steamId)) {
    config.gameId = steamId;
    console.log(`game id is not set - assuming ${steamId} (STEAM VERSION)`);
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

const getDestinationDir = () => {
  const now = new Date();
  const month = `${(now.getMonth() + 1).toString().padStart(2, 0)}`;
  const date = `${now.getDate().toString().padStart(2, 0)}`;
  const hours = `${now.getHours().toString().padStart(2, 0)}`;
  const minutes = `${now.getMinutes().toString().padStart(2, 0)}`;
  const seconds = `${now.getSeconds().toString().padStart(2, 0)}`;
  const dateStr = `${now.getFullYear()}-${month}-${date}`;
  const timeStr = `${hours}-${minutes}-${seconds}`;
  return path.join(
    "backups",
    `${dateStr}T${timeStr}`,
    config.userId,
    config.gameId
  );
};

const copySaveGame = async () => {
  try {
    const sourceDir = path.join(config.sourceDir, config.userId, config.gameId);
    const destinationDir = getDestinationDir();
    await fs.cp(sourceDir, destinationDir, { recursive: true });
    console.log(
      `\nFILES SUCCESSFULLY COPIED\n  FROM: ${sourceDir}\n    TO: ${destinationDir}`
    );
  } catch (error) {
    console.error(error);
  }
};

initialize();
