//import QuestionHandler

export default {
    data() {
        return {
            questions: []
        }
    },
    methods: {
        fetchStream() {
            const stream = fetch('http://localhost:8080/get-questions-by-token?token=clienttoken');

            const onMessage = obj => console.log(obj);
            const onComplete = () => console.log('The stream has completed');

            stream
              .then(readStream(onMessage))
              .then(onComplete);
        }
    },
    template: `<button @click="fetchStream">Fetch data</button>`
}

/* https://gist.github.com/ornicar/a097406810939cf7be1df8ea30e94f3e */
const readStream = processLine => response => {
  const stream = response.body.getReader();
  const matcher = /\r?\n/;
  const decoder = new TextDecoder();
  let buf = '';

  const loop = () =>
    stream.read().then(({ done, value }) => {
      if (done) {
        if (buf.length > 0) processLine(JSON.parse(buf));
      } else {
        const chunk = decoder.decode(value, {
          stream: true
        });
        buf += chunk;

        const parts = buf.split(matcher);
        buf = parts.pop();
        for (const i of parts.filter(p => p)) processLine(JSON.parse(i));
        return loop();
      }
    });

  return loop();
}