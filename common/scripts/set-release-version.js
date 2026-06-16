const fs = require("fs");
const path = require("path");
const getPackageJson = require("./get-package-json");
const parseVersion = require("./parse-version");
const setJsonFileByKey = require("./set-json-file");

function setReleaseVersion(nextBump, preReleaseName, nextVersionStr, buildName) {
  const rushJson = getPackageJson(path.join(__dirname, "../../rush.json"));
  const projects = rushJson.projects;
  const mainPackage = projects.find(project => project.packageName === "@visactor/vgraph");

  if (!mainPackage) {
    return;
  }

  const mainPkgJsonPath = path.join(__dirname, "../../", mainPackage.projectFolder, "package.json");
  const mainPkgJson = getPackageJson(mainPkgJsonPath);
  const versionPolicies = getPackageJson(path.join(__dirname, "../config/rush/version-policies.json"));
  const versionPolicy = Array.isArray(versionPolicies)
    ? versionPolicies.find(policy => policy.policyName === mainPackage.versionPolicyName)
    : null;
  const versionBaseline = (versionPolicy && versionPolicy.version) || mainPkgJson.version;
  const curVersion = parseVersion(versionBaseline);

  if (!curVersion) {
    return;
  }

  if (versionPolicy && versionPolicy.version && versionPolicy.version !== mainPkgJson.version) {
    console.warn(
      `main package version (${mainPkgJson.version}) is different from version policy (${versionPolicy.version}), use version policy as release baseline`
    );
  }

  if (!nextVersionStr && !curVersion.preReleaseName) {
    if (nextBump === "major") {
      curVersion.major += 1;
      curVersion.minor = 0;
      curVersion.patch = 0;
    } else if (nextBump === "minor") {
      curVersion.minor += 1;
      curVersion.patch = 0;
    } else {
      curVersion.patch += 1;
    }
  }

  let nextVersion = nextVersionStr || `${curVersion.major}.${curVersion.minor}.${curVersion.patch}`;
  if (preReleaseName && preReleaseName !== "none") {
    nextVersion = `${nextVersion}-${preReleaseName}`;
  }
  if (buildName) {
    nextVersion = `${nextVersion}+${buildName}`;
  }

  const published = projects.filter(project => project.shouldPublish).map(project => project.packageName);

  console.log(`next version is ${nextVersion}`);

  projects.forEach(project => {
    const pkgJsonPath = path.join(__dirname, "../../", project.projectFolder, "package.json");
    if (!fs.existsSync(pkgJsonPath)) {
      console.log(`skip missing project package.json: ${project.projectFolder}`);
      return;
    }

    let jsonFile = fs.readFileSync(pkgJsonPath, { encoding: "utf-8" });
    const pkgJson = JSON.parse(jsonFile);

    if (project.shouldPublish) {
      console.log(`handle project: ${project.packageName}, from ${pkgJson.version} to ${nextVersion}`);
      jsonFile = setJsonFileByKey(jsonFile, pkgJson, ["version"], nextVersion);
    } else {
      console.log(`handle project: ${project.packageName}, update local package ranges`);
    }

    ["dependencies", "devDependencies"].forEach(depField => {
      if (!pkgJson[depField]) {
        return;
      }

      Object.keys(pkgJson[depField]).forEach(dep => {
        if (published.includes(dep)) {
          jsonFile = setJsonFileByKey(jsonFile, pkgJson, [depField, dep], `workspace:${nextVersion}`);
        }
      });
    });

    if (pkgJson.peerDependencies) {
      Object.keys(pkgJson.peerDependencies).forEach(dep => {
        if (published.includes(dep)) {
          jsonFile = setJsonFileByKey(jsonFile, pkgJson, ["peerDependencies", dep], `^${nextVersion}`);
        }
      });
    }

    fs.writeFileSync(pkgJsonPath, jsonFile);
  });
}

module.exports = setReleaseVersion;
