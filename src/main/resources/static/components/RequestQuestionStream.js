// RequestQuestionStream is the parent question handler, which uses AnswerHandler component to render answers for each individual question
// Requests two streams from a room specified by a room token: question and answer ndjson stream
// Answers to questions are filtered and rendered using individual question tokens that are randomly generated upon question submissions

// TODO:
// add chat
// add usernames (not actual accounts, just nicknames you join with, a popup on page load)

import AnswersHandler from './AnswersHandler.js'

export default {
    components: {
        AnswersHandler
    },
    data() {
        return {
            path: "",
            questions: [],
            answers: [],
            submitQuestionForm: {
                content: "",
                submittedBy: ""
            }
        }
    },
    methods: {
        async fetchQuestionsStream() {
            console.log("Connecting questions listener to room token: " + this.path);
            const stream = fetch("http://localhost:8080/get-questions-by-token?token=" + this.path);
            const onMessage = obj => this.questions.push(obj);
            const onComplete = () => console.log('The question stream has completed');

            stream
              .then(readStream(onMessage))
              .then(onComplete);
        },
        async fetchAnswersStream() {
            console.log("Connecting ROOM answers listener to room token: " + this.path);
            const stream = fetch("http://localhost:8080/get-answers-by-token?token=" + this.path);
            const onMessage = obj => this.answers.push(obj);
            const onComplete = () => console.log('The answer stream has completed');

            stream
              .then(readStream(onMessage))
              .then(onComplete);
        },
        async postQuestion() {
            this.submitQuestionForm.submittedBy = "placeholder";
            const response = await fetch("http://localhost:8080/submit-question?token=" + this.path, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.submitQuestionForm)
            })

            console.log("Submitted question successfully: " + response.json());
        }
    },
    created() {
        this.path = window.location.pathname.split('/')[2];
    },
    mounted() {
        this.fetchQuestionsStream();
        this.fetchAnswersStream();
    },
    template: `
        <div class="question-submit">
            <form @submit.prevent="postQuestion">
                <textarea v-model="submitQuestionForm.content" placeholder="Type your question here..."></textarea>
                <button>Submit answer</button>
            </form>
        </div>
        <div class="card" v-for="question in questions">
            <!-- Question space -->
            <div class="question" :style="{backgroundColor: question.hexColor}" >
                <div class="question-submitted-by" style="background-color: #43506C;">
                    <h2> {{question.submittedBy}} </h2>
                </div>
                <div class="content">
                    <h2><span class="question-number">1. </span>{{question.content}}</h2>
                </div>
            </div>
            <!-- Answers space -->
            <!-- Have a single answer stream that is listened to here and pass the list of questions to individual questions to filter instead -->
            <!-- This will reduce the amount of connections open to two -->
            <div class="answers">
                <AnswersHandler :path="this.path" :question-token="question.questionToken" :answers="this.answers"/>
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