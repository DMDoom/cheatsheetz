// RequestQuestionStream is the parent question handler, which uses AnswerHandler component to render answers for each individual question
// Requests two streams from a room specified by a room token: question and answer ndjson stream
// Answers to questions are filtered and rendered using individual question tokens that are randomly generated upon question submissions

// TODO:
// add answer edit/delete functionality
// add active users list
// add chat
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
                submittedBy: "",
                questionToken: "",
                hexColor: "",
                closedAnswers: [],
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
            this.clearQuestionForm();
        },
        async updateQuestion() {
            this.submitQuestionForm.submittedBy = this.username;
            const response = await fetch("http://localhost:8080/update-question?token=" + this.path, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.submitQuestionForm)
            })

            const data = await response.json();
            console.log("Updated question successfully: " + JSON.stringify(data));
            this.editMode = false;
            this.clearQuestionForm();
        },
        clearQuestionForm () {
            this.submitQuestionForm.content = "";
            this.submitQuestionForm.questionToken = "";
            this.submitQuestionForm.hexColor = "";
            this.submitQuestionForm.number = "";
            this.submitQuestionForm.closedAnswers = [];
            this.submitQuestionForm.blacklisted = false;
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
            this.submitQuestionForm.content = question.content;
            this.submitQuestionForm.questionToken = question.questionToken;
            this.submitQuestionForm.hexColor = question.hexColor;
            this.submitQuestionForm.number = question.number;
            this.submitQuestionForm.closedAnswers = question.closedAnswers;
            this.submitQuestionForm.blacklisted = false;
        },
        deleteQuestion(token) {
            this.submitQuestionForm.questionToken = token;
            this.submitQuestionForm.blacklisted = true;
            this.updateQuestion();
        },
        addClosedAnswer() {
            this.submitQuestionForm.closedAnswers.push({value: ''});
        },
        removeClosedAnswer() {
            this.submitQuestionForm.closedAnswers.pop();
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
        <div class="popup" v-show="this.username === ''">
            <div class="popup-content">
                <h2> Enter nickname </h2>
                <input id="username-input" name="username" type="text"/>
                <button @click="updateUsername">Join</button>
            </div>
        </div>
        <div class="popup" v-show="this.alertDuplicate">
            <div class="popup-content">
                <h2> The question you are trying to submit may be a duplicate! </h2>
                <button @click="acceptQuestion" class="accept" type="submit">Submit anyway</button>
                <button @click="rejectQuestion" class="reject" type="submit">Don't submit</button>
            </div>
        </div>
        <div class="popup" v-show="this.editMode">
            <div class="popup-content">
                <!-- UPDATE QUESTION CONTENT -->
                <form @submit.prevent="updateQuestion">
                    <input type="text" v-model="submitQuestionForm.number">
                    <textarea v-model="submitQuestionForm.content"></textarea>
                    <div v-for="(question, index) in submitQuestionForm.closedAnswers">
                        <input v-model="question.value" :key="index">
                    </div>
                    <button type="button" @click="addClosedAnswer">Add closed answer</button>
                    <button type="button" @click="removeClosedAnswer">Remove closed answer</button>
                    <button type="submit">Update question</button>
                </form>
            </div>
        </div>
        <div class="card">
            <div v-show="!editMode" class="question-submit">
                <form @submit.prevent="checkDuplicatesBeforePostingQuestion">
                    <input type="text" v-model="submitQuestionForm.number" placeholder="Question number...">
                    <textarea v-model="submitQuestionForm.content" placeholder="Type your question here..."></textarea>
                    <div v-for="(question, index) in submitQuestionForm.closedAnswers">
                        <input v-model="question.value" :key="index">
                    </div>
                    <button type="button" @click="addClosedAnswer">Add closed answer</button>
                    <button type="button" @click="removeClosedAnswer">Remove closed answer</button>
                    <button type="submit">Submit question</button>
                </form>
            </div>
        </div>
        <div class="card" v-for="question in sortedQuestions">
            <!-- Question space -->
            <div class="question" :style="{backgroundColor: question.hexColor}" >
                <div class="question-submitted-by" style="background-color: #43506C;">
                    <h2> {{question.submittedBy}} </h2>
                </div>
                <div class="content">
                    <h2><span class="question-number" v-if="question.number > 0">{{question.number}}. </span>{{question.content}}</h2>
                </div>
                <div class="edit-buttons" v-if="this.username === question.submittedBy">
                    <button @click="enterEditMode(question.questionToken)" type="submit">Edit</button>
                    <button @click="deleteQuestion(question.questionToken)" type="submit">Delete</button>
                </div>
            </div>
            <!-- CLOSED ANSWERS -->
            <div class="closed-answers-options" v-if="question.closedAnswers.length > 0" >
                <div class="closed-answer" v-for="closedAnswer in question.closedAnswers" :style="{backgroundColor: question.hexColor}">
                    <p> {{closedAnswer.value}} </p>
                </div>
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