import * as setup from './setup.mjs';

const
    questionnaire  = await setup.loadQuestionnaire(),
    answers        = setup.factory.dataset(),
    criteriaGroups = new Map(setup.extractObjects(
        questionnaire,
        setup.individuals.questionnaire,
        setup.properties.criteriaGroup
    ).map(criteriaGroup => [criteriaGroup.value, criteriaGroup])),
    questions      = new Map(setup.extractObjects(
        questionnaire,
        setup.individuals.questionnaire,
        setup.properties.criteriaGroup,
        setup.properties.question
    ).map(question => [question.value, question]));

console.log('questions: ' + questions.size);
console.log('criteriaGroups: ' + criteriaGroups.size);

for (let criteriaGroup of criteriaGroups.values()) {
    const
        criteriaQuestions = new Map(setup.extractObjects(
            questionnaire,
            criteriaGroup,
            setup.properties.question
        ).map(question => [question.value, question]));

    console.log(criteriaGroup.value.replace(setup.uris.ids3c_co, '- ') + ': ' + criteriaQuestions.size);
}
