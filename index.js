var google = require('googleapis');
var url = require('url');

var authentification = new Promise((resolve, reject) => {
  var jwtClient = new google.auth.JWT(
    "bot-199@bot-analitycs.iam.gserviceaccount.com",
    null,
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCj0M+1+8Bse/0U\nZs4oieWeyw6t7ydrhp/hYxQAAbKLAF0++X7g2pi31J8ktsTimvQw0wgCxeRa0IG8\nFFeDIHHXzWlO7jIzy56XivY6+5ZNc2177ZLHnHCWlF+HCb1Q4N4RlClK9zjwzGGC\ngX7CRxG0HSdcr5eqhgxYDuU/vqOcTjDKTH2z+UAATfnRvE8sksIcTYDsky8Budui\nY6rAM/sJ1Tr22lXWzBBRL2a+O15eQ1K7p0RFCDy4UZWRJX78Ws2uw0dYi4RmJQnj\nEvLVGW3S5A+1b9z2DpSlbJU9izAj7TL78dkElV5lCrvwVRBI6Wnrr6nFPWo+/x/A\nvgLG3ul5AgMBAAECggEABWePYBd7sY3k+3DULrXfS6izBchaRRZjx57/WxazP28W\nJHc9GTRXuII9Howhx8DJUKO4Y8Wync+7kABzI1eFL1OkEfS9gZmfVFbt07lW1pxP\nHuO80CAYU3zMAAZcEW3cdbkCeb+D8zx9n710+KTj78zMbnw5OpOB7Gp6uWp+jFq3\nHeHFmFk3zIalP+lU5dwqosREKHCOJqZ6nBsNa2DRkcP89uEffZHAVlcIF47ioKSQ\n4GFCRuLYMXl8S8aUUkN5UrUtvXNv5GhGFC+UgGvnXATTYgj4lwIgk2H6ept/qS/4\nJQuJlxlTigCNeTn9tVZHke8GD2dGCEciKdi+F+QA7wKBgQDj/CyOgxxc5sxPef9c\nk1T7p6UxpqF6qCBxCjUCeMSUAtA6PJFHY6C8GTiZQtB+okc5HLs8YZFHtGX+hHGd\nbyq3VrKGKwQfg2zLd42MCZSv20Co5EZy8U1n6GSAYxKzza0fwMzZqQaRYQGhBvDx\nxex84IUuLs+3lsMCpir3nQJnKwKBgQC38ghlLoRYmiyVEEEk0R5NFYjsRELlcRsh\nyc/gF89uTI2HrfsvPlqkB2p8vhlVcKjc3k8c4yeAX56UFBPzcs8WgAZwtboRaZjK\nZJ2Ia5svXS8BrkBKOw38jGwMBb+Xqkx3wC8+Jw6yGaH2Swkd8KW3PsHlpJjSnneJ\nnpnq+4Qf6wKBgQChSZnMCH1cS/tmjoxV1fVdQ7Dee1/qAl9RGUN/SCjp/UOKr6an\ntpfT+pPL+TS/Idb5VJYxlWTOMZWmhdRK6IZzxeXufSghkzy4hQ+ibnS+JIKN+VDN\nqGB2jjXrjiuBAJTlzeQeaDG5T8NzRBHZOYign8YYcg2JeCLmEOB85Jr6mQKBgAfD\ncVND6VYL+8G20+kH4m2CcSr3npMseOauK9Xba2fOV1LYpvdRfGXb4kStiUgv3xCj\nWVdwxuQGJR0+07C8sbzTXnI3WUkO2eIA6R0u3XfcSPWbMx9u6qI0EwNW4sU17NBJ\nDjVjVJ1zs4A/nnzjATuArJJSphiNk6H9TaW7Q9JNAoGAZii1ScnXHTqqCUd4fyfh\nZN1vS/RATiguXIjbeI3ZHFISOsLlJZ4KJ0kao23LKMz7G3JZt1Dybm5Kj4uT9y1Z\nB5PpiTZafXWW8uOgU4N3nazUVsscAbDupA0rphqbgsiVlHzCNHoJrWHtAC5yDN0T\nRKyqoaTvCgGM8DWqIjoPrgY=\n-----END PRIVATE KEY-----\n",
    [
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/analytics',
    ],
    null
  );

  jwtClient.authorize(function (err, tokens) {
    if (err) {
      return reject(err);
    }

    return resolve(jwtClient);
  });
});


function getStartDate(req)
{
  var parameters = req.body.result.parameters;
  var contexts = req.body.result.contexts;

  if (parameters.startDate == '') {
    return 'error';
  }

  return parameters.startDate;
}

function getEndDate(req)
{
  var parameters = req.body.result.parameters;
  var contexts = req.body.result.contexts;

  if (parameters.endDate == '') {
    return parameters.startDate;
  }

  return parameters.endDate;
}

function getUrl(req)
{
  var parameters = req.body.result.parameters;

    if (parameters.url == '') {
      return 'ga:pagePath=~.*';
    }

  var parseUrls = url.parse(parameters.url)

  return 'ga:pagePath==' + parseUrls.pathname;
}

exports.analitycs = function analytics(req, res) {
  var intentName = req.body.result.metadata.intentName;
  var startDate = getStartDate(req);
  var endDate = getEndDate(req);
  var filters = getUrl(req);

  if (intentName != 'Stat' || startDate == 'error') {
    return res.send({
      speech: 'Il faut mettre une date svp'
    });
  }

  var analytics = google.analytics('v3');
  authentification.then((jwtClient) =>
    analytics.data.ga.get({
      'ids': 'ga:150243802',
      'start-date': startDate,
      'end-date': endDate,
      'metrics': 'ga:pageviews,ga:sessions',
      'filters': filters,
      'auth': jwtClient
      }, function (err, body) {
        if (err) {
          res.send(err)
        }

        res.send({
          speech: "Le nombre de pages vues entre le " + startDate + " et le " + endDate + " est de " + body.totalsForAllResults['ga:pageviews']
        });
    }))
    .catch((err) => res.send(err));
};
