// import io from '../ext/socket.io-wrapper.mjs';
import questionnaire from './questionnaire.mjs';

const answers = new Map();

async function askQuestion(question) {
    if (answers.has(question.id)) return answers.get(question.id);
    const answer = {
        question: question,
        choices:  [],
        columns:  []
    };
    answers.set(question.id, answer);

    for (let relevantIf of question.relevantIf.values()) {
        const relevantAnswer = await askQuestion(relevantIf.question);
        if (relevantAnswer.choices.includes(relevantIf)) continue;
        answer.skipped = true;
        return answer;
    }

    // TODO ask the question

    return answer;
} // askQuestion

let skipped = 0;
for (let question of questionnaire.questions.values()) {
    const answer = await askQuestion(question);
    if (answer.skipped) skipped++;
}

// TODO submit answers back to the server

console.log('skipped:', skipped);
