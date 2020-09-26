---
title: 'Подключаем сторонние шрифты с иконками к SAPUI5-приложению'
titleEnabled: false
excerpt: 'Разберем процесс на примере шрифта от fontawesome'
coverImage: '/assets/blog/sapui5-connect-icons-font/background.jpg'
date: '2020-09-26T17:08:30.259Z'
issueId: '17'
author:
  name: Roman A. Nosov
  picture: 'https://avatars3.githubusercontent.com/u/21103635?s=120&v=4'
  url: 'https://github.com/JustAddAcid'
ogImage:
  url: '/assets/blog/sapui5-connect-icons-font/background.jpg'
---

Привет, мои маленькие любители лёгкого *БДСМ*. В эфире передача "веселые истории с *SAPUI5*". И сегодня мы рассмотрим, какие шаги нужно проделать, чтобы подключить шрифт с нужными нам иконками, и использовать их при построении интерфейса. Тому що список стандартных иконок очень куцый, и иногда нужно добавить что-нибудь со стороны.

Как и всегда это бывает в айтишечке, мы можем решить эту задачу целыми *двумя* способами:

**Первый** — найти нормальную работу, и не маяться ерундой.

![Нормальная работа](/assets/blog/sapui5-connect-icons-font/work_meme.jpg)

**Второй** (сложнее, но не сильно) — описан ниже.

## Немного теории

