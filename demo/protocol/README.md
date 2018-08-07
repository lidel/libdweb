# `dweb://` Range Request Sandbox

Context: https://github.com/mozilla/libdweb/issues/36#issuecomment-413374334

## Running

```console
$ npm run demo:protocol
```

## About Sandbox

The most user-facing use for range requests is seeking videos:
`<video src="dweb://path/to/video.webm">`

There are three resources that illustrate existing issues:

<dl>
<dt>dweb://http/video.webm</dt>
<dd>WEBM payload is fetched by the protocol handler via multiple range requests
over HTTP.  I've set chunk size to 1024 bytes on purpose: it makes video load
much slower than it should, which enables us to observe buffering progress
without resorting to a huge video. </dd>

<dt>dweb://ipfs/video.webm</dt>
<dd>The same payload is fetched over IPFS. Same chunking setup, embedded
js-ipfs is fetching byte ranges using IPFS version of range requests.</dd>

<dt>dweb://html/</dt>
<dd>
A simple HTML page that has three players for the same video loaded over different transports:

1) Native http:// to a server with valid HTTP Range support (HTTP Gateway for IPFS)
2) dweb://http/video.webm
3) dweb://ipfs/video.webm.

There is no preload nor autostart, you need to click on play button to initialize download (to test each transport in isolation).
</dd>
</dl>


## What is missing?

In both cases video player for a video loaded over `dweb://` is unable to jump
forward.  User should be able to click in 3/4 of video and what should happen
is browser should stop download and resume it from the offset picked by the
user.

What happens in `http://`  is the browser sends `Range` request starting with
offset picked by the user.

**We don't have semantics for range requests in `dweb://` and `<video>` player
ignores user's attempts to jump forward** :crying_cat_face:


