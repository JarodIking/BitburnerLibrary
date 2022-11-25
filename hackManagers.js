/** @param {NS} ns */
export async function main(ns) {
    //target server information
    let homeServer = "home";
    let target = "iron-gym";
    let serverSecurity = ns.getServerSecurityLevel(target);
    let serverMinSecurity = ns.getServerMinSecurityLevel(target);
    let serverMaxMoney = ns.getServerMaxMoney(target);
    let serverMoney = ns.getServerMoneyAvailable(target);
    let serverMoneyThreshold = serverMaxMoney * 0.75;

    //print important information
    ns.tprint({
        serverMaxMoney,
        serverMoney,
        serverMoneyThreshold,
    });

    //all server info
    let servers = ns.scan(homeServer);

    //add home to list
    servers.push(homeServer);


    //script information
    let growScript = "grow.js";
    let hackScript = "hack.js";
    let weakenScript = "weaken.js";

    //copy scripts to designated servers
    for (const server of servers) {
        if (server == "darkweb") {
            break;
        }

        ns.nuke(server);
        ns.scp([weakenScript, growScript, hackScript], server, homeServer);
    }

    //hacking magic
    while (true) {

        //grow server
        if(Math.ceil(serverMoney) < serverMaxMoney) {
            for (const server of servers) {
                if(ns.fileExists(growScript, server)) {
                    ns.exec(growScript, server, calculateThreads(server, growScript), target);
                }
            }
        } else {
            for (const server of servers) {
                ns.kill(growScript, server, target);
            }
        }

        //weaken server
        if(Math.floor(serverSecurity) > serverMinSecurity) {
            for (const server of servers) {
                if(ns.fileExists(weakenScript, server)) {
                    ns.exec(weakenScript, server, calculateThreads(server, weakenScript), target);
                }
            }
        } else {
            for (const server of servers) {
                ns.kill(weakenScript, server, target);
            }
        }

        //hack server
        if(serverMoney > serverMoneyThreshold) {
            for (const server of servers) {
                if(ns.fileExists(hackScript, homeServer)) {
                    ns.exec(hackScript, server, calculateThreads(server, hackScript), target);
                }
            }
        } else {
            for (const server of servers) {
                ns.kill(hackScript, server, target);
            }
        }

        await ns.sleep(5);
    }


    function calculateThreads (server, script) {
        let threadCount = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / ns.getScriptRam(script));

        if(threadCount !== 0)
            return threadCount;
    }
}