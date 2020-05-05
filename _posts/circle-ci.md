---
title: 'Автоматизируем деплой статического сайта с помощью CircleCI'
excerpt: 'С хостингом и комментариями немного разобрались. Теперь заставим нашу шайтан-машину пересобирать сайт, если в .md шаблонах произошли какие-то изменения'
coverImage: '/assets/blog/circleci/cover.png'
date: '2020-05-05T16:12:07.322Z'
issueId: '7'
author:
  name: Roman A. Nosov
  picture: '/assets/blog/authors/romannosov.png'
ogImage:
  url: '/assets/blog/circleci/cover.png'
---

С хостингом и комментариями немного разобрались. Теперь заставим нашу шайтан-машину автоматически пересобирать сайт, если в .md шаблонах произошли какие-то изменения. Потому что нет никакого желания **каждый раз** после минимального изменения статьи делать руками билд, перетаскивать собранные *html* страницы в другой репозиторий и коммитить. Естественно, это можно и нужно оптимизировать. В качестве подопытного кролика сегодня выступает сервис *CircleCi*, у которого достаточно удобный бесплатный тариф, которого нам будет более чем достаточно.

**Для тех, кто в танке и никогда об этом не слышал:** *CircleCi* -- это облачный сервис для continuous integration. Умеет следить за изменениями в Git-репозиториях и пересобирать билды приложений, прогонять тесты и т.д. Тестить в статическом блоге толком нечего, а вот функция собирать билды нам как раз пригодится.

**Для бородатых админов:** я не большой спец в CI, так что, если код будет не совсем согласован с общепринятыми Best-Practice, то прошу меня извинить и прошу написать в комментариях о том, как это сделать лучше и безопасней.

## Автоматизировали, автоматизировали, да не выавтоматизировали
![If you never deploy, your deploy never fals](/assets/blog/circleci/meme.png)

Итак, поехали. Для начала, нужно определиться, что за нас должна делать шайтан-машина. 
Предварительный алгоритм:

1. Скрипт проверяет все .md файлы с постами на предмет того, созданна ли для него issue на GitHub (для реализации комментариев, [о которых здесь](/posts/issue-comments-github))
2. Если к .md файлу не привязана issue, то создать, и записать в файл issue id. Сделать коммит и пуш
3. Сделать билд в статический html
4. Положить файлы билда в репозиторий с github pages (JustAddAcid.github.io). Сделать коммит и пуш

## Реализация -- скрипт проверки и привязки issue
В package.json объявим скрипт issues, который запускает файл issues.mjs из корня. 

```json
  "scripts": {
    "dev": "next",
    "build": "next build",
    "start": "next start",
    "export": "next export",
    "issues": "node issues.mjs" //  <--- 
  }
```
В issues.mjs следующая логика: во всех файлах с постами скрипт ищет подстроку %%ISSUЕ_ID%%. И если находит, то создаёт новое GitHub Issue, а его ID подставляет вместо %%ISSUЕ_ID%%.
```javascript
const issueNotCreatedYet = '%%ISSUЕ_ID%%',
      notCreatedRegExp = new RegExp(issueNotCreatedYet, 'g')

//...

const main = async () => {

    const filesInDir = fs.readdirSync(postsDir) // получаем имена файлов в директории
    
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
```
А функция, createIssue представляет собой post-запрос в github api
```javascript
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
```
Теперь мне нужно запомнить, что всегда, когда я хочу, чтобы система автоматически создала issue, нужно вместо ID созданной руками issue писать директиву %%ISSUЕ_ID%%
```javascript
{
    excerpt: 'С хостингом и комментариями немного разобрались. Теперь заставим нашу шайтан-машину пересобирать сайт, если в .md шаблонах произошли какие-то изменения'
    coverImage: '/assets/blog/circleci/cover.png'
    date: '2020-05-05T16:12:07.322Z'
    ssueId: '%%ISSUЕ_ID%%'
}
```


## Реализация -- конфиг CircleCi
Конфиг *CircleCi* представляет собой **config.yml** файл в директории **.circleci** в корне вашего репозитория. Сам конфиг-файл содержит описания шагов, которые должен сделать сервер, чтобы задеплоить ваше приложение и/или запустить тесты. 

Но для начала нужно примерно представить, какие действия (shell-команды) нам всё-таки нужно проделать. У меня получилось как-то так:

```sh
# Представляемся гиту
git config --global user.email $GH_EMAIL
git config --global user.name $CIRCLE_USERNAME

# Запускаем скрипт проверки issues
npm run issues
if [[ `git status --porcelain` ]]; then
  # Если мы изменили какие-то файлы -- делаем коммит. 
  # А деплой будем делать в следующем таске, которые запустится при коммите
  git add -A
  git commit -m "Automated issues creation: ${CIRCLE_SHA1}"
  git push
  echo "Pushed changes in current repo. Deploy in next task"
  circleci-agent step halt
fi

npm run build

# Клонируем репозиторий сайта во временную папку и удаляем лишние директории
git clone $TARGET_REPO_URL targetDirectory
cd ./targetDirectory/
rm -rf ./_next
rm -rf ./assets
rm -rf ./favicon
rm -rf ./posts
echo "deleting folders from $PWD"
cd ..
# Инициируем экспорт проекта в статические html
npm run export
# Перекладываем html в наш репозиторий с сайтом
/bin/cp ./out/* ./targetDirectory/ -R -f
cd ./targetDirectory/
echo "commit in dir $PWD into $TARGET_REPO_URL repo"
git add -A
git commit -m "Automated deployment to GitHub Pages: ${CIRCLE_SHA1}" --allow-empty
git push
```

Осталось натянуть этот скрипт на конфиг **CircleCi**:
Создаём в репозитории директорию **.circleci**, в ней файл **config.yml** с примерно следующим содержанием:
```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: circleci/node:latest
    steps:
      - checkout
      - restore_cache:
          keys:
            - v1-dependencies-
            - v1-dependencies-
      - run:
          name: Install dependencies
          command: npm install
      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-
      - deploy:
          name: Deploy
          command: |
            git config --global user.email $GH_EMAIL
            git config --global user.name $CIRCLE_USERNAME

            # .... тот shell-скрипт, который представлен выше
```
Осталось, зайти на сайт circleci, залогиниться своим аккаунтом GitHub, привязать репози

Остались мелочи:

1. Зайти на сайт CircleCi, залогинившись своим аккаунтом GitHub
2. Во вкладке projects выбрать нужный репозиторий
3. Передать все используемые в скриптах переменные окружения
4. Создать user-key (для возможности коммита в репозиторий)


В итоге, при каждом коммите в репозиторий будет просыпаться скрипт в CircleCi и пересобирать статический блог.

Ещё увидимся.