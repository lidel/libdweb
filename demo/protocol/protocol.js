async function* webmDemo() {
  const encoder = new TextEncoder("utf-8")
  yield encoder.encode("<h1>HTML</h1>").buffer
  yield encoder.encode("<p>ContentType was inferred as HTML").buffer
  yield encoder.encode(
    `<p>&lt;video src="<span class="aqua">dweb://html/video.webm" /&gt;</p>`
  ).buffer
  yield encoder.encode(
    `<p>
    <video class="shadow-2 bg-navy-muted" width="640" height="360" style="background-color: #ccc; border: 1px dotted black" autoplay loop muted>
      <source src="dweb://html/video.webm" type="video/webm">
    </video>
    </p>`
  ).buffer
}

browser.protocol.registerProtocol("dweb", request => {
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
    case "dweb://html/video.webm": {
      return {
        content: (async function*() {
          const response = await fetch(
            "https://ipfs.io/ipfs/bafybeigwa5rlpq42cj3arbw27aprhjezhimhqkvhbb2kztjtdxyhjalr3q/big-buck-bunny_trailer.webm",
            {
              mode: "cors",
              cache: "force-cache"
            }
          )
          console.log("response", response)
          const payload = await response.arrayBuffer()
          yield payload
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
            `<p>You've succesfully loaded <strong>${request.url}</strong><p>`
          ).buffer
        })()
      }
    }
  }
})