На [официальном демо-примере](https://sapui5.hana.ondemand.com/#/entity/sap.ui.core.Icon/sample/sap.ui.core.sample.Icon) можем посмотреть как работают нативные иконки в этом фреймворке. 

С точки зрения кода, иконки представлены классом sap.ui.core.**Icon**, остальные элементы экрана, в которых есть иконки, либо расширяют этот класс, либо содержат его внутри себя. Его конструктор принимает следующие основные аргументы:

```xml
<core:Icon
  src="sap-icon://syringe" путь до иконки с протоколом sap-icon
  color="#031E48" > цвет
</core:Icon>
```

И всё это чудо преобразовывается в следующую конструкцию при запуске:

```html
<span 
  role="presentation" 
  aria-hidden="true" 
  aria-label="syringe" 
  data-sap-ui-icon-content="" 
  class="sapUiIcon sapUiIconMirrorInRTL" 
  style="font-family: 'SAP\2dicons'; color: #031E48;">
  ::before
</span>
```

*SPAN*, в котором в аттрибуте style явно объявлен нативный шрифт с иконками, и цвет, заданный в XML-конструкторе. Сам символ иконки лежит в аттрибуте *data-sap-ui-icon-content*, который с помощью *css* подставляется внутрь псеводэлемента *::before*:

```css
.sapUiIcon::before{
  content: attr(data-sap-ui-icon-content);
  speak: none;
  font-weight: normal;
}
```

Зачем я это написал? Не понятно, т.к. в этой информации нет ничего полезного. 

![Для общего развития](/assets/blog/sapui5-connect-icons-font/для%20общего%20развития.jpg)

Первым делом делаем что? Праавильно! [Лезем в доку](https://help.sap.com/saphelp_uiaddon10/helpdata/en/21/ea0ea94614480d9a910b2e93431291/content.htm?no_cache=true), где индусским по белому написано, что для использования кастомных шрифтов иконок нужно сделать несколько очень простых телодвижений:

1. Объявить *font-face* с нашими шрифтами в *css*
2. **Каждую** иконку, которую мы хотим использовать, нужно объявить с помощью метода sap.ui.core.IconPool.**addIcon**(iconName, collectionName, fontFamily, content)
3. Ссылаться в на объявленные иконки во всех местах, где очень чешется по следующему принципу: **sap-icon**://\[**collection-name**\]/\[**icon-name**\]

На этом можно было заканчивать, но давайте пример.

## Пример

Для начала нам нужен какой-нибудь шрифт с иконками. Можно запаковать любые свои векторные изображения в шрифт, если очень хочется. Благо, для этого существует бесконечное количество утилит. Гуглите. 

Я для примера буду пользовать готовую сборку иконок от [fontawesome](https://fontawesome.com). Залезаем, качаем архив с исходниками. В бесплатной версии нам доступны только шрифты: **brands**, **regular**, **solid**.

В директории */webfonts* собраны эти три шрифта в разных форматах. (Чтобы покрыть все популярные браузеры) -> Копируем эту директорию в корень нашего проекта. 

Далее, идем по официальной инструкции:

Чтобы объявить шрифты из *fontawesome* нужно с каждым из его шрифтов провернуть следующее:

1. **Лезем в css проекта**.
   1. Если нет .css файлов — создаём и объявляем его в manifest.json.
      Путь объявления в манифесте:
      ```JavaScript
      {
        "sap.ui5": {
          "resources": {
            "css": [
              {
                "uri": "css/yourfilename.css"
              }
            ]
          }
        }
      }
      ```
   2. **Смотрим в файл** fontawesome/%fontname%.css
   3. **Копируем блок** **@font-face**, в *css* проекта. Который будет примерно следующим:
    ```css
    @font-face {
      font-family: 'Font Awesome 5 Free';
      font-style: normal;
      font-weight: 900;
      font-display: block;
      src: url("../webfonts/fa-solid-900.eot");
      src: url("../webfonts/fa-solid-900.eot?#iefix") format("embedded-opentype"), url("../webfonts/fa-solid-900.woff2") format("woff2"), url("../webfonts/fa-solid-900.woff") format("woff"), url("../webfonts/fa-solid-900.ttf") format("truetype"), url("../webfonts/fa-solid-900.svg#fontawesome") format("svg"); }
    ```
   4. Где-нибудь в коде (например, при инициализации Component.js, и *желательно* в отдельном файле) добавляем нужные нам иконки в пул:
   ```JavaScript
    sap.ui.core.IconPool.addIcon("angry", "fa", "Font Awesome 5 Free", "f556");
    sap.ui.core.IconPool.addIcon("gem", "fa", "Font Awesome 5 Free", "f3a5");
    //...
   ```
   (Названия иконок и их символьные коды можно [подсмотреть на сайте](https://fontawesome.com/icons/gem?style=regular).)
     
     5. Использовать иконки при декларации каких-нибудь элементов экрана:
   ```xml
    <Button text="Очень красивая кнопка"
        icon="sap-icon://fa/gem" />
   ```

![Очень красивая кнопка](/assets/blog/sapui5-connect-icons-font/beautiful_button.jpg)

Кстати, названия всех иконок и их кодов удобно лежат в файле **/scss/_variables.scss**. И они вполне пригодны для автоматической обработки. Ну а шо, а вдруг.

<iframe width="100%" height="315" src="https://www.youtube-nocookie.com/embed/TeXk3RFy1rc" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

```scss
// помимо других переменных, там содержатся $fa-var.* : code
$fa-var-angry: \f556;
$fa-var-angrycreative: \f36e;
$fa-var-angular: \f420;
$fa-var-ankh: \f644;
$fa-var-app-store: \f36f;
//.......
```

Например, можно автоматически собрать все команды добавления в пул. (Только очень сомневаюсь, что такая огромная портянка будет действительно задействована в проекте. Так что, целиком все иконки лучше не запихивать)

```bash
grep -o fa-var.* ./_variables.scss \
 | tr --delete \;\\ | awk -F': ' \
  '{print "sap.ui.core.IconPool.addIcon(\""$1"\",\"fa\",\"Font Awesome 5 Free\", \""$2"\");"}' \
  >> iconDefinition.js
```

Получим на выходе вот это:

```JavaScript
sap.ui.core.IconPool.addIcon("fa-var-address-card","fa","Font Awesome 5 Free", "f2bb");
sap.ui.core.IconPool.addIcon("fa-var-adjust","fa","Font Awesome 5 Free", "f042");
sap.ui.core.IconPool.addIcon("fa-var-adn","fa","Font Awesome 5 Free", "f170");
sap.ui.core.IconPool.addIcon("fa-var-adobe","fa","Font Awesome 5 Free", "f778");
//...
```

Целый лонгрид о подключении шрифта... Ух.

![Деградация](/assets/blog/sapui5-connect-icons-font/деградация.jpg)

На этом всё. Работает. 

P.S. При тестировании внутри **SAP WEB IDE** на **Internet Explorer** могут наблюдаться фантомные проблемы с отображением иконок. Но после деплоя — всё работает.