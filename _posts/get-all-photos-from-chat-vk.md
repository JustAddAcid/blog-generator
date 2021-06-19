---
title: 'Сбор и автоматическая фильтрация вложений диалога VK'
titleEnabled: true
excerpt: 'История о том, как я через VK-API вытягивал изображения из вложений, а затем отделял фотографии от мемов'
coverImage: '/assets/blog/get-all-photos-from-chat-vk/background.jpg'
date: '2021-06-19T12:05:26.774Z'
issueId: '22'
author:
  name: Roman A. Nosov
  picture: 'https://avatars3.githubusercontent.com/u/21103635?s=120&v=4'
  url: 'https://github.com/JustAddAcid'
ogImage:
  url: '/assets/blog/get-all-photos-from-chat-vk/background.jpg'
---

Удаляться из соцсетей всегда немного жалко. Особенно, когда годами использовал некоторые чаты просто как хостинг фотографий. Так что, мною было принято ответственное решение выкачать все *несколько-гигабайт* изображений из таких чатов и, естественно, удалить из них мусорные мемы *(хотя есть смысл их хранить где-то отдельно)*

Т.е. на сегодняшний вечер у нас две подзадачи:

1. Выкачать контент
2. Разложить контент на две директории: мемы и фото

## Викачуємо 

Поиск готовых расширений для браузера/софтин для выкачивания содержимого чатов завершился неудачно. Что ж, придется дёргать целый один(!) метод из VK API, кокой ужос. 

Для моих целей нужен метод [messages.getHistoryAttachments](https://vk.com/dev/messages.getHistoryAttachments). А дёргать я его буду из обертки под node.js -- [easyvk](https://github.com/ciricc/easyvk), ибо незачем изобретать велосипеды. Скачивать буду пачками по 50 штук. Несмотря на то, что документация утверждает об умении выгружать вплоть до 200 штук на запрос, но на практике, на запросы больше 50 иногда не хотят отвечать.

Логинимся, получаем объект vk, через который будем стучаться в API:

```JavaScript
easyvk({
  username: login,
  password: password,
  sessionFile: path.join(__dirname, '.my-session')
}).then(async vk => { /* {...} */ });
```

Дальше остаётся лишь пробежаться циклом по всем вложениям, постоянно сохраняя id сообщения, на котором остановились:

```JavaScript
const vkr = await vk.call('messages.getHistoryAttachments', {
  peer_id: peerId,
  media_type: 'photo',
  count: 50,
  start_from: from
});

const downloads = vkr.items.map((item, index) => {
  return download(item.attachment.photo.sizes.pop().url, './attachments/', { 
    filename: + item.attachment.photo.date + index + '.jpg' 
  })
});

await Promise.allSettled(downloads);

from = vkr.items.pop().message_id;
```

Элементарно. Осталось удалить дубликаты: т.к. если кто-то "отвечал" на сообщения с фотографией, она может продублироваться у нас в файлах. Мы можем сравнить фото по их md5 хешу, и удалить, если у каких-то картинок эти хеши совпадают.

```bash
find . -type f \
    | xargs md5sum \
    | sort -k1,1 \
    | uniq -Dw32 \
    | while read hash file; do 
        [ "${prev_hash}" == "${hash}" ] && rm -v "${file}"
        prev_hash="${hash}"; 
    done
```

## Сортируем изображения

Поначалу я думал, что на эту задачу я потрачу гораздо больше времени и сил. Но как оказалось, вся инфраструктура для этого уже давно изобретена и отработана. Достаточно лишь вызвать готовые инструменты. 

Отделять котлеты от мух будем по признаку наличия текста: 
* Если на картинке есть текст длиннее 10 символов, то считаем её мемом
* Иначе считаем фотографией 

Для распознавания текста мне понадобится питон, OCR-движок [tesseract](https://github.com/UB-Mannheim/tesseract/wiki), и следующие пакеты, которые можно установить через pip'у.

```bash
pip install opencv-python
pip install pytesseract
```

Ну и простейший скрипт, который дёргает api распознавания, удаляет лишние whitespace'ы и проверяет длину строки. 

```python
import cv2
import pytesseract
import re
import os

inputDir = '...'
withoutTextDir = '...'
withTextDir = '...'

inputFilenames = os.listdir(inputDir)

for filename in inputFilenames:
    img = cv2.imread(inputDir + '/' + filename)
    text = pytesseract.image_to_string(img, lang='rus')
    text = re.sub('\s+', ' ', text)

    if len(text) > 10:
        # Перекладываем в папку, где хранятся картинки с текстом
        os.rename(inputDir + '/' + filename, withTextDir + '/' + filename)
    else:
        # Перекладываем в папку, где хранятся картинки без текста
        os.rename(inputDir + '/' + filename, withoutTextDir + '/' + filename)
    print('\n\n', filename, '\n', text)
```

Собственно, на этом всё. Есть, конечно небольшие погрешности в работе. Но они решаются беглым просмотром превью картинок. Фотографии выгружены, можно удаляться из вконтакта. 

[Скрипт скачивания вложений из диалога](https://gist.github.com/JustAddAcid/79c3a5264880d77d7e069a34f0b33934)
[Сортировка картинок по наличию текста](https://gist.github.com/JustAddAcid/e24ac023f841bb5f93b85085d380a3ac)