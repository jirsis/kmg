# kmg
Show KynderMyGarden information in MagicMirror2

## 

Flujo de ejecución de las llamadas

<pre>
-> https --form POST https://kindermygarden.schooltivity.com/sign-in/guest/ guest_code='<token>'

<- <br>
HTTP/1.1 302 FOUND
Connection: keep-alive
Content-Language: es
Content-Length: 0
Content-Type: text/html; charset=utf-8
Date: Sat, 25 Aug 2018 11:33:49 GMT
Location: http://kindermygarden.schooltivity.com/agendas/
Server: Apache/2.4.27 (Amazon) mod_wsgi/3.5 Python/2.7.13
Set-Cookie: csrftoken=xxxxxxxxxxxxxxxxxxxxxxxx; expires=Sat, 24-Aug-2019 11:33:49 GMT; Max-Age=31449600; Path=/
Set-Cookie: sessionid=XXXXXXXXXXXXXXXXXXXXXXXX; expires=Sat, 08-Sep-2018 11:33:49 GMT; httponly; Max-Age=1209600; Path=/
Vary: Cookie,Accept-Language,Host,X-Forwarded-Proto,User-Agent
X-Frame-Options: SAMEORIGIN
</pre>

<pre>
-> https https://kindermygarden.schooltivity.com/api/agendas/student/23930/entries/ 'cookie:sessionid=XXXXXXXXXXXXXXXXXXXXXXXX'
<- <br>
[
  {
    "date": "2018-08-24",
    "menu": {
      "brunch": "desayuno",
      "first_course": "primer plato",
      "second_course": "segundo plato",
      "dessert": "postre",
      "snack": "Snack title",
      [...]
    },
    "agenda": {
      "today": "Título del día!"
      [...]
    },
    "entry": {
      "brunch": 2,
      "first_course": 2,
      "second_course": 2,
      "dessert": 2,
      "snack": -1,
      "nap": 2,
      "naps": [
        {
          "finish_hours": 14,
          "start_hours": 13,
          "quality": 2,
          "finish_minutes": 50,
          "start_minutes": 10
        }
      ],
      "diaper_urination": 3,
      "diaper_depositions": 1,
      "wc_urination": 0,
      "wc_depositions": 0,
      "note": "Nota resumen del día actual",
      [...]
    }
  },
  { [...] }
]
</pre>
