import fs from 'fs'
import fetch from 'node-fetch'
import btoa from 'btoa'

const
    githubUser = process.env.CIRCLE_USERNAME,
    targetRepo = process.env.TARGET_REPO_NAME,
    postPrefix = 'https://nosoff.info/posts/',
    issueNotCreatedYet = '%%ISSUE_ID%%',
    notCreatedRegExp = new RegExp(issueNotCreatedYet, 'g'),
    postsDir = './_posts',
    password = process.env.GITHUB_PASS

const basicAuthHeader = (username, password) => "Basic " + btoa(username + ":" + password)

const createIssue = async name => {
    const url = `https://api.github.com/repos/${githubUser}/${targetRepo}/issues`
    const response = await fetch(url, {
        method: 'post',
        body: JSON.stringify({
            title: 'Comments: ' + name,
            body: postPrefix + name
        }),
        headers: {
            'Accept' : 'application/vnd.github.v3.html+json',
            'Content-Type': 'application/json',
            'Authorization': basicAuthHeader(githubUser, password) 
        }
    })
    const createdIssue = await response.json();
    return createdIssue.number.toString();
}

const main = async () => {

    const filesInDir = fs.readdirSync(postsDir)
    
    for (const fileName of filesInDir){
        const filePath = postsDir + '/' + fileName,
              fileText = fs.readFileSync(filePath).toString(),
              nameWithoutExtension = fileName.split('.')[0]
    
        if (fileText.includes(issueNotCreatedYet)){
            const issueId = await createIssue(nameWithoutExtension),
                  newText = fileText.replace(notCreatedRegExp, issueId)
            fs.writeFileSync(filePath, newText);
        }
    
    }
}

main();
