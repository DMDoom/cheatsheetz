export default {
    props: ['questionToken', 'path'],
    data() {
        return {
            answers: [],
            submitAnswerForm: {
                content: "",
                submittedBy: "",
                answerToken: ""
            }
        }
    },
    methods: {
        async fetchStream() {
            console.log("Connecting answers listener to room token: " + this.path);
            console.log("Filtering for question token: " + this.questionToken);
            const stream = fetch("http://localhost:8080/get-answers-by-token?token=" + this.path);
            const onMessage = obj => {
                if (obj.answerToken === this.questionToken) {
                    this.answers.push(obj);
                }
            }
            const onComplete = () => console.log('The stream has completed');

            stream
              .then(readStream(onMessage))
              .then(onComplete);
        },
        async postAnswer() {
            this.submitAnswerForm.submittedBy = "placeholder";
            this.submitAnswerForm.answerToken = this.questionToken;

            const response = await fetch("http://localhost:8080/submit-answer?token=" + this.path, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.submitAnswerForm)
            })

            console.log("Submit successful, response: " + response.json());
        }
    },
    created() {
          const answer = {
            submittedBy: 'John',
            content: 'B',
            answerToken: '134dsfgt'
          };

          if (answer.answerToken === this.questionToken) {
               this.answers.push(answer);
          }
    },
    mounted() {
        this.fetchStream();
    },
    template: `
        <div class="answer-submit">
            <form @submit.prevent="postAnswer">
                <textarea v-model="submitAnswerForm.content" placeholder="Type your answer here..."></textarea>
                <button>Submit answer</button>
            </form>
        </div>
        <div class="answer" v-for="answer in answers">
            <div class="answer-submitted-by" style="background-color: #EF4B4C;">
                <p> {{answer.submittedBy}} </p>
            </div>
            <div class="content">
                <p> {{answer.content}} </p>
            </div>
        </div>
    `
}

/* Read ndjson utility */
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