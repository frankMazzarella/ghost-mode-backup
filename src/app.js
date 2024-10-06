import { cp } from "node:fs/promises";
import { basename } from "node:path";

const SOURCE_DIR =
  "C:\\Program Files (x86)\\Ubisoft\\Ubisoft Game Launcher\\savegames\\afd78794-7f97-479e-ae6d-ec41638fd15a";
const FIVE_MINUTES_MS = 5 * 60 * 1000;

const initialize = () => {
  // check if config.json exists
  // if not create with default data
  // prompt to fill in
  // check if game save location exists
  // prompt to fix data
};

const getDestinationDir = () => {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const hours = `${now.getHours().toString().padStart(2, 0)}`;
  const minutes = `${now.getMinutes().toString().padStart(2, 0)}`;
  const seconds = `${now.getSeconds().toString().padStart(2, 0)}`;
  const timeStr = `${hours}-${minutes}-${seconds}`;
  return `savegames\\${dateStr}T${timeStr}\\${basename(SOURCE_DIR)}`;
};

const copySaveGame = async () => {
  try {
    const destinationDir = getDestinationDir();
    await cp(SOURCE_DIR, destinationDir, { recursive: true });
    console.log(
      `FILES SUCCESSFULLY COPIED\n\tFROM: ${SOURCE_DIR}\n\t  TO: ${destinationDir}`
    );
  } catch (error) {
    console.error(error);
  }
};

initialize();
copySaveGame();
setInterval(copySaveGame, FIVE_MINUTES_MS);
