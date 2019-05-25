# Simulating cookie responses

Although Mirage allows setting headers in a response, the
XMLHttpRequest spec explicitly
[forbids access](http://www.w3.org/TR/XMLHttpRequest/#the-getresponseheader()-method)
to `Set-Cookie` and `Set-Cookie2` headers.  As a result Mirage
responses cannot set cookies via headers.

However, you can simulate receiving cookies from an ajax
call at the browser level by setting them in a route
function handler:

```js
this.post('/users/login', schema => {
  // log in for 24 hours
  let now = new Date();
  let cookieExpiration = new Date(now.getTime() + (24 * 3600 * 1000));
  document.cookie=`remember_me=cookie-content-here; domain=.dev-domain; path=/; expires=${cookieExpiration.toUTCString()};`;

  return schema.users.find(1);
});
```

Your Ember client code will now have access to any cookies set
using `document.cookie`.
