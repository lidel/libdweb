async function* svgDemo() {
  const encoder = new TextEncoder("utf-8")
  yield encoder.encode("<h1>HTML</h1>").buffer
  yield encoder.encode("<p>ContentType was inferred as HTML").buffer
  yield encoder.encode(`<p>Inlined SVG:<br/> <span style="display: inline-block; border: 1px solid black"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100px" height="150px" viewBox="0 0 10 15" enable-background="new 0 0 10 15" xml:space="preserve">
    <g>
      <path fill="#FFFFFF" d="M5,11c-1.929,0-3.5-1.571-3.5-3.5S3.071,4,5,4s3.5,1.571,3.5,3.5S6.929,11,5,11z"/>
      <path fill="#808080" d="M5,4.588c1.609,0,2.912,1.303,2.912,2.912S6.609,10.412,5,10.412S2.088,9.109,2.088,7.5 S3.391,4.588,5,4.588 M5,3C2.519,3,0.5,5.019,0.5,7.5S2.519,12,5,12s4.5-2.019,4.5-4.5S7.481,3,5,3L5,3z"/>
    </g>
    </svg></span>`).buffer
  yield encoder.encode(
    `<p>Below is the same SVG loaded from <code>dweb://html/dot.svg</code></p>`
  ).buffer
  yield encoder.encode(
    `<p><img src="dweb://html/dot.svg" alt="dot.svg" border="1" style="width:100px;height:150px;" /></p>`
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
        content: svgDemo()
      }
    }
    case "dweb://foo/": {
      return {
        content: svgDemo()
      }
    }
    case "dweb://html/dot.svg": {
      return {
        content: (async function*() {
          const encoder = new TextEncoder("utf-8")
          yield encoder.encode(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100px" height="150px" viewBox="0 0 10 15" enable-background="new 0 0 10 15" xml:space="preserve">
<g>
	<path fill="#FFFFFF" d="M5,11c-1.929,0-3.5-1.571-3.5-3.5S3.071,4,5,4s3.5,1.571,3.5,3.5S6.929,11,5,11z"/>
	<path fill="#808080" d="M5,4.588c1.609,0,2.912,1.303,2.912,2.912S6.609,10.412,5,10.412S2.088,9.109,2.088,7.5 S3.391,4.588,5,4.588 M5,3C2.519,3,0.5,5.019,0.5,7.5S2.519,12,5,12s4.5-2.019,4.5-4.5S7.481,3,5,3L5,3z"/>
</g>
</svg>`).buffer
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
