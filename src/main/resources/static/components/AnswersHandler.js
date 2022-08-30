export default {
    props: ['color', 'questionToken', 'path', 'answers', 'username'],
    data() {
        return {
            collapseOrExpand: "Collapse",
            showAnswers: true,
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
        },
        toggleAnswers() {
            if (this.collapseOrExpand === "Collapse") {
                this.collapseOrExpand = "Expand";
            } else {
                this.collapseOrExpand = "Collapse"
            }

            this.showAnswers = !this.showAnswers;
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
            return null;
        }
    },
    template: `
        <button @click="toggleAnswers"> {{collapseOrExpand}} </button>
        <div class="answer-submit" v-if="this.showAnswers">
            <form @submit.prevent="postAnswer">
                <textarea v-model="submitAnswerForm.content" placeholder="Type your answer here..."></textarea>
                <button>Submit answer</button>
            </form>
        </div>
        <div class="answer" v-if="this.showAnswers" v-for="answer in questionAnswers">
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