var updateEnv = []
var envs = {

    PORT: parseInt(process.env.PORT),

    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_CLUSTER: process.env.DB_CLUSTER,
    DB_DATABASE: process.env.DB_DATABASE,

}

trimmer(envs)

if (updateEnv.length > 0) {
    console.error(`##################### update the below env variable ##################`);
    console.error(updateEnv)
    console.error(`##################### update the above env variable ##################`);
    process.exit(1)
}

module.exports = envs;

function trimmer(obj) {
    Object.keys(obj).forEach(item => {
        if (typeof (obj[item]) == 'object') {
            trimmer(obj[item])
        } else if (typeof (obj[item]) == 'string') {
            obj[item] = obj[item].trim()
        }
        if ((obj[item] == undefined) || (obj[item] == null) || (!obj[item])) {
            updateEnv.push(item)
        }
    })
}