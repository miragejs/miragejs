# Refactoring Server, adding a Route Handler object

permalink: /blog/2015/09/15/router-handler/

Updating the shorthands to work with the serializer layer proved harder than I thought. Serializers made it clear that the shorthands were making assumptions about the shape of the JSON payload. Now that users will be able to use serializers to transform how their data looks going out, I'll also need a way for them to specify how the data looks coming in. This is similar to Ember Data's `normalize` function.

If a user is using a PUT or POST shorthand, I'll need to first deserialize the payload into a standard format, so the shorthands know what to do with it. I'll use the JSON:API format for the standard; that way, if you're using JSON:API, `normalize` will be a no-op, and AMS-style responses will simply convert to JSON:API.

This sounds a lot like Ember Data, and I've even considered using Ember Data for the data store/identity map portion of Mirage; but at this point, there are still too many unknowns. I'd rather get the rest of the main features incorporated + wait for the API to stabilize, before making such a big decision.

Mirage's ORM has very different needs than Ember Data's: it's a synchronous in-memory store, and while ED also has a clientside store, it was designed around an async layer, incorporates Ember.Object for KVO, requires attr declarations, and much more. Mirage's orm uses `object.defineProperty` to keep things as lightweight as possible, so you'll be able to `user.createPost`, `user.posts = [1]`, `post.user = user` etc. in your routes. Adding the ceremony of  `.get(), `.set()`, and `createRecord` everywhere would make Mirage feel like more of a burden, and I think it's important to try to keep things as slim and easy-to-use as possible, given that Mirage is designed for mocking.

In any case, the shorthands were originally simple functions that were unit tested. Now that there's a bit more going on, I felt the need to refactor the server/controller code a bit. I also got around to slimming down the initializer, moving that code to the Server, and moving a lot of route-handling-related code from Server to a new RouteHandler class. My next step will be to turn the shorthand functions into RouteHandlers (probably subclasses), which will hopefully provide some direction on how the data will flow from request, through normalize, to the shorthands and out to a response.
