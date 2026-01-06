/**
 * Config management for MeetGeek CLI
 * Stores API key in ~/.config/meetgeek/config.json
 */

import { homedir } from "os";
import { join } from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

const CONFIG_DIR = join(homedir(), ".config", "meetgeek");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export function getConfigPath() {
  return CONFIG_FILE;
}

export function loadConfig() {
  try {
    if (existsSync(CONFIG_FILE)) {
      return JSON.parse(readFileSync(CONFIG_FILE, "utf8"));
    }
  } catch (e) {
    // Ignore parse errors
  }
  return {};
}

export function saveConfig(config) {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getApiKey() {
  // Priority: env var > config file
  if (process.env.MEETGEEK_API_KEY) {
    return process.env.MEETGEEK_API_KEY;
  }
  const config = loadConfig();
  return config.apiKey;
}

export function setApiKey(key) {
  const config = loadConfig();
  config.apiKey = key;
  saveConfig(config);
}

export function clearApiKey() {
  const config = loadConfig();
  delete config.apiKey;
  saveConfig(config);
}
