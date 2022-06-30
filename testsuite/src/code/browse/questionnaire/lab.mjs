import rdflib from '../ext/rdflib-2.2.19.mjs';

const
    baseURI     = location.href,
    contentType = 'application/ld+json',
    response    = await fetch('questionnaire', {headers: {'Accept': contentType}}),
    payload     = await response.text(),
    dataset     = new rdflib.Store();

await new Promise((resolve, reject) => rdflib.parse(
    payload,
    dataset,
    baseURI,
    contentType,
    (err, result) => err ? reject(err) : resolve(result)
));

const
    RDF               = dataset.ns('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
    RDFS              = dataset.ns('http://www.w3.org/2000/01/rdf-schema#'),
    DCT               = dataset.ns('http://purl.org/dc/terms/'),
    XSD               = dataset.ns('http://www.w3.org/2001/XMLSchema#'),
    IDS3CM            = dataset.ns('https://w3id.org/ids3cm/'),
    IDS3C_CO          = dataset.ns('https://w3id.org/ids3c-component/'),
    questionnaireNode = IDS3C_CO('IDS_CheckListApproach_Questionnaire'),
    questionnaire     = {
        id:          questionnaireNode.value,
        type:        dataset.any(questionnaireNode, RDF('type'), null)?.value,
        label:       dataset.any(questionnaireNode, RDFS('label'), null)?.value,
        description: dataset.any(questionnaireNode, DCT('description'), null)?.value,
        groups:      new Map(),
        questions:   new Map(),
        choices:     new Map(),
        columns:     new Map(),
        IDS3CM:      (val) => IDS3CM(val).value,
        IDS3C_CO:    (val) => IDS3C_CO(val).value
    };

for (let {object: criteriaGroupNode} of dataset.match(questionnaireNode, IDS3CM('criteriaGroup'), null)) {
    const criteriaGroup = {
        id:          criteriaGroupNode.value,
        type:        dataset.any(criteriaGroupNode, RDF('type'), null)?.value,
        label:       dataset.any(criteriaGroupNode, RDFS('label'), null)?.value,
        description: dataset.any(criteriaGroupNode, DCT('description'), null)?.value,
        questions:   new Map()
    };
    questionnaire.groups.set(criteriaGroup.id, criteriaGroup);
    for (let {object: questionNode} of dataset.match(criteriaGroupNode, IDS3CM('question'), null)) {
        const question = {
            id:          questionNode.value,
            type:        dataset.any(questionNode, RDF('type'), null)?.value,
            label:       dataset.any(questionNode, RDFS('label'), null)?.value,
            description: dataset.any(questionNode, DCT('description'), null)?.value,
            mandatory:   dataset.any(questionNode, IDS3CM('mandatory'), null)?.value === 'true',
            group:       criteriaGroup,
            choices:     new Map(),
            columns:     new Map(),
            relevantIf:  new Map()
        };
        questionnaire.questions.set(question.id, question);
        criteriaGroup.questions.set(question.id, question);
        for (let {object: choiceNode} of dataset.match(questionNode, IDS3CM('validChoice'), null)) {
            const choice = {
                id:          choiceNode.value,
                type:        dataset.any(choiceNode, RDF('type'), null)?.value,
                label:       dataset.any(choiceNode, RDFS('label'), null)?.value,
                description: dataset.any(choiceNode, DCT('description'), null)?.value,
                validChoice: true,
                question:    question,
                relevantFor: new Map()
            };
            questionnaire.choices.set(choice.id, choice);
            question.choices.set(choice.id, choice);
        }
        for (let {object: choiceNode} of dataset.match(questionNode, IDS3CM('invalidChoice'), null)) {
            const choice = {
                id:          choiceNode.value,
                type:        dataset.any(choiceNode, RDF('type'), null)?.value,
                label:       dataset.any(choiceNode, RDFS('label'), null)?.value,
                description: dataset.any(choiceNode, DCT('description'), null)?.value,
                validChoice: false,
                question:    question,
                relevantFor: new Map()
            };
            questionnaire.choices.set(choice.id, choice);
            question.choices.set(choice.id, choice);
        }
        for (let {object: columnNode} of dataset.match(questionNode, IDS3CM('matrixColumn'), null)) {
            const column = {
                id:          columnNode.value,
                type:        dataset.any(columnNode, RDF('type'), null)?.value,
                label:       dataset.any(columnNode, RDFS('label'), null)?.value,
                description: dataset.any(columnNode, DCT('description'), null)?.value,
                question:    question
            };
            questionnaire.columns.set(column.id, column);
            question.columns.set(column.id, column);
        }
        for (let {object: choiceNode} of dataset.match(questionNode, IDS3CM('relevantIf'), null)) {
            question.relevantIf.set(choiceNode.value, null);
        }
    }
}

for (let question of questionnaire.questions.values()) {
    for (let choiceId of question.relevantIf.keys()) {
        const choice = questionnaire.choices.get(choiceId);
        if (!choice) {
            question.relevantIf.delete(choiceId);
            continue;
        }
        question.relevantIf.set(choice.id, choice);
        choice.relevantFor.set(question.id, question);
    }
}

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
