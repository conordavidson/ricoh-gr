### Endpoints

##### `PING`

`GET http://192.168.0.1/v1/ping/`  
200 means is connected via wifi

##### `PROPS`

`GET http://192.168.0.1/v1/props/`  
Device data

#### `OBJS`

`GET http://192.168.0.1/_gr/objs`  
Image index

Example payload:

```js
{
  "errCode": 200,
  "errMsg": "OK",
  "dirs": [
    {
      "name": "124_0612",
      "files": [
        {
          "n": "00010028.JPG",
          "o": 0,
          "s": "",
          "d": "2019-06-12T17:20:48"
        },
        {
          "n": "00010029.DNG",
          "o": 0,
          "s": "",
          "d": "2019-06-12T17:22:14"
        },
        {
          "n": "00010030.DNG",
          "o": 0,
          "s": "",
          "d": "2019-06-12T17:22:20"
        },
        {
          "n": "00010031.DNG",
          "o": 0,
          "s": "",
          "d": "2019-06-12T17:22:22"
        },
        {
          "n": "00010032.DNG",
          "o": 0,
          "s": "",
          "d": "2019-06-12T17:22:26"
        },
        {
          "n": "00010033.DNG",
          "o": 0,
          "s": "",
          "d": "2019-06-12T17:22:30"
        },
        {
          "n": "00010034.DNG",
          "o": 0,
          "s": "",
          "d": "2019-06-12T17:22:34"
        },
        {
          "n": "00010035.DNG",
          "o": 0,
          "s": "",
          "d": "2019-06-12T17:22:40"
        }
      ]
    }
  ]
}
```

#### `PHOTOS`

`GET 192.168.0.1/v1/photos/136_0806/00010213.DNG?size=full`  
Image show

#### `COMMAND`

`POST http://192.168.0.1/_gr`  
Send commands via form-data

Examples:

- `cmd=brl 2 1` ~> take photo

Headers:

```
Host: 192.168.0.1
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:67.0) Gecko/20100101 Firefox/67.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
Content-Length: 11
Origin: http://www.ricoh-imaging.co.jp
DNT: 1
Connection: keep-alive
Referer: http://www.ricoh-imaging.co.jp/english/products/gr_remote/app/latest/index.html
```

#### `DISPLAY`

`GET http://192.168.0.1/v1/display`  
Stream off camera LCD. To be used in `<img/>` tag

Example:

```html
<html>
  <style>
    .view {
      width: 1200px;
      height: 800px;
      background: url("http://192.168.0.1/v1/display") no-repeat center center;
      background-size: contain;
    }
  </style>
  <div>
    <h1>stream</h1>
    <img class='view'></img>
  </div>
</html>
```
