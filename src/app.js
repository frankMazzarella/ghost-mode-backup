import { cp } from 'node:fs/promises'
import { basename } from 'node:path';

const sourceDir = "c:/Program Files (x86)/Ubisoft/Ubisoft Game Launcher/savegames/afd78794-7f97-479e-ae6d-ec41638fd15a";
const backupDir = "c:/Users/Frank Mazzarella/Desktop/ghost-mode-backups";

const getDestinationDir = () => {
  const now = new Date();
  return `${backupDir}/${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}T${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}/${basename(sourceDir)}`
}

try {
  await cp(sourceDir, getDestinationDir(), { recursive: true });
} catch (error) {
  console.error(error);
}
