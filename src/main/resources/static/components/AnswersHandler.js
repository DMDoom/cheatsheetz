export default {
    props: ['questionToken', 'path', 'answers', 'username'],
    data() {
        return {
            submitAnswerForm: {
                content: "",
                submittedBy: "",
                answerToken: ""
            }
        }
    },
    methods: {
        async postAnswer() {
            this.submitAnswerForm.submittedBy = this.username;
            this.submitAnswerForm.answerToken = this.questionToken;

            const response = await fetch("http://localhost:8080/submit-answer?token=" + this.path, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.submitAnswerForm)
            })

            console.log("Submitted answer successfully: " + response.json());
        }
    },
    template: `
        <div class="answer-submit">
            <form @submit.prevent="postAnswer">
                <textarea v-model="submitAnswerForm.content" placeholder="Type your answer here..."></textarea>
                <button>Submit answer</button>
            </form>
        </div>
        <div class="answer" v-for="answer in answers">
            <!-- Only render when answer token matches question token -->
            <div v-if="answer.answerToken === this.questionToken">
                <div class="answer-submitted-by" style="background-color: #EF4B4C;">
                    <p> {{answer.submittedBy}} </p>
                </div>
                <div class="content">
                    <p> {{answer.content}} </p>
                </div>
            </div>
        </div>
    `
}