import fs from 'fs'
import fetch from 'node-fetch'

const
    githubUser = process.env.CIRCLE_USERNAME,
    targetRepo = process.env.TARGET_REPO_NAME,
    postPrefix = 'https://nosoff.info/posts/',
    issueNotCreatedYet = '%%ISSUE_ID%%',
    currentDateMask = '%%CURRENT_DATE%%',
    postNameMask = '%%POST_NAME%%',
    notCreatedRegExp = new RegExp(issueNotCreatedYet, 'g'),
    currentDateMaskRegExp = new RegExp(currentDateMask, 'g'),
    postNameRegExp = new RegExp(postNameMask, 'g'),
    postsDir = './_posts',
    githubToken = process.env.GITHUB_TOKEN;

const tokenAuthHeader = () => "token " + githubToken;

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
            'Authorization': tokenAuthHeader()
        }
    })
    const createdIssue = await response.json();
    return createdIssue.number.toString();
}

const main = async () => {

    const filesInDir = fs.readdirSync(postsDir).filter(path => /.*\.md/.test(path))
    
    for (const fileName of filesInDir){
        const filePath = postsDir + '/' + fileName,
              fileText = fs.readFileSync(filePath).toString(),
              nameWithoutExtension = fileName.split('.')[0]
    
        if (fileText.includes(issueNotCreatedYet)){
            const issueId = await createIssue(nameWithoutExtension),
                  newText = fileText
                    .replace(notCreatedRegExp, issueId)
                    .replace(currentDateMaskRegExp, new Date().toJSON())
                    .replace(postNameRegExp, nameWithoutExtension);

            fs.writeFileSync(filePath, newText);
        }
    
    }
}

main();
