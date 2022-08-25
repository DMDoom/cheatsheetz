export default {
    props: ['color', 'questionToken', 'path', 'answers', 'username'],
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
    computed: {
        questionAnswers() {
            return this.answers.filter(answer => {
                return answer.answerToken === this.questionToken;
            });
        },
        percentageAnswers() {
            // Parse a list of closed answers here, computing their percentage value
            // Return in the format of? Answer: number%?
            // Use calculated percentages for style width %

            // The closed/open question system will not work by globally visually representing new answers without hacky solutions.
            // because the current architecture of the system does not allow for answer to be globally deleted for everyone.
            // This means that after submitting an answer, it cannot be changed or edited or deleted globally by anyone.

            // Possible solution to this:
            // On delete or editing of a answer, send a notify to the server with the answer token
            //
            return null;
        }
    },
    template: `
        <div class="answer-submit">
            <form @submit.prevent="postAnswer">
                <textarea v-model="submitAnswerForm.content" placeholder="Type your answer here..."></textarea>
                <button>Submit answer</button>
            </form>
        </div>
        <div class="answer" v-for="answer in questionAnswers">
            <!-- Only render when answer token matches question token -->
            <div class="answer-submitted-by" :style="{backgroundColor: this.color}">
                <p> {{answer.submittedBy}} </p>
            </div>
            <div class="content">
                <p> {{answer.content}} </p>
            </div>
        </div>
    `
}