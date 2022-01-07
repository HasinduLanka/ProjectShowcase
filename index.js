console.log('Bitdev showcase!');

Exec(`rm -rf ./build`)
Exec(`mkdir -p ./build`)


// Excecute shell commands
function Exec(command) {
    return require('child_process').execSync(command).toString().trim();
}