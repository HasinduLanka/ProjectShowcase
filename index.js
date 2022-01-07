let child_process = require('child_process')
let projectjs = require('./projects.js')
let fs = require('fs')
let ejs = require('ejs');

const NPMBuild = false

Main().then(() => { })

async function Main() {


    console.log('Bitdev showcase!')

    await Exec(`rm -rf ./build`)

    await Exec(`rm -rf ./repos`)
    await Exec(`mkdir -p ./repos`)

    await Exec(`cp -r ./public/ ./build/`)

    let repoBuilds = []
    let authors = []

    projectjs.projects.forEach(proj => {

        try {
            repoBuilds.push(buildRepo())
        } catch (error) {
            console.log(error)

        }


        async function buildRepo() {

            console.log(`Building "${proj.repo}"`)

            await Exec(`mkdir -p "./repos/${proj.repo}"`)
            await Exec(`mkdir -p "./build/${proj.author}/"`)

            await Exec(`cd "./repos/${proj.repo}/.." && git clone --depth 1 --single-branch https://${proj.repo}`)

            let packages = JSON.parse(fs.readFileSync(`./repos/${proj.repo}/package.json`))
            packages["homepage"] = `/${proj.author}/${proj.name}/`
            fs.writeFileSync(`./repos/${proj.repo}/package.json`, JSON.stringify(packages, null, 2))


            if (NPMBuild) {
                await Exec(`cd "./repos/${proj.repo}/" && npm install && npm run build`)

                await Exec(`mv "./repos/${proj.repo}/build/" "./build/${proj.author}/${proj.name}/"`)
            }

            //check if proj.author exist in authors array
            let authorExist = authors.find(author => author.name == proj.author)
            if (!authorExist) {
                authors.push({
                    name: proj.author,
                    projects: [{ name: proj.name, description: proj.description, repo: proj.repo }]
                })
            } else {
                authors.find(author => author.name == proj.author).projects.push({
                    name: proj.name, description: proj.description, repo: proj.repo
                })
            }

        }
    });

    await Promise.all(repoBuilds)


    let authors_unique = [...new Set(authors)]

    let authors_unique_sorted = authors_unique.sort()

    authors_unique_sorted.forEach(author => {
        ejs.renderFile("author.ejs", { "author": author }, (err, str) => {
            fs.writeFileSync(`./build/${author.name}/index.html`, str)
        })
    });

}



// Excecute shell commands
function Exec(file) {
    var exec = child_process.exec;

    return new Promise((resolve, reject) => {
        console.log("Executing: " + file)
        exec(file, function execcallback(error, stdout, stderr) {
            if (stdout) console.log(file + ': ' + stdout);
            if (stderr) console.log(file + ': Erro : ' + stderr);
            if (error) console.error(error);

            resolve();
        });
    });

}