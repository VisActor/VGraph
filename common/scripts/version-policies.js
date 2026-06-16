const fs = require("fs");
const path = require("path");
const parseVersion = require("./parse-version");
const setJsonFileByKey = require("./set-json-file");

const PRERELEASE = "prerelease";
const MINOR = "minor";
const MAJOR = "major";
const PATCH = "patch";
const NEXT_BUMPS = [PRERELEASE, PATCH, MINOR, MAJOR];

function parseNextBumpFromVersion(versionString) {
  const res = parseVersion(versionString);

  if (res) {
    if (res.patch === 0) {
      return res.minor === 0 ? MAJOR : MINOR;
    }
    return PATCH;
  }

  console.error(`Cannot parse nextBump from version: ${versionString}`);
  process.exit(1);
}

function writeNextBump(nextBump) {
  const filePath = path.join(__dirname, "../config/rush/version-policies.json");
  let fileContent = fs.readFileSync(filePath).toString();
  const json = JSON.parse(fileContent);
  const curNextBump = json[0].nextBump;

  if (nextBump !== curNextBump) {
    fileContent = setJsonFileByKey(fileContent, json, ["0", "nextBump"], nextBump);
    fs.writeFileSync(filePath, fileContent);
  }
}

function readNextBumpFromChanges() {
  const changeRoot = path.join(__dirname, "../changes/@visactor/vgraph");
  const filenames = fs.existsSync(changeRoot)
    ? fs.readdirSync(changeRoot).filter(fileName => fileName.endsWith(".json"))
    : [];

  if (!filenames.length) {
    return PATCH;
  }

  const changeTypes = [];
  filenames.forEach(fileName => {
    const json = JSON.parse(fs.readFileSync(path.join(changeRoot, fileName)).toString());
    if (json.changes && json.changes.length) {
      json.changes.forEach(change => {
        if (change.type && !changeTypes.includes(change.type)) {
          changeTypes.push(change.type);
        }
      });
    }
  });

  return changeTypes.includes(MAJOR) ? MAJOR : changeTypes.includes(MINOR) ? MINOR : PATCH;
}

function checkAndUpdateNextBump(version) {
  let nextBump = PATCH;

  if (version && NEXT_BUMPS.includes(version)) {
    nextBump = version;
  } else if (version) {
    nextBump = parseNextBumpFromVersion(version);
  } else {
    nextBump = readNextBumpFromChanges();
  }

  writeNextBump(nextBump);
  return nextBump;
}

module.exports = checkAndUpdateNextBump;
