---
title: 'Использование issues в GitHub как движок комментариев'
excerpt: 'Хочу поделиться замечательной идеей: превращения GitHub issues в полноценный движок комментариев для статического блога. Достойная легковесная (и бесплатная!) замена disqus и аналогов.'
coverImage: '/assets/blog/issue-comments-github/cover.png'
date: '2020-05-04T14:15:07.322Z'
issueId: '2'
author:
  name: Roman A. Nosov
  picture: '/assets/blog/authors/romannosov.png'
ogImage:
  url: '/assets/blog/issue-comments-github/cover.png'
---

Хочу поделиться замечательной идеей: превращения **GitHub issues** в полноценный движок комментариев для статического блога. Достойная легковесная (и бесплатная!) замена *disqus* и аналогов.
Для начала, маленькая вводная, с чего всё начиналось:

Был скучный выходной день во время карантина и я лениво читал интернеты в поисках удобного движка комментариев для своего блога. Я уже был готов поддаться маркетингу disqus'a, но внезапно наткнулся на интересную статью:

(http://donw.io/post/github-comments/)

В ней автор анализирует трафик своего сайта и приходит к удручающему выводу: *disqus* настолько активно использует трекеры и прочие запросы на сервер, что в примере автора, увеличивал количество XHR-запросов с 16 до 105! Это совершенно неприемлемо. И в качестве альтернативы, рассказчик предлагает переход к ... GitHub Issues! 

В статье прелагается следующая схема:

1. На каждый пост в блоге открывается *issue в GitHub*
2. Все комментарии создаются непосредственно на сайте *GitHub*
3. При открытии страницы, клиентский JavaScript код получает все комментарии из issue через *issue API*

## Заводим свой ~~трактор~~ велосипед
![Возможно всё, но зачем?](/assets/blog/issue-comments-github/но_зачем.png)

И тут я подумал, что раз уж весь мой блог использует *GitHub Pages* в качестве хостинга, то почему бы не попробовать ещё больше интегрироваться в экосистему гитхаба?

### Предварительный алгоритм работы с комментариями (пока я не автоматизировал деплой):

1. Перед созданием поста, руками создаётся issue, оттуда копируется ID и вставляется в .md-темплейт поста.
2. В исходники страницы добавлен маленький скрипт, который подхватывает этот id страницы и по нему (через Github API получает все комментарии (отрендеренный markdown в html)
3. Рендер комментариев. 
4. Добавление кнопки "создать комментарий", который просто перебрасывает пользователя на страницу GitHub

### Реализация

Польскольку я храню все посты на этом сайте в markdown файлах, мне первым делом нужно запомнить, что при создании файла, в метаданных я теперь буду обязан указывать issue id.

```javascript
{
    title: 'Первый пост с использованием markdown и next js'
    excerpt: 'А заодно и проверка возможности писать на кириллице в этом шаблонизаторе. Если вы читаете этот текст, значит полет нормальный.'
    coverImage: '/assets/blog/hello-world/завтра_будет_лучше.jpg'
    date: '2020-05-03T21:00:07.322Z'
    issueId: '1' // <--- id созданного issue на GitHub
} 
```
В конец страницы с постом добавлен React-компонент Comments, который будет отображать комментарии из ГитХаба. 

```html
    <article>
        <Comments 
            githubUser="JustAddAcid"
            githubRepo="JustAddAcid.github.io"
            issueId={post.issueId} />
    </article>
```

Внутри компонента **Comments** делаем GET-запрос в https://api.github.com/repos/ ${githubUser}/ ${githubRepo}/issues/ ${issueId}/comments. Например, для коммментариев к этой странице, это будет:

(https://api.github.com/repos/ JustAddAcid/JustAddAcid.github.io/ issues/2/comments)

```javascript
componentDidMount() {
    if (!this.state.data) {
        const githubUser = this.props.githubUser
        const githubRepo = this.props.githubRepo
        const issueId = this.props.issueId

        const that = this;
        window.fetch(`https://api.github.com/repos/${githubUser}/${githubRepo}/issues/${issueId}/comments`, {
            headers: {
                Accept: 'application/vnd.github.v3.html+json'
            }
        })
            .then(response => response.json())
            .then(comments => that.setState({
                data: comments,
                isLoading: false
            }))
```

Ну и красиво рендерим JSON-array, который нам пришел из гитхаба

```javascript
    render(){
        // ....
        {hasData && (
            this.state.data.map(comment => (
                <Comment
                    key={comment.id}
                    avatarUrl={comment.user.avatar_url}
                    userProfileUrl={comment.user.html_url}
                    userLogin={comment.user.login}
                    commentDate={comment.created_at}
                    commentBody={comment.body_html} />
            ))
        )}
        <LinkButton text="Добавить комментарий" link={`https://github.com/${githubUser}/${githubRepo}/issues/${issueId}`} />
    }
```

После причесывания стилей -- получаем достаточно минималистичную и приятную на глаз систему комментариев с поддержкой markdown, цитирования и т.д., которой можно воспользоваться внизу страницы.

<iframe src="//coub.com/embed/8mnh8?muted=false&autostart=false&originalSize=false&startWithHD=false" allowfullscreen frameborder="0" width="640" height="360" allow="autoplay"></iframe>

Ещё увидимся.