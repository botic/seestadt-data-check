#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const axios = require("axios");
axios.defaults.timeout = 5500;

async function isDeadUrl(siteUrl) {
    try {
        const {status, headers} = await axios.get(siteUrl);

        if (status === 301 || status === 303) {
            console.log(`${status} ==> ${siteUrl} moved to ${headers.location}`);
            return false;
        }

        return status !== 200;
    } catch (e) {
        return true;
    }
}

async function supportsHTTPS(siteUrl) {
    if (siteUrl.indexOf("http://") !== 0) {
        throw new Error(`Invalid URL scheme: ${siteUrl}`);
    }

    try {
        const httpResponse  = await axios.get(siteUrl);
        const httpsResponse = await axios.get("https://" + siteUrl.substr(7));

        return httpResponse.status === 200 && httpsResponse.status === 200;
    } catch (e) {
        return false;
    }
}

function checkEntry(entry) {
    /*
    try {
        if (!entry.hasOwnProperty("web")) {
            console.log(`Website missing for ${entry.name}`);
            return;
        } else if (await isDeadUrl(entry.web)) {
            console.log(`Dead link to ${entry.name} for ${entry.web}`);
        } else if (entry.web.indexOf("https://") !== 0 && await supportsHTTPS(entry.web)) {
            console.log(`${entry.name}\n${entry.web}\n`);
        }
    } catch (e) {
        console.log(e);
    }
    */

    if (entry.name.length > 20 && !entry.hasOwnProperty("label") && !entry.hasOwnProperty("shortlabel")) {
        console.log(`Overlong name without label: ${entry.name}`);
    }
}

function main(dir) {
    const files = fs.readdirSync(dir).filter(name => name.endsWith(".json"));

    for (let file of files) {
        let filePath = path.join(dir, file);
        fs.readFile(filePath, (err, data) => {
            if (err) throw err;

            const rawEntries = JSON.parse(data);
            for (let key of Object.keys(rawEntries)) {
                checkEntry(rawEntries[key]);
            }
        })
    }
}

const program = require("commander");

program
    .version("1.0.0", "-v, --version")
    .option("-d, --dir [dir]", "Data directory containing the raw JSON files")
    .parse(process.argv);

if (program.dir) {
    main(program.dir);
} else {
    program.outputHelp();
}

