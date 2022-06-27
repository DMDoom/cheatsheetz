export default {
    props: {
        socket: {
          type: Object,
          default: null
        }
    },
    data() {
        return {
            // array of questions
            questions: []
        }
    },
    methods() {
        // define functionality of onNext, backpressure etc. on receiving questions through socket
        // push questions to questions array
    },
    template: `
    // v-for rendering of each object on questions
    `
}