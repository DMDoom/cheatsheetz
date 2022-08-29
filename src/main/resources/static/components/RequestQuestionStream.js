// RequestQuestionStream is the parent question handler, which uses AnswerHandler component to render answers for each individual question
// Requests two streams from a room specified by a room token: question and answer ndjson stream
// Answers to questions are filtered and rendered using individual question tokens that are randomly generated upon question submissions

// TODO:
// add question and answer client-side delete buttons
// add global delete/edit buttons

// add active users list
// add chat

// can delete from the list of questions/answers by specifying a list of deleted questions/answers which will not render
// this can be made global by sending said list to the server to pass onto the rest of the users, or local, by keeping it to the user session

import AnswersHandler from './AnswersHandler.js'

export default {
    components: {
        AnswersHandler
    },
    data() {
        return {
            path: "",
            questions: new Map(),
            answers: [],
            username: "",
            editMode: false,
            alertDuplicate: false,
            submitQuestionForm: {
                number: "",
                content: "",
                submittedBy: ""
            },
            updateQuestionForm: {
                number: "",
                content: "",
                submittedBy: "",
                questionToken: "",
                hexColor: "",
                blacklisted: false
            }
        }
    },
    methods: {
        async fetchQuestionsStream() {
            console.log("Connecting questions listener to room token: " + this.path);
            const stream = fetch("http://localhost:8080/get-questions-by-token?token=" + this.path);
            const onMessage = obj => {
                if (obj.blacklisted) {
                    this.questions.delete(obj.questionToken);
                } else {
                    this.questions.set(obj.questionToken, obj);
                }
            }
            const onComplete = () => console.log('The question stream has completed');

            stream
              .then(readStream(onMessage))
              .then(onComplete);
        },
        async fetchAnswersStream() {
            console.log("Connecting answers listener to room token: " + this.path);
            const stream = fetch("http://localhost:8080/get-answers-by-token?token=" + this.path);
            const onMessage = obj => this.answers.push(obj);
            const onComplete = () => console.log('The answer stream has completed');

            stream
              .then(readStream(onMessage))
              .then(onComplete);
        },
        checkDuplicatesBeforePostingQuestion() {
            if (this.checkForDuplicates(this.submitQuestionForm.content)) {
                this.alertDuplicate = true;
            } else {
                this.postQuestion();
            }
        },
        async postQuestion() {
            this.submitQuestionForm.submittedBy = this.username;
            const response = await fetch("http://localhost:8080/submit-question?token=" + this.path, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.submitQuestionForm)
            })

            const data = await response.json();
            console.log("Submitted question successfully: " + JSON.stringify(data));
        },
        async updateQuestion() {
            this.updateQuestionForm.submittedBy = this.username;
            const response = await fetch("http://localhost:8080/update-question?token=" + this.path, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.updateQuestionForm)
            })

            const data = await response.json();
            console.log("Updated question successfully: " + JSON.stringify(data));
            this.editMode = false;
        },
        rejectQuestion() {
            this.alertDuplicate = false;
        },
        acceptQuestion() {
            this.alertDuplicate = false;
            this.postQuestion();
        },
        /* Might also notify the server of user joining, sending simple String to the backend */
        async updateUsername() {
            this.username = document.getElementById('username-input').value;
            console.log("Username set: " + this.username);
        },
        checkForDuplicates(questionToSubmit) {
            // Count word frequency of passed question
            var submitWords = questionToSubmit.toString().split(" ");
            var submitWordFreq = new Map();
            for (const word of submitWords) {
                submitWordFreq.set(word, (submitWordFreq.get(word) || 0) + 1);
            }

            // Compare against word frequency of existing questions
            for (const presentQuestion of this.questions.values()) {
                // Count frequency of existing question
                var presentWords = presentQuestion.content.toString().split(" ");
                var presentWordFreq = new Map();
                for (const word of presentWords) {
                    presentWordFreq.set(word, (presentWordFreq.get(word) || 0) + 1);
                }

                // Check for mismatched length
                var twentyPercent = 0.2 * submitWords.length;
                if (Math.abs(submitWords.length - presentWords.length) > twentyPercent) {
                    continue;
                }

                var mismatchCount = 0;
                for (const word of submitWordFreq.keys()) {
                    if (!presentWordFreq.has(word)) {
                        mismatchCount++;
                        continue;
                    }

                    mismatchCount += Math.abs((presentWordFreq.get(word) - submitWordFreq.get(word)));
                }

                // If mismatch count is less than 20%, alert of possible duplicate
                if (mismatchCount <= twentyPercent) {
                    return true;
                }
            }

            return false;
        },
        enterEditMode(token) {
            this.editMode = true;

            // Prepopulate fields
            const question = this.questions.get(token);
            this.updateQuestionForm.content = question.content;
            this.updateQuestionForm.questionToken = question.questionToken;
            this.updateQuestionForm.hexColor = question.hexColor;
            this.updateQuestionForm.number = question.number;
            this.updateQuestionForm.blacklisted = false;
        },
        deleteQuestion(token) {
            this.updateQuestionForm.questionToken = token;
            this.updateQuestionForm.blacklisted = true;
            this.updateQuestion();
        }
    },
    created() {
        this.path = window.location.pathname.split('/')[2];
    },
    mounted() {
        this.fetchQuestionsStream();
        this.fetchAnswersStream();
    },
    computed: {
        sortedQuestions() {
            const arr = Array.from(this.questions.values());
            return arr.sort((a, b) => (a.number > b.number ? 1 : -1));
        }
    },
    template: `
        <div class="popup" v-if="this.username === ''">
            <div class="popup-content">
                <h2> Enter nickname </h2>
                <input id="username-input" name="username" type="text"/>
                <button @click="updateUsername">Join</button>
            </div>
        </div>
        <div class="popup" v-if="this.alertDuplicate">
            <div class="popup-content">
                <h2> The question you are trying to submit may be a duplicate! </h2>
                <button @click="acceptQuestion" class="accept" type="submit">Submit anyway</button>
                <button @click="rejectQuestion" class="reject" type="submit">Don't submit</button>
            </div>
        </div>
        <div class="question-submit">
            <form @submit.prevent="checkDuplicatesBeforePostingQuestion">
                <input type="text" v-model="submitQuestionForm.number" placeholder="Question number...">
                <textarea v-model="submitQuestionForm.content" placeholder="Type your question here..."></textarea>
                <button>Submit answer</button>
            </form>
        </div>
        <div class="card" v-for="question in sortedQuestions">
            <div class="popup" v-if="this.editMode">
                <div class="popup-content">
                    <!-- UPDATE QUESTION CONTENT -->
                    <form @submit.prevent="updateQuestion">
                        <input type="text" v-model="updateQuestionForm.number">
                        <textarea v-model="updateQuestionForm.content"></textarea>
                        <button type="submit">Update question</button>
                    </form>
                </div>
            </div>
            <!-- Question space -->
            <div class="question" :style="{backgroundColor: question.hexColor}" >
                <div class="question-submitted-by" style="background-color: #43506C;">
                    <h2> {{question.submittedBy}} </h2>
                </div>
                <div class="content">
                    <h2><span class="question-number" v-if="question.number > 0">{{question.number}}. </span>{{question.content}}</h2>
                </div>
                <button @click="enterEditMode(question.questionToken)" type="submit">Edit</button>
                <button @click="deleteQuestion(question.questionToken)" type="submit">Delete</button>
            </div>
            <!-- Answers space -->
            <!-- Have a single answer stream that is listened to here and pass the list of questions to individual questions to filter instead -->
            <!-- This will reduce the amount of connections open to two -->
            <div class="answers">
                <AnswersHandler
                    :color="question.hexColor"
                    :username="this.username"
                    :path="this.path"
                    :question-token="question.questionToken"
                    :answers="this.answers"
                />
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