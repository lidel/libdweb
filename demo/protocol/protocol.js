const ipfs = new window.Ipfs()
ipfs.on("ready", () => {
  console.log("js-ipfs is ready to use!")
  ipfs.id(console.dir)
})

async function* webmDemo() {
  const encoder = new TextEncoder("utf-8")
  yield encoder.encode("<h1>Example of missing support for Range request</h1>")
    .buffer
  yield encoder.encode(
    "<p>Press play and then try jumping forward in video below. In regular HTTP it would generate new request with <code>Range</code> header for specific bytes."
  ).buffer
  yield encoder.encode(
    `<hr><p>&lt;video src="https://ipfs.io/ipfs/(...)/video.webm" /&gt;</p>`
  ).buffer
  yield encoder.encode(
    `<p>
    <video width="640" height="360" style="background-color: #ccc; border: 1px dotted black"
    controls muted preload="none">
      <source src="https://ipfs.io/ipfs/bafybeigwa5rlpq42cj3arbw27aprhjezhimhqkvhbb2kztjtdxyhjalr3q/big-buck-bunny_trailer.webm" type="video/webm">
    </video>
    </p>`
  ).buffer
  yield encoder.encode(
    `<hr><p>&lt;video src="dweb://http/video.webm" /&gt;</p>`
  ).buffer
  yield encoder.encode(
    `<p>
    <video width="640" height="360" style="background-color: #ccc; border: 1px dotted black"
    controls muted preload="none">
      <source src="dweb://http/video.webm" type="video/webm">
    </video>
    </p>`
  ).buffer
  yield encoder.encode(
    `<hr><p>&lt;video src="dweb://ipfs/video.webm" /&gt;</p>`
  ).buffer
  yield encoder.encode(
    `<p>
    <video width="640" height="360" style="background-color: #ccc; border: 1px dotted black"
    controls mutedi preload="none">
      <source src="dweb://ipfs/video.webm" type="video/webm">
    </video>
    </p>`
  ).buffer
}

browser.protocol.registerProtocol("dweb", async request => {
  examples = ["stream", "async", "crash", "text", "html"]
  switch (request.url) {
    case "dweb://stream/": {
      return {
        contentType: "text/html",
        content: (async function*() {
          const encoder = new TextEncoder("utf-8")
          yield encoder.encode("<h1>Say Hi to endless stream!</h1>\n").buffer
          let n = 0
          while (true) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            yield encoder.encode(`<p>Chunk #${++n}<p>`).buffer
          }
        })()
      }
    }
    case "dweb://async/": {
      return new Promise((resolve, reject) => {
        setTimeout(resolve, 100, {
          contentType: "text/plain",
          content: (async function*() {
            const encoder = new TextEncoder("utf-8")
            yield encoder.encode("Async response yo!").buffer
          })()
        })
      })
    }
    case "dweb://crash/": {
      throw Error("Boom!")
    }
    case "dweb://text/": {
      return {
        content: (async function*() {
          const encoder = new TextEncoder("utf-8")
          yield encoder.encode("Just a plain text").buffer
        })()
      }
    }
    case "dweb://html/": {
      return {
        content: webmDemo()
      }
    }
    case "dweb://foo/": {
      return {
        content: webmDemo()
      }
    }
    case "dweb://http/video.webm": {
      return {
        contentType: "video/webm",
        content: (async function*() {
          const url =
            "https://ipfs.io/ipfs/bafybeigwa5rlpq42cj3arbw27aprhjezhimhqkvhbb2kztjtdxyhjalr3q/big-buck-bunny_trailer.webm"
          const urlSize = 2165175

          const chunkLength = 1024
          let offset = 0

          while (offset < urlSize) {
            const response = await fetch(url, {
              headers: {
                range: `bytes=${offset}-${offset + chunkLength}`
              }
            })
            const chunk = await response.arrayBuffer()
            yield chunk
            offset = offset + chunkLength + 1
          }
        })()
      }
    }
    case "dweb://ipfs/video.webm": {
      return {
        contentType: "video/webm",
        content: (async function*() {
          const path =
            "/ipfs/bafybeigwa5rlpq42cj3arbw27aprhjezhimhqkvhbb2kztjtdxyhjalr3q/big-buck-bunny_trailer.webm"
          // IPFS range request would be: const stream = ipfs.files.catReadableStream(path, {offset: 42, length: 2001})
          // https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesaddreadablestream
          const urlSize = 2165175

          const chunkLength = 1024
          let offset = 0

          while (offset < urlSize) {
            const chunk = await ipfs.files.cat(path, {
              offset: offset,
              length: chunkLength
            })
            // covert ipfs.types.Buffer → ArrayBuffer
            yield toArrayBuffer(chunk)
            offset = offset + chunkLength
          }
        })()
      }
    }
    default: {
      return {
        contentType: "text/html",
        content: (async function*() {
          const encoder = new TextEncoder("utf-8")
          yield encoder.encode("<h1>Hi there!</h1>\n").buffer
          yield encoder.encode(
            `<p>You've succesfully loaded <strong>${request.url}</strong><p>
            ${examples
              .map(ex => `<a href=\"dweb://${ex}/\" >${ex}</a>`)
              .join("<br>")}`
          ).buffer
        })()
      }
    }
  }
})

// inlined to-arraybuffer from https://github.com/jhiesey/to-arraybuffer
function toArrayBuffer(buf) {
  const Buffer = ipfs.types.Buffer
  // If the buffer is backed by a Uint8Array, a faster version will work
  if (buf instanceof Uint8Array) {
    // If the buffer isn't a subarray, return the underlying ArrayBuffer
    if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {
      return buf.buffer
    } else if (typeof buf.buffer.slice === "function") {
      // Otherwise we need to get a proper copy
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    }
  }

  if (Buffer.isBuffer(buf)) {
    // This is the slow version that will work with any Buffer
    // implementation (even in old browsers)
    var arrayCopy = new Uint8Array(buf.length)
    var len = buf.length
    for (var i = 0; i < len; i++) {
      arrayCopy[i] = buf[i]
    }
    return arrayCopy.buffer
  } else {
    throw new Error("Argument must be a Buffer")
  }
}
