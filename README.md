# Installtion

```npm i ifunny-chat.js```

Now, the library wont work from start because of an error with wampys Json Serializer, to fix this error, goto `node_modules\wampy\dist\wampy.js`
Once there, goto line 670, and change that line to ```serverProtocol = "json"```
This fixes the bug, when i find a way to do it natively, i will add it. The reason the problem exits is likely an issue with the websocket client. Editing that line will fix that. It forces the function to return without sending the hello message to the websocket, which times out the webocket.

More coming